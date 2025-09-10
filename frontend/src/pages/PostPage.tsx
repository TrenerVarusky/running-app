// src/pages/PostPage.tsx
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { usePostBySlug } from "../hooks/usePostBySlug";
import BackButton from "../components/UI/BackButton";

function fmtDate(iso?: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("pl-PL"); } catch { return ""; }
}

function initials(name?: string | null) {
  if (!name) return "";
  return name.split(" ").filter(Boolean).map(s => s[0]).join("").slice(0,2).toUpperCase();
}

function Paragraphs({ text }: { text: string }) {
  const parts = useMemo(() => text.split(/\n{1,}/).filter(Boolean), [text]);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} className="leading-7 text-white/90 mb-4 whitespace-pre-wrap">{p}</p>
      ))}
    </>
  );
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePostBySlug(slug);

  useEffect(() => {
    if (post?.title) document.title = `${post.title} • Running`;
  }, [post?.title]);

  // zbuduj bloki: sekcja, potem obrazek, naprzemiennie
  const blocks = useMemo(() => {
    if (!post) return [];
    const secs = post.sections ?? [];
    const imgs = post.gallery_urls ?? [];
    const max = Math.max(secs.length, imgs.length);
    const arr: Array<{ type: "section"; data: any } | { type: "image"; url: string }> = [];
    for (let i = 0; i < max; i++) {
      if (secs[i]) arr.push({ type: "section", data: secs[i] });
      if (imgs[i]) arr.push({ type: "image", url: imgs[i] });
    }
    return arr;
  }, [post]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <Navbar />

      <main className="flex-grow pt-24 py-12 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <BackButton />
          </div>

          {isLoading && (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-2/3 bg-gray-700/50 rounded" />
              <div className="h-4 w-1/3 bg-gray-700/40 rounded" />
              <div className="h-64 w-full bg-gray-800/50 rounded-xl" />
              <div className="h-4 w-full bg-gray-700/40 rounded" />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 text-red-200 p-4 ring-1 ring-red-500/30">
              Nie udało się pobrać artykułu: {error.message}
            </div>
          )}

          {!isLoading && !error && !post && (
            <div className="rounded-xl bg-gray-800 p-6 text-white/80">Nie znaleziono artykułu.</div>
          )}

          {post && (
            <article className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              {/* Hero */}
              {post.hero_image_url && (
                <img
                  src={post.hero_image_url}
                  alt={post.title}
                  className="w-full h-[320px] md:h-[420px] object-cover"
                />
              )}

              <div className="p-6 md:p-10">
                {/* Meta: data + autor + tagi */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <time className="text-xs text-white/60">{fmtDate(post.created_at)}</time>

                  {post.author_name && (
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-semibold">
                        {initials(post.author_name)}
                      </div>
                      <span>{post.author_name}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(t => (
                      <span key={t} className="text-xs px-3 py-1 rounded-full bg-blue-900/40 ring-1 ring-white/10">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tytuł + lead */}
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{post.title}</h1>
                {post.subtitle && <p className="text-white/80 text-lg mb-6">{post.subtitle}</p>}

                {/* Treść: sekcje + obrazki naprzemiennie */}
                <div className="prose prose-invert max-w-none">
                  {blocks.map((b, i) => {
                    if (b.type === "section") {
                      return (
                        <section key={`s-${i}`} className="mb-8">
                          {b.data.heading && <h2 className="text-2xl font-semibold mb-3">{b.data.heading}</h2>}
                          <Paragraphs text={b.data.text} />
                        </section>
                      );
                    }
                  })}
                </div>
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
