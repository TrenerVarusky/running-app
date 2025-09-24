import { useQuery } from "@tanstack/react-query";
import { getPostBySlug, type PostDetail } from "../api/getPosts";

export function usePostBySlug(slug?: string) {
  return useQuery<PostDetail, Error>({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: !!slug,
  });
}