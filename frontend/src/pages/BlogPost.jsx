import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../data/blogData";

function renderBlock(block, i) {
  switch (block.type) {
    case "heading":
      return (
        <h2 key={i} className="font-display font-bold text-2xl text-matcha-900 mt-10 mb-4">
          {block.text}
        </h2>
      );
    case "subheading":
      return (
        <h3 key={i} className="font-display font-bold text-lg text-matcha-800 mt-6 mb-3">
          {block.text}
        </h3>
      );
    case "paragraph":
      return (
        <p key={i} className="text-matcha-700 leading-relaxed mb-4">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul key={i} className="space-y-2 mb-6 pl-1">
          {block.items.map((item, j) => (
            <li key={j} className="flex gap-3 text-matcha-700 leading-relaxed">
              <span className="text-matcha-500 mt-1 flex-shrink-0">&#8226;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="border-l-4 border-matcha-400 bg-matcha-50 rounded-r-xl px-6 py-5 my-6"
        >
          <p className="text-matcha-800 italic leading-relaxed">"{block.text}"</p>
          <p className="text-matcha-500 text-sm mt-2 font-medium">— {block.author}</p>
        </blockquote>
      );
    case "table":
      return (
        <div key={i} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-matcha-600 text-white">
                {block.headers.map((h, j) => (
                  <th key={j} className="px-4 py-3 text-left font-semibold first:rounded-tl-lg last:rounded-tr-lg">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j} className={j % 2 === 0 ? "bg-matcha-50" : "bg-white"}>
                  {row.map((cell, k) => (
                    <td key={k} className="px-4 py-3 text-matcha-700 border-b border-matcha-100">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.id === slug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-matcha-900 mb-4">Artículo no encontrado</h1>
        <Link to="/blog" className="text-matcha-600 hover:text-matcha-700 font-medium">
          &larr; Volver al blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      {/* Header Image */}
      <div className="w-full h-64 md:h-80 relative overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-matcha-100">
          {/* Meta */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-matcha-600 hover:text-matcha-700 text-sm font-medium mb-6 transition-colors"
          >
            &larr; Volver al blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-matcha-600 bg-matcha-100 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-matcha-400">{post.date}</span>
            <span className="text-xs text-matcha-400">{post.readTime}</span>
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-matcha-950 leading-tight mb-8">
            {post.title}
          </h1>

          {/* Article content */}
          <div>{post.content.map((block, i) => renderBlock(block, i))}</div>

          {/* Share / More */}
          <div className="mt-12 pt-8 border-t border-matcha-100 flex items-center justify-between">
            <Link to="/blog" className="text-matcha-600 hover:text-matcha-700 font-medium text-sm transition-colors">
              Más artículos
            </Link>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="text-matcha-500 hover:text-matcha-700 text-sm font-medium transition-colors"
            >
              Compartir
            </button>
          </div>
        </div>
      </article>

      <div className="h-16" />
    </div>
  );
}
