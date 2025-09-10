// components/ArticlesSection.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import { useLatestPosts } from "../../hooks/useLatestPosts";
import biegaczImg from "../../assets/biegacz.png";
import type { LatestPost } from "../../api/getPosts";

function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pl-PL");
  } catch {
    return "";
  }
}

export default function ArticlesSection() {
  const nav = useNavigate();
  const { ref, isVisible } = useInView(0.3);
  const [animate, setAnimate] = useState(false);

  const { data, isLoading, error } = useLatestPosts(3);

  useEffect(() => {
    if (isVisible) setAnimate(true);
  }, [isVisible]);

  const posts = useMemo(() => data ?? [], [data]);

  const handleOpen = (slug: string) => nav(`/post/${slug}`);

  return (
    <section className="bg-gray-800 py-20" ref={ref}>
      <div className="w-[90vw] max-w-7xl mx-auto text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Najnowsze artykuły:
        </h2>

        {isLoading && <div className="text-white/70 text-center">Ładowanie…</div>}
        {error && (
          <div className="text-red-300 text-center">
            Błąd: {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="grid gap-8 md:grid-cols-3">
              {posts.map((post: LatestPost) => {
                const excerpt =
                  (post.subtitle && post.subtitle.trim()) ||
                  (post.sections?.[0]?.text || "").slice(0, 160) +
                    ((post.sections?.[0]?.text || "").length > 160 ? "…" : "");

                return (
                  <div
                    key={post.id}
                    className={`bg-gray-900 rounded-xl shadow-md overflow-hidden flex flex-col transition transform hover:scale-105 hover:duration-300 duration-1000 ${
                      animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                  >
                    <img
                      src={post.hero_image_url || biegaczImg}
                      alt={post.title}
                      className="h-48 w-full object-cover cursor-pointer"
                      onClick={() => handleOpen(post.slug)}
                      loading="lazy"
                    />
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex gap-2 mb-2 text-sm text-blue-400">
                        {post.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="bg-blue-950 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {fmtDate(post.created_at)}
                      </p>
                      <h3
                        className="text-xl font-semibold mb-2 cursor-pointer"
                        onClick={() => handleOpen(post.slug)}
                      >
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-300 flex-grow">{excerpt}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full text-white font-semibold transition hover:scale-105 cursor-pointer"
                onClick={() => nav("/posts")}
              >
                Więcej artykułów
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
