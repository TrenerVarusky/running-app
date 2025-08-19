export const genderOptions = [
  { value: "male",   label: "Mężczyzna" },
  { value: "female", label: "Kobieta"   },
] as const;

export type Gender = (typeof genderOptions)[number]["value"];
