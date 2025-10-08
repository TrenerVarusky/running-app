// src/api/posts.ts
import { api } from "./client";

export type SectionDTO = {
  heading?: string;
  text: string;
  order_index?: number;
};

export type LatestPost = {
  id: number;
  title: string;
  subtitle?: string | null;
  slug: string;
  tags: string[];
  created_at: string;
  hero_image_url?: string | null;
  sections: SectionDTO[];
};

export type PostDetail = {
  title: string;
  subtitle?: string | null;
  slug: string;
  tags: string[];
  created_at: string;
  author_name?: string | null; 
  hero_image_url?: string | null;   
  sections: SectionDTO[];           
  gallery_urls: string[];        
};

export type PostDetailRaw = {
  id: number;
  title: string;
  subtitle?: string | null;
  slug: string;
  sections: SectionDTO[];
  tags: string[];
  author_id?: number;
  author_name?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  hero_image_url?: string | null;   // np. "/Admin/posts/2002/images/1002"
  gallery_urls?: string[];          // np. ["/Admin/posts/2002/images/1003", ...]
};

export async function getLatestPosts(limit = 3) {
  const { data } = await api.get<LatestPost[]>("/Posts/latest", { params: { limit } });
  const API_URL = import.meta.env.VITE_API_URL;

  return data.map(p => ({
    ...p,
    hero_image_url: p.hero_image_url
      ? (p.hero_image_url.startsWith("http")
          ? p.hero_image_url
          : `${API_URL}${p.hero_image_url}`)
      : null,
  }));
}

export async function getPostBySlug(slug: string): Promise<PostDetail> {
  const { data } = await api.get<PostDetailRaw>(`/Posts/${slug}`);

  const API_URL = import.meta.env.VITE_API_URL;
  const abs = (u?: string | null) => (u ? (u.startsWith("http") ? u : `${API_URL}${u}`) : null);

  const sections = (data.sections ?? [])
    .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((s: any) => ({ heading: s.heading, text: s.text }));

  return {
    title: data.title,
    subtitle: data.subtitle ?? null,
    slug: data.slug,
    tags: data.tags || [],
    created_at: data.created_at,
    author_name: data.author_name ?? null,
    hero_image_url: abs(data.hero_image_url),
    sections,
    gallery_urls: (data.gallery_urls || []).map(u => abs(u)).filter(Boolean) as string[],
  };
}

export async function getArticlesAll(page = 1, pageSize = 20) {
  const { data } = await api.get<LatestPost[]>("/Posts", { params: { page, page_size: pageSize }, });
  const API_URL = import.meta.env.VITE_API_URL;

  return data.map(p => ({
    ...p,
    hero_image_url: p.hero_image_url
      ? (p.hero_image_url.startsWith("http")
          ? p.hero_image_url
          : `${API_URL}${p.hero_image_url}`)
      : null,
  }));
}