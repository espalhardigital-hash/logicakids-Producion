import { useQuery } from "@tanstack/react-query";
import { analiticasApi } from "../services/analiticasApi";

export const useEngagement = () => useQuery({ queryKey: ["analytics", "engagement"], queryFn: analiticasApi.getEngagement });
export const useChurn = () => useQuery({ queryKey: ["analytics", "churn"], queryFn: analiticasApi.getChurn });
export const useInsights = (alumnoId: number | null) => useQuery({ queryKey: ["analytics", "insights", alumnoId], queryFn: () => analiticasApi.getInsights(alumnoId!), enabled: !!alumnoId });