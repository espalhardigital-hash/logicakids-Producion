import { useQuery } from "@tanstack/react-query";
import { ejerciciosApi } from "../services/ejerciciosApi";
export const usePreguntas = (faseId?: number | null, seccion?: number | null, operacion?: string | null) => 
  useQuery({ 
    queryKey: ["ejercicios", "preguntas", faseId, seccion, operacion], 
    queryFn: () => ejerciciosApi.getPreguntas(faseId, seccion, operacion) 
  });

export const useTeoria = (faseId: number | null, moduloId: number | null, enabled = true) => 
  useQuery({
    queryKey: ["ejercicios", "teoria", faseId, moduloId],
    queryFn: () => ejerciciosApi.getTeoria(faseId!, moduloId!),
    enabled: enabled && faseId !== null && moduloId !== null
  });