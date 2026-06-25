import { useQuery } from "@tanstack/react-query";
import { ejerciciosApi } from "../services/ejerciciosApi";
export const usePreguntas = (faseId?: number | null) => useQuery({ queryKey: ["ejercicios", "preguntas", faseId], queryFn: () => ejerciciosApi.getPreguntas(faseId) });

export const useTeoria = (faseId: number, moduloId: number, nivelId: number) => 
  useQuery({ 
    queryKey: ["ejercicios", "teoria", faseId, moduloId, nivelId], 
    queryFn: () => ejerciciosApi.getTeoria(faseId, moduloId, nivelId),
    enabled: faseId !== null && moduloId !== null && nivelId !== null
  });