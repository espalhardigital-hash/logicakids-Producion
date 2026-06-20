import { useQuery } from "@tanstack/react-query";
import { configuracionApi } from "../services/configuracionApi";

export const useSystemConfig = () => useQuery({ queryKey: ["configuracion", "system"], queryFn: configuracionApi.getSystemConfig });
export const usePlatformSettings = () => useQuery({ queryKey: ["configuracion", "platform-settings"], queryFn: configuracionApi.getPlatformSettings });