import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "./routes/AppRoutes";
import { CustomDialogProvider } from "./components/common/CustomDialog";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomDialogProvider>
        <AppRoutes />
      </CustomDialogProvider>
    </QueryClientProvider>
  );
}