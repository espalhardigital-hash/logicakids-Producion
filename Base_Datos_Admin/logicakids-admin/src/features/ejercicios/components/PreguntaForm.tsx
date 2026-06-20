import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { preguntaSchema, PreguntaInput } from "../schemas/preguntaSchema";
import { OperacionEnum, TipoPreguntaEnum, StatusEnum, TipoErrorEnum } from "../../../types/db-enums";
import { usePreguntaMutations } from "../hooks/usePreguntaMutations";
import { useCustomDialog } from "../../../components/common/CustomDialog";

interface PreguntaFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  defaultFaseId?: number | null;
  defaultSeccion?: number | null;
  defaultOperacion?: string | null;
}

export const PreguntaForm: React.FC<PreguntaFormProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultFaseId,
  defaultSeccion,
  defaultOperacion,
}) => {
  const { createPregunta, updatePregunta } = usePreguntaMutations();
  const { alert: showAlert } = useCustomDialog();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PreguntaInput>({
    resolver: zodResolver(preguntaSchema),
    defaultValues: {
      fase_id: 1,
      seccion: 1,
      sub_nivel: null,
      operacion: OperacionEnum.SUMA,
      tipo_pregunta: TipoPreguntaEnum.MULTIPLE_OPCION,
      enunciado: "",
      respuesta_correcta: "",
      estado: StatusEnum.ACTIVO,
      alternativas: [],
      datos_numericos: null,
    },
  });

  const { fields: altFields, append: appendAlt, remove: removeAlt } = useFieldArray({
    control,
    name: "alternativas",
  });

  // Watchers to check visual support type
  const watchDatosNumericos = watch("datos_numericos");

  useEffect(() => {
    if (initialData) {
      reset({
        fase_id: initialData.fase_id,
        seccion: initialData.seccion,
        sub_nivel: initialData.sub_nivel,
        estructura_padre_id: initialData.estructura_padre_id || null,
        operacion: initialData.operacion,
        tipo_pregunta: initialData.tipo_pregunta,
        enunciado: initialData.enunciado,
        respuesta_correcta: initialData.respuesta_correcta,
        estado: initialData.estado || StatusEnum.ACTIVO,
        alternativas: initialData.alternativas || [],
        datos_numericos: initialData.datos_numericos || null,
      });
    } else {
      reset({
        fase_id: defaultFaseId || 1,
        seccion: defaultSeccion || 1,
        sub_nivel: null,
        estructura_padre_id: null,
        operacion: (defaultOperacion as OperacionEnum) || OperacionEnum.SUMA,
        tipo_pregunta: TipoPreguntaEnum.MULTIPLE_OPCION,
        enunciado: "",
        respuesta_correcta: "",
        estado: StatusEnum.ACTIVO,
        alternativas: [],
        datos_numericos: null,
      });
    }
  }, [initialData, defaultFaseId, defaultSeccion, defaultOperacion, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: PreguntaInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updatePregunta({ id: initialData.id, payload: data });
        showAlert("Pregunta actualizada exitosamente.", "success");
      } else {
        await createPregunta(data);
        showAlert("Pregunta creada exitosamente.", "success");
      }
      onClose();
    } catch (err: any) {
      showAlert("Error al guardar la pregunta: " + (err.message || err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-xl dark:bg-slate-900 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black">
            {initialData ? "Editar Pregunta" : "Nueva Pregunta"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Fase (1-9)</label>
              <input
                type="number"
                placeholder="Fase"
                className="w-full border p-2.5 rounded-xl dark:bg-slate-800 dark:border-slate-700"
                {...register("fase_id", { valueAsNumber: true })}
              />
              {errors.fase_id && <p className="text-xs text-red-500">{errors.fase_id.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Módulo (Sección)</label>
              <input
                type="number"
                placeholder="Módulo"
                className="w-full border p-2.5 rounded-xl dark:bg-slate-800 dark:border-slate-700"
                {...register("seccion", { valueAsNumber: true })}
              />
              {errors.seccion && <p className="text-xs text-red-500">{errors.seccion.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Sub Nivel (Opcional)</label>
              <input
                type="number"
                placeholder="Sub Nivel"
                className="w-full border p-2.5 rounded-xl dark:bg-slate-800 dark:border-slate-700"
                {...register("sub_nivel", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Operación</label>
              <select
                className="w-full border p-2.5 rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                {...register("operacion")}
              >
                <option value={OperacionEnum.SUMA}>Suma</option>
                <option value={OperacionEnum.RESTA}>Resta</option>
                <option value={OperacionEnum.MULTIPLICACION}>Multiplicación</option>
                <option value={OperacionEnum.DIVISION}>División</option>
                <option value={OperacionEnum.MIXTA}>Mixta (Desafío)</option>
              </select>
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold uppercase text-slate-500">Tipo de Pregunta</label>
              <select
                className="w-full border p-2.5 rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                {...register("tipo_pregunta")}
              >
                <option value={TipoPreguntaEnum.MULTIPLE_OPCION}>Opción Múltiple</option>
                <option value={TipoPreguntaEnum.PROBLEMA_CONTEXTO}>Problema de Contexto</option>
                <option value={TipoPreguntaEnum.CALCUL0_DIRECTO}>Cálculo Directo</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Enunciado / Pregunta</label>
            <textarea
              rows={3}
              placeholder="Introduce el enunciado del problema matemático..."
              className="w-full border p-3 rounded-xl dark:bg-slate-800 dark:border-slate-700"
              {...register("enunciado")}
            />
            {errors.enunciado && <p className="text-xs text-red-500">{errors.enunciado.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500">Respuesta Correcta</label>
            <input
              type="text"
              placeholder="Ej: 15"
              className="w-full border p-2.5 rounded-xl dark:bg-slate-800 dark:border-slate-700"
              {...register("respuesta_correcta")}
            />
            {errors.respuesta_correcta && <p className="text-xs text-red-500">{errors.respuesta_correcta.message}</p>}
          </div>

          {/* EDITOR HÍBRIDO MINIO / SVG */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase text-indigo-600">Apoyo Visual (JSONB)</label>
              <select
                className="text-xs p-1 rounded border dark:bg-slate-800 dark:border-slate-700"
                value={watchDatosNumericos?.visual_support?.tipo || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) setValue("datos_numericos", null);
                  if (val === "imagen") {
                    setValue("datos_numericos", { visual_support: { tipo: "imagen", url: "" } });
                  }
                  if (val === "geometria") {
                    setValue("datos_numericos", {
                      visual_support: {
                        tipo: "geometria",
                        figura: "triangulo",
                        base: 120,
                        altura: 100,
                        color: "#6366f1",
                      },
                    });
                  }
                }}
              >
                <option value="">Solo Texto</option>
                <option value="imagen">Subir Imagen (MinIO)</option>
                <option value="geometria">Figura SVG (Geometría)</option>
              </select>
            </div>

            {watchDatosNumericos?.visual_support?.tipo === "imagen" && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="URL de la imagen en MinIO"
                  className="w-full border p-2 rounded-xl text-sm dark:bg-slate-800 dark:border-slate-700"
                  {...register("datos_numericos.visual_support.url")}
                />
              </div>
            )}

            {watchDatosNumericos?.visual_support?.tipo === "geometria" && (
              <div className="grid grid-cols-4 gap-2">
                <select
                  className="border p-2 rounded-xl text-xs dark:bg-slate-800 dark:border-slate-700"
                  {...register("datos_numericos.visual_support.figura")}
                >
                  <option value="triangulo">Triángulo</option>
                  <option value="rectangulo">Rectángulo</option>
                  <option value="circulo">Círculo</option>
                </select>
                <input
                  type="number"
                  placeholder="Base"
                  className="border p-2 rounded-xl text-xs dark:bg-slate-800 dark:border-slate-700"
                  {...register("datos_numericos.visual_support.base", { valueAsNumber: true })}
                />
                <input
                  type="number"
                  placeholder="Altura"
                  className="border p-2 rounded-xl text-xs dark:bg-slate-800 dark:border-slate-700"
                  {...register("datos_numericos.visual_support.altura", { valueAsNumber: true })}
                />
                <input
                  type="color"
                  className="border rounded-xl h-full w-full cursor-pointer"
                  {...register("datos_numericos.visual_support.color")}
                />
              </div>
            )}
          </div>

          {/* ALTERNATIVAS */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-slate-500">Alternativas (Opción Múltiple)</label>
              <button
                type="button"
                onClick={() =>
                  appendAlt({
                    texto: "",
                    es_correcta: false,
                    orden: altFields.length + 1,
                    tipo_error: null,
                    feedback_error: "",
                  })
                }
                className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" /> Añadir Alternativa
              </button>
            </div>

            <div className="space-y-3">
              {altFields.map((field, index) => (
                <div key={field.id} className="p-3 border rounded-xl space-y-2 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer"
                      {...register(`alternativas.${index}.es_correcta` as const)}
                    />
                    <input
                      type="text"
                      placeholder="Texto de la alternativa"
                      className="flex-1 border p-2 rounded-xl text-sm dark:bg-slate-800 dark:border-slate-700"
                      {...register(`alternativas.${index}.texto` as const)}
                    />
                    <button
                      type="button"
                      onClick={() => removeAlt(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-7">
                    <select
                      className="border p-2 rounded-xl text-xs dark:bg-slate-800 dark:border-slate-700"
                      {...register(`alternativas.${index}.tipo_error` as const)}
                    >
                      <option value="">Tipo de error si eligen esta (Ninguno)</option>
                      <option value={TipoErrorEnum.CALCULO}>Cálculo</option>
                      <option value={TipoErrorEnum.LECTURA}>Lectura</option>
                      <option value={TipoErrorEnum.ATENCION}>Atención</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Feedback específico de error"
                      className="border p-2 rounded-xl text-xs dark:bg-slate-800 dark:border-slate-700"
                      {...register(`alternativas.${index}.feedback_error` as const)}
                    />
                  </div>
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