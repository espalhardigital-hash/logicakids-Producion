import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alumnosApi } from "../services/alumnosApi";

export const useAlumnoMutations = () => {
  const queryClient = useQueryClient();
  const invalidateAlumnos = () => queryClient.invalidateQueries({ queryKey: ["alumnos"] });

  const createMutation = useMutation({ mutationFn: alumnosApi.createAlumno, onSuccess: invalidateAlumnos });
  const deleteMutation = useMutation({ mutationFn: alumnosApi.deleteUser, onSuccess: invalidateAlumnos });
  const anonymizeMutation = useMutation({ mutationFn: alumnosApi.anonymizeUser, onSuccess: invalidateAlumnos });
  const deleteBulkMutation = useMutation({ mutationFn: alumnosApi.deleteUsersBulk, onSuccess: invalidateAlumnos });

  return {
    createAlumno: createMutation.mutateAsync, isCreating: createMutation.isPending,
    deleteAlumno: deleteMutation.mutateAsync, isDeleting: deleteMutation.isPending,
    anonymizeAlumno: anonymizeMutation.mutateAsync, isAnonymizing: anonymizeMutation.isPending,
    deleteUsersBulk: deleteBulkMutation.mutateAsync, isDeletingBulk: deleteBulkMutation.isPending
  };
};