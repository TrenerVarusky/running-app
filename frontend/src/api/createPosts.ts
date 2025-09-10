// src/api/posts.ts
import { api } from "./client";

export type SectionDraft = { heading?: string; text: string };
export type ServerPost = { id: number; slug: string };

export type CreatePostPayload = {
  title: string;
  subtitle?: string;
  slug: string;
  published: boolean;
  tags: string[];
  sections: SectionDraft[];
  hero?: File | null;
  gallery?: File[];
};

function buildPostFormData(p: CreatePostPayload): FormData {
  const fd = new FormData();
  fd.append("title", p.title.trim());
  if (p.subtitle?.trim()) fd.append("subtitle", p.subtitle.trim());
  fd.append("slug", p.slug.trim());
  fd.append("published", String(p.published));
  fd.append("tags", JSON.stringify(p.tags));
  fd.append(
    "sections",
    JSON.stringify(
      p.sections.map(s => ({ heading: s.heading?.trim() || undefined, text: s.text.trim() }))
    )
  );
  if (p.hero) fd.append("hero_image", p.hero);
  (p.gallery ?? []).forEach(f => fd.append("gallery", f));
  return fd;
}

export async function createPost(payload: CreatePostPayload): Promise<ServerPost> {
  const fd = buildPostFormData(payload);
  const { data } = await api.post<ServerPost>("/Admin/posts", fd);
  return data;
}
