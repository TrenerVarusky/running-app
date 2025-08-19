import { api } from "./client";

export type Profile = {
  user_id: number;
  first_name?: string | null;
  last_name?: string | null;
  birth_date?: string | null; 
  height_cm?: number | null;
  weight_kg?: number | null;
  gender?: "male" | "female" | null;
};

// dopasuj jeśli masz inną ścieżkę
const GET_MY_PROFILE = "/profile/MyProfile";
const PUT_MY_PROFILE = "/profile/ChangeMyProfile";

export async function getMyProfile() {
  const { data } = await api.get<Profile>(GET_MY_PROFILE);
  return data;
}

export async function updateMyProfile(put: Partial<Profile>) {
  const { data } = await api.put<Profile>(PUT_MY_PROFILE, put);
  return data;
}
