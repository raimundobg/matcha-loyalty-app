import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogData";
import MatchaIcon from "../components/MatchaIcon";

export default function Blog() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-matcha-100 py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-matcha-950 mb-3 sm:mb-4">
            Nuestro <span className="italic text-matcha-600">Blog</span>
          </h1>
          <p className="text-matcha-600 text-base sm:text-lg max-w-xl mx-auto">
            Descubre todo sobre el matcha: beneficios, recetas, sustentabilidad y más.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-5 sm:space-y-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-matcha-100 hover:shadow-lg transition-all"
            >
              <div className="md:w-72 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4 sm:p-6 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-xs font-medium text-matcha-600 bg-matcha-100 px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-matcha-400">{post.date}</span>
                  <span className="text-xs text-matcha-400">{post.readTime}</span>
                </div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-matcha-900 mb-2 group-hover:text-matcha-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-matcha-600 text-sm leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
