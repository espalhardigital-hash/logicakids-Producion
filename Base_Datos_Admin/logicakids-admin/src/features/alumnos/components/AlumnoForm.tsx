import React from "react";
import { useForm } from "react-hook-form";
import { useAlumnoMutations } from "../hooks/useAlumnoMutations";
import { X, Loader2 } from "lucide-react";

export const AlumnoForm: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { createAlumno, isCreating } = useAlumnoMutations();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { username: "", email: "", password: "" } });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      await createAlumno(data);
      reset(); onClose();
      alert("Alumno registrado.");
    } catch (err: any) { alert(err.message || "Error al crear"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black">Registrar Alumno</h3>
          <button onClick={onClose} className="text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="text" placeholder="Usuario" className="w-full border p-3 rounded-xl" {...register("username", {required: true})} />
          <input type="email" placeholder="Email de Tutor" className="w-full border p-3 rounded-xl" {...register("email", {required: true})} />
          <input type="password" placeholder="Contraseña Temporal" className="w-full border p-3 rounded-xl" {...register("password", {required: true})} />
          <button type="submit" disabled={isCreating} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex justify-center">
            {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Alumno"}
          </button>
        </form>
      </div>
    </div>
  );
};