import { useQuery } from "@tanstack/react-query";
import { getArticlesAll, type LatestPost } from "../api/getPosts";

export function useArticlesAll(page = 1, pageSize = 20) {
  return useQuery<LatestPost[], Error>({
    queryKey: ["allPosts", page, pageSize],
    queryFn: () => getArticlesAll(page, pageSize),
  });
}