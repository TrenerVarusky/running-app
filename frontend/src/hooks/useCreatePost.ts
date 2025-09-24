import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, type CreatePostPayload, type ServerPost } from "../api/createPosts";

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation<ServerPost, Error, CreatePostPayload>({
    mutationFn: (payload) => createPost(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["post", data.slug] });
    },
  });
}