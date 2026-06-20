import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { usePreguntaMutations } from "../hooks/usePreguntaMutations";
import { useCustomDialog } from "../../../components/common/CustomDialog";

interface TeoriaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  faseId: number;
  moduloId: number;
  initialData?: any;
}

export const TeoriaFormModal: React.FC<TeoriaFormModalProps> = ({
  isOpen,
  onClose,
  faseId,
  moduloId,
  initialData,
}) => {
  const { saveTeoria } = usePreguntaMutations();
  const { alert: showAlert } = useCustomDialog();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      titulo: "",
      texto_descubrimiento: "",
      advertencia: "",
      ejemplos: [{ value: "" }],
      interactivos: [{ value: "" }],
    },
  });

  const { fields: ejemploFields, append: appendEjemplo, remove: removeEjemplo } = useFieldArray({
    control,
    name: "ejemplos",
  });

  const { fields: interactivoFields, append: appendInteractivo, remove: removeInteractivo } = useFieldArray({
    control,
    name: "interactivos",
  });

  useEffect(() => {
    if (initialData) {
      const ejemplosMapped = Array.isArray(initialData.ejemplos)
        ? initialData.ejemplos.map((item: any) => typeof item === 'string' ? { value: item } : { value: JSON.stringify(item) })
        : [{ value: "" }];
      const interactivosMapped = Array.isArray(initialData.interactivos)
        ? initialData.interactivos.map((item: any) => typeof item === 'string' ? { value: item } : { value: JSON.stringify(item) })
        : [{ value: "" }];

      reset({
        titulo: initialData.titulo || "",
        texto_descubrimiento: initialData.texto_descubrimiento || "",
        advertencia: initialData.advertencia || "",
        ejemplos: ejemplosMapped,
        interactivos: interactivosMapped,
      });
    } else {
      reset({
        titulo: "",
        texto_descubrimiento: "",
        advertencia: "",
        ejemplos: [{ value: "" }],
        interactivos: [{ value: "" }],
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const ejemplosClean = data.ejemplos
        .map((e: any) => e.value.trim())
        .filter((val: string) => val !== "");
      
      const interactivosClean = data.interactivos
        .map((i: any) => i.value.trim())
        .filter((val: string) => val !== "");

      const payload = {
        fase_id: faseId,
        modulo_id: moduloId,
        nivel_id: 1,
        titulo: data.titulo,
        texto_descubrimiento: data.texto_descubrimiento,
        advertencia: data.advertencia,
        ejemplos: ejemplosClean,
        interactivos: interactivosClean,
        diccionario: initialData?.diccionario || {}, // Mantenemos el diccionario existente
      };

      await saveTeoria(payload);
      showAlert("Teoría guardada correctamente.", "success");
      onClose();
    } catch (err: any) {
      showAlert("Error al guardar la teoría: " + (err.message || err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black">
            {initialData ? "Editar Teoría" : "Crear Teoría"} - Fase {faseId} Módulo {moduloId}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Título de la Teoría</label>
            <input
              type="text"
              placeholder="Ej: Introducción a la suma de dos dígitos"
              className="w-full border p-3 rounded-xl dark:bg-slate-800 dark:border-slate-700"
              {...register("titulo", { required: true })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Texto de Descubrimiento</label>
            <textarea
              rows={4}
              placeholder="Introduce la explicación teórica aquí..."
              className="w-full border p-3 rounded-xl dark:bg-slate-800 dark:border-slate-700"
              {...register("texto_descubrimiento", { required: true })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Advertencia / Consejo</label>
            <textarea
              rows={2}
              placeholder="Ej: Recuerda sumar siempre las unidades antes que las decenas."
              className="w-full border p-3 rounded-xl dark:bg-slate-800 dark:border-slate-700"
              {...register("advertencia")}
            />
          </div>

          {/* EJEMPLOS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-slate-500">Ejemplos Prácticos</label>
              <button
                type="button"
                onClick={() => appendEjemplo({ value: "" })}
                className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" /> Añadir Ejemplo
              </button>
            </div>
            <div className="space-y-2">
              {ejemploFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Ej: 12 + 15 = 27"
                    className="flex-1 border p-2 rounded-xl text-sm dark:bg-slate-800 dark:border-slate-700"
                    {...register(`ejemplos.${index}.value` as const)}
                  />
                  {ejemploFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEjemplo(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* INTERACTIVOS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-slate-500">Elementos Interactivos (Consejos/Guías)</label>
              <button
                type="button"
                onClick={() => appendInteractivo({ value: "" })}
                className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" /> Añadir Guía
              </button>
            </div>
            <div className="space-y-2">
              {interactivoFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Ej: ¿Qué pasa si sumamos unidades que superan 10?"
                    className="flex-1 border p-2 rounded-xl text-sm dark:bg-slate-800 dark:border-slate-700"
                    {...register(`interactivos.${index}.value` as const)}
                  />
                  {interactivoFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInteractivo(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border rounded-xl font-bold dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center min-w-[100px]"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
