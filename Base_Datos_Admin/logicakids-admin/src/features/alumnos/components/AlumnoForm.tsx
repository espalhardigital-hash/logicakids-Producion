import React from "react";
import { useForm } from "react-hook-form";
import { useAlumnoMutations } from "../hooks/useAlumnoMutations";
import { useCustomDialog } from "../../../components/common/CustomDialog";
import { X, Loader2 } from "lucide-react";

export const AlumnoForm: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { createAlumno, isCreating } = useAlumnoMutations();
  const { alert: showAlert } = useCustomDialog();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { username: "", email: "", password: "" } });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      await createAlumno(data);
      reset();
      onClose();
      showAlert("Alumno registrado correctamente.", "success");
    } catch (err: any) {
      showAlert(err.message || "Error al registrar el alumno", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black dark:text-white">Registrar Alumno</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            className="w-full border p-3 rounded-xl bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-600"
            {...register("username", { required: true })}
          />
          <input
            type="email"
            placeholder="Email de Tutor"
            className="w-full border p-3 rounded-xl bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-600"
            {...register("email", { required: true })}
          />
          <input
            type="password"
            placeholder="Contraseña Temporal"
            className="w-full border p-3 rounded-xl bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-600"
            {...register("password", { required: true })}
          />
          <button type="submit" disabled={isCreating} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex justify-center hover:bg-indigo-700 transition-colors">
            {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Alumno"}
          </button>
        </form>
      </div>
    </div>
  );
};