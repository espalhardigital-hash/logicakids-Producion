import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pedagogiaApi } from "../services/pedagogiaApi";

export const usePedagogiaMutations = () => {
  const queryClient = useQueryClient();
  const updateConfig = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => pedagogiaApi.updateConfiguracion(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pedagogia"] })
  });
  return { updateConfiguracion: updateConfig.mutateAsync, isUpdating: updateConfig.isPending };
};