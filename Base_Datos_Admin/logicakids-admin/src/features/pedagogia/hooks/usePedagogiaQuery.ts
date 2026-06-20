import { useQuery } from "@tanstack/react-query";
import { pedagogiaApi } from "../services/pedagogiaApi";

export const useFases = () => useQuery({ queryKey: ["pedagogia", "fases"], queryFn: pedagogiaApi.getFases });
export const useConfiguraciones = (faseId?: number) => useQuery({ queryKey: ["pedagogia", "configuraciones", faseId], queryFn: () => pedagogiaApi.getConfiguraciones(faseId) });