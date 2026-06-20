import { useQuery } from "@tanstack/react-query";
import { alumnosApi } from "../services/alumnosApi";

export const useAlumnosSearch = (query: string, skip = 0, limit = 15) => {
  return useQuery({
    queryKey: ["alumnos", "search", query, skip, limit],
    queryFn: () => alumnosApi.searchAlumnos(query, skip, limit),
    staleTime: 1000 * 60 * 5,
  });
};