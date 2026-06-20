import { useMutation, useQueryClient } from "@tanstack/react-query";
import { configuracionApi } from "../services/configuracionApi";

export const useConfiguracionMutations = () => {
  const queryClient = useQueryClient();
  const updateSystem = useMutation({ mutationFn: configuracionApi.updateSystemConfig, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configuracion"] }) });
  const updateSettings = useMutation({ mutationFn: configuracionApi.updatePlatformSettings, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configuracion"] }) });
  return { updateSystemConfig: updateSystem.mutateAsync, updatePlatformSettings: updateSettings.mutateAsync };
};