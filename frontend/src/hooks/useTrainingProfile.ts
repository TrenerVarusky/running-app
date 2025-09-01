import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyTrainingProfile, updateMyTrainingProfile, type TrainingProfile } from "../api/trainingProfile";

export function useTrainingProfile() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["trainingProfile"], queryFn: getMyTrainingProfile });
  const m = useMutation({
    mutationFn: (p: Partial<TrainingProfile>) => updateMyTrainingProfile(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainingProfile"] }),
  });
  return { ...q, save: m.mutateAsync, isSaving: m.isPending };
}