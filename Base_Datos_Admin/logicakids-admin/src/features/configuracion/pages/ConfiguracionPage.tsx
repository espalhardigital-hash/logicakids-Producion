import React, { useState, useEffect } from "react";
import { useSystemConfig, usePlatformSettings } from "../hooks/useConfiguracionQuery";
import { useConfiguracionMutations } from "../hooks/useConfiguracionMutations";
import { changeApiBaseUrl } from "../../../api/apiClient";
import { useCustomDialog } from "../../../components/common/CustomDialog";
import { Server, Globe, Database, Save, Loader2, HardDrive } from "lucide-react";

export const ConfiguracionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"platform" | "connections">("platform");
  const { data: systemConfig, isLoading: isLoadingSys } = useSystemConfig();
  const { data: platformSettings, isLoading: isLoadingSettings } = usePlatformSettings();
  const { updateSystemConfig, updatePlatformSettings } = useConfiguracionMutations();
  const { confirm, alert: showAlert } = useCustomDialog();

  // Endpoints y conexiones
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [dbUrl, setDbUrl] = useState("");
  const [minioEndpoint, setMinioEndpoint] = useState("");
  const [minioBucket, setMinioBucket] = useState("");

  useEffect(() => {
    const activeUrl = localStorage.getItem("logicakids_api_url") || "https://db.espalhar.shop/api";
    setApiEndpoint(activeUrl.replace("/api", ""));
  }, []);

  useEffect(() => {
    if (systemConfig) setDbUrl(systemConfig.database_url);
    if (platformSettings && platformSettings.minio_config) {
      setMinioEndpoint(platformSettings.minio_config.endpoint);
      setMinioBucket(platformSettings.minio_config.bucket_name);
    }
  }, [systemConfig, platformSettings]);

  const handleMudarEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    confirm({
      title: "Cambiar Backend API",
      message: "¿Seguro que deseas cambiar el backend API? La aplicación se reiniciará para aplicar la nueva ruta.",
      confirmText: "Cambiar y Reiniciar",
      onConfirm: () => {
        changeApiBaseUrl(apiEndpoint);
      }
    });
  };

  const handleSaveDb = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSystemConfig({
        vps_host: systemConfig?.vps_host || "185.244.201.12",
        ssh_user: systemConfig?.ssh_user || "root",
        database_url: dbUrl
      });
      showAlert("Base de datos de producción actualizada con éxito.", "success");
    } catch (err: any) {
      showAlert("Error al actualizar la base de datos: " + (err.message || err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">Ajustes Técnicos e Infraestructura</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("platform")}
          className={`px-6 py-3 font-bold border-b-2 text-sm transition-colors ${
            activeTab === "platform"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Globe className="inline mr-2 h-4 w-4" /> Plataforma
        </button>
        <button
          onClick={() => setActiveTab("connections")}
          className={`px-6 py-3 font-bold border-b-2 text-sm transition-colors ${
            activeTab === "connections"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Server className="inline mr-2 h-4 w-4" /> Conexiones (DB y MinIO)
        </button>
      </div>

      {activeTab === "platform" && (
        <form onSubmit={handleMudarEndpoint} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl space-y-4 dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-white">
          <h3 className="font-bold text-md flex items-center gap-2 dark:text-white">
            <Globe className="text-indigo-500" /> Endpoints de la App
          </h3>
          <input
            type="text"
            className="w-full border p-2.5 rounded-xl font-mono text-xs bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-600"
            value={apiEndpoint}
            onChange={e => setApiEndpoint(e.target.value)}
          />
          <button type="submit" className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-indigo-700 transition-colors shadow-sm">
            Mudar API Base y Reiniciar
          </button>
        </form>
      )}

      {activeTab === "connections" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form DB */}
          <form onSubmit={handleSaveDb} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-white">
            <h3 className="font-bold text-md flex items-center gap-2 dark:text-white">
              <Database className="text-indigo-500" /> Conexión PostgreSQL
            </h3>
            <input
              type="text"
              className="w-full border p-2.5 rounded-xl font-mono text-xs bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-600"
              value={dbUrl}
              onChange={e => setDbUrl(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-indigo-700 transition-colors shadow-sm">
              Salvar Base de Datos
            </button>
          </form>

          {/* Form MinIO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-white">
            <h3 className="font-bold text-md flex items-center gap-2 dark:text-white">
              <HardDrive className="text-indigo-500" /> Almacenamiento MinIO
            </h3>
            <input
              type="text"
              className="w-full border p-2.5 rounded-xl font-mono text-xs bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400"
              value={minioEndpoint}
              placeholder="db.espalhar.shop"
              disabled
            />
            <input
              type="text"
              className="w-full border p-2.5 rounded-xl font-mono text-xs bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400"
              value={minioBucket}
              placeholder="logicakids-assets"
              disabled
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
              Mudar cubo MinIO se administra de forma segura en las platform_settings del servidor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};