import { PrismaClient } from "@prisma/client";
import Tesseract from "tesseract.js";
import crypto from "crypto";
import path from "path";

const prisma = new PrismaClient();

// Fresherb SpA (RUT: 77411698-2)
// Address: TRIANA 851 202, Providencia
// Haulmer POS system - verify.haulmer.com

// Keywords to identify a valid Fresherb/MatchaLab receipt
const COMPANY_IDENTIFIERS = [
  "fresherb",
  "fresherb spa",
  "77411698",        // RUT without formatting
  "77.411.698",      // RUT with dots
  "triana 851",      // Address
  "haulmer",         // POS system
];

// Known product names on Haulmer receipts
const PRODUCT_KEYWORDS = [
  "matcha frutilla",
  "matcha coco",
  "matcha limonada",
  "matcha strawberry",
  "matcha coconut",
  "matcha lemonade",
  "matcha",
];

// Valid price patterns to extract from receipt
const VALID_PRICES = [3490, 4990];

// Reusable Tesseract scheduler for faster OCR
let scheduler = null;

async function getScheduler() {
  if (scheduler) return scheduler;
  scheduler = Tesseract.createScheduler();
  const worker = await Tesseract.createWorker("spa");
  scheduler.addWorker(worker);
  return scheduler;
}

/**
 * Generate a hash from OCR text to detect duplicate receipts.
 * We normalize the text (lowercase, remove extra spaces) before hashing.
 */
function generateReceiptHash(rawText) {
  const normalized = rawText
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 1000); // Use first 1000 chars for hash
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Runs OCR on the uploaded voucher image and validates it's from Fresherb SpA.
 * Returns { valid, companyMatch, productMatch, amount, rawText, receiptHash }
 */
async function validateReceipt(imagePath) {
  try {
    const ocr = await getScheduler();
    const { data } = await ocr.addJob("recognize", imagePath);

    const text = data.text.toLowerCase();
    const receiptHash = generateReceiptHash(data.text);

    // 1. Check if receipt is from Fresherb SpA
    const companyMatch = COMPANY_IDENTIFIERS.some((id) => text.includes(id));

    // 2. Check for known product names
    const productMatch = PRODUCT_KEYWORDS.some((p) => text.includes(p));

    // 3. Try to extract a price amount from the text
    let amount = null;
    const pricePatterns = [
      /\$?\s*4[\.\,]?990/g,
      /\$?\s*3[\.\,]?490/g,
      /\$?\s*9[\.\,]?980/g,  // 2x 4990
      /\$?\s*6[\.\,]?980/g,  // 2x 3490
      /\$?\s*8[\.\,]?480/g,  // 3490 + 4990
    ];

    for (const pattern of pricePatterns) {
      if (pattern.test(text)) {
        const match = text.match(pattern);
        if (match) {
          const cleaned = match[0].replace(/[\$\s\.\,]/g, "");
          amount = parseInt(cleaned, 10);
          break;
        }
      }
    }

    const valid = companyMatch;

    return {
      valid,
      companyMatch,
      productMatch,
      amount: amount || (companyMatch ? 4990 : null),
      rawText: data.text.substring(0, 500),
      receiptHash,
    };
  } catch (err) {
    console.error("OCR error:", err);
    return {
      valid: false,
      companyMatch: false,
      productMatch: false,
      amount: null,
      rawText: "",
      receiptHash: null,
      error: err.message,
    };
  }
}

export async function createPurchase(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Imagen del voucher requerida" });
    }

    // Build image path/URL
    const isCloudinary = req.file.path && req.file.path.startsWith("http");
    const imageUrl = isCloudinary
      ? req.file.path
      : `/uploads/${req.file.filename}`;

    // Full path for OCR processing
    const imagePath = isCloudinary
      ? req.file.path
      : path.resolve("uploads", req.file.filename);

    // Run OCR validation on the receipt
    const ocrResult = await validateReceipt(imagePath);

    if (!ocrResult.valid) {
      return res.status(400).json({
        error: "No pudimos verificar la boleta. Asegúrate de que sea una boleta de MatchaLab (Fresherb SpA).",
        details: {
          companyMatch: ocrResult.companyMatch,
          productMatch: ocrResult.productMatch,
        },
      });
    }

    // Check for duplicate receipt using hash
    if (ocrResult.receiptHash) {
      const existingPurchase = await prisma.purchase.findUnique({
        where: { receiptHash: ocrResult.receiptHash },
      });
      if (existingPurchase) {
        return res.status(400).json({
          error: "Esta boleta ya fue registrada anteriormente. Cada boleta solo puede usarse una vez.",
        });
      }
    }

    // Check for discount code (ambassador referral)
    const discountCodeStr = req.body?.discountCode?.toUpperCase?.() || null;
    let appliedDiscount = null;

    if (discountCodeStr) {
      const discountCode = await prisma.discountCode.findUnique({
        where: { code: discountCodeStr },
        include: { ambassador: true },
      });
      if (discountCode && discountCode.active) {
        appliedDiscount = discountCode;
      }
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: req.userId,
        voucherImageUrl: imageUrl,
        amount: ocrResult.amount,
        status: "approved",
        receiptHash: ocrResult.receiptHash,
      },
    });

    // If a valid discount code was used, track commission (15% net)
    if (appliedDiscount && ocrResult.amount) {
      const commissionAmount = Math.round(ocrResult.amount * 0.15);
      await prisma.$transaction([
        prisma.commission.create({
          data: {
            ambassadorId: appliedDiscount.ambassadorId,
            discountCodeId: appliedDiscount.id,
            purchaseId: purchase.id,
            saleAmount: ocrResult.amount,
            commissionRate: 0.15,
            commissionAmount,
          },
        }),
        prisma.discountCode.update({
          where: { id: appliedDiscount.id },
          data: { timesUsed: { increment: 1 } },
        }),
      ]);
    }

    // Auto-generate ticket on approval
    const ticket = await prisma.ticket.create({
      data: {
        userId: req.userId,
        purchaseId: purchase.id,
      },
    });

    const ticketCount = await prisma.ticket.count({
      where: { userId: req.userId, redeemed: false },
    });

    res.status(201).json({
      purchase,
      ticket,
      ticketCount,
      ocrInfo: {
        productDetected: ocrResult.productMatch,
        amountDetected: ocrResult.amount,
      },
      discountApplied: appliedDiscount
        ? { code: appliedDiscount.code, percent: appliedDiscount.discountPercent }
        : null,
    });
  } catch (err) {
    console.error("CreatePurchase error:", err);
    res.status(500).json({ error: "Error al registrar compra" });
  }
}

export async function getPurchases(req, res) {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { ticket: true },
    });

    res.json({ purchases });
  } catch (err) {
    console.error("GetPurchases error:", err);
    res.status(500).json({ error: "Error al obtener compras" });
  }
}
