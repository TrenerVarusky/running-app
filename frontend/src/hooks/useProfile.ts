import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile, type Profile } from "../api/profile";

export const useProfile = () =>
  useQuery({ queryKey: ["me", "profile"], queryFn: getMyProfile });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<Profile>) => updateMyProfile(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "profile"] }),
  });
};
