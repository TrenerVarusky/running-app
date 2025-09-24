import { useQuery } from "@tanstack/react-query";
import { getLatestPosts, type LatestPost } from "../api/getPosts";

export function useLatestPosts(limit = 3) {
  return useQuery<LatestPost[], Error>({
    queryKey: ["posts", "latest", limit],
    queryFn: () => getLatestPosts(limit),
  });
}
