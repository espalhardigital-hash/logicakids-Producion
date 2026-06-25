import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ejerciciosApi } from "../services/ejerciciosApi";

export const usePreguntaMutations = () => {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: ejerciciosApi.deletePregunta,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ejercicios"] })
  });

  const createMutation = useMutation({
    mutationFn: ejerciciosApi.createPregunta,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ejercicios"] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => ejerciciosApi.updatePregunta(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ejercicios"] })
  });

  const saveTeoriaMutation = useMutation({
    mutationFn: ejerciciosApi.saveTeoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teoria"] })
  });

  return {
    deletePregunta: deleteMutation.mutateAsync,
    createPregunta: createMutation.mutateAsync,
    updatePregunta: updateMutation.mutateAsync,
    saveTeoria: saveTeoriaMutation.mutateAsync
  };
};