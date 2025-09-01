import { useForm } from "react-hook-form";
import { useTrainingProfile } from "../../hooks/useTrainingProfile";

type FormVals = {
  weight_kg: number | null;
  height_cm: number | null;
  hr_max: number | null;
  goal_type: "10k" | "rekreacja" | "" | null;
  goal_time_sec: number | null;
};

export default function TrainingProfileModal({ onClose }:{ onClose:()=>void }) {
  const { data, save, isSaving } = useTrainingProfile();
  const { register, handleSubmit } = useForm<FormVals>({
    defaultValues: {
      weight_kg: data?.weight_kg ?? null,
      height_cm: data?.height_cm ?? null,
      hr_max: data?.hr_max ?? null,
      goal_type: (data?.goal_type as any) ?? "",
      goal_time_sec: data?.goal_time_sec ?? null,
    }
  });

  const normalize = (v:any) => v === "" ? null : (typeof v === "string" ? Number(v.replace(",", ".")) : v);

  const onSubmit = async (v: FormVals) => {
    await save({
      weight_kg: normalize(v.weight_kg),
      height_cm: normalize(v.height_cm),
      hr_max: v.hr_max ?? null,
      goal_type: v.goal_type && v.goal_type !== "" ? v.goal_type : null,
      goal_time_sec: v.goal_time_sec ?? null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Profil treningowy</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Waga (kg)
              <input className="w-full border rounded p-2" {...register("weight_kg")} />
            </label>
            <label className="text-sm">Wzrost (cm)
              <input className="w-full border rounded p-2" {...register("height_cm")} />
            </label>
          </div>
          <label className="text-sm block">HRmax
            <input type="number" className="w-full border rounded p-2" {...register("hr_max", { valueAsNumber: true })}/>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Cel
              <select className="w-full border rounded p-2" {...register("goal_type")}>
                <option value="">—</option>
                <option value="10k">10 km</option>
                <option value="rekreacja">Rekreacja</option>
              </select>
            </label>
            <label className="text-sm">Czas 10k (sek)
              <input type="number" className="w-full border rounded p-2" {...register("goal_time_sec", { valueAsNumber: true })}/>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Anuluj</button>
            <button disabled={isSaving} className="px-4 py-2 rounded bg-black text-white">Zapisz</button>
          </div>
        </form>
      </div>
    </div>
  );
}