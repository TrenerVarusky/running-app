// src/api/trainingProfile.ts
import { api } from "./client";

export type HRZones = {
  z1: [number, number];
  z2: [number, number];
  z3: [number, number];
  z4: [number, number];
  z5: [number, number];
};

export type TrainingProfile = {
  user_id: number;
  weight_kg?: number | null;
  height_cm?: number | null;
  resting_hr: number | null;
  hr_zones: HRZones | null
};

// jeśli w BE masz /me/training-profile:
const GET_MY_TRAINING = "/TrainingProfile/MyTrainingProfile";
const PUT_MY_TRAINING = "/TrainingProfile/ChangeTrainingProfile";

export async function getMyTrainingProfile() {
  const { data } = await api.get<TrainingProfile>(GET_MY_TRAINING);
  return data;
}

export async function updateMyTrainingProfile(put: Partial<TrainingProfile>) {
  const { data } = await api.put<TrainingProfile>(PUT_MY_TRAINING, put);
  return data;
}
