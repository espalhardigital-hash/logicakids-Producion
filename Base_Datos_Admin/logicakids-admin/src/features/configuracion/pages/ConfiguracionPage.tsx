import React, { useState, useEffect } from "react";
import { useSystemConfig, usePlatformSettings } from "../hooks/useConfiguracionQuery";
import { useConfiguracionMutations } from "../hooks/useConfiguracionMutations";
import { changeApiBaseUrl } from "../../../api/apiClient";
import { Server, Globe, Database, Save, Loader2, HardDrive } from "lucide-react";

export const ConfiguracionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"platform" | "connections">("platform");
  const { data: systemConfig, isLoading: isLoadingSys } = useSystemConfig();
  const { data: platformSettings, isLoading: isLoadingSettings } = usePlatformSettings();
  const { updateSystemConfig, updatePlatformSettings } = useConfiguracionMutations();

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
    if (window.confirm("¿Seguro de mudar el backend API? La app se reiniciará.")) {
      changeApiBaseUrl(apiEndpoint);
    }
  };

  const handleSaveDb = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSystemConfig({ vps_host: systemConfig?.vps_host || "185.244.201.12", ssh_user: systemConfig?.ssh_user || "root", database_url: dbUrl });
      alert("Base de datos de producción actualizada con éxito.");
    } catch (err: any) { alert("Error al actualizar"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Ajustes Técnicos e Infraestructura</h1>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button onClick={() => setActiveTab("platform")} className={`px-6 py-3 font-bold border-b-2 text-sm ${activeTab === "platform" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}><Globe className="inline mr-2 h-4 w-4" /> Plataforma</button>
        <button onClick={() => setActiveTab("connections")} className={`px-6 py-3 font-bold border-b-2 text-sm ${activeTab === "connections" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}><Server className="inline mr-2 h-4 w-4" /> Conexiones (DB y MinIO)</button>
      </div>

      {activeTab === "platform" && (
        <form onSubmit={handleMudarEndpoint} className="bg-white p-6 rounded-2xl border shadow-sm max-w-xl space-y-4">
          <h3 className="font-bold text-md flex items-center gap-2"><Globe className="text-indigo-500" /> Endpoints de la App</h3>
          <input type="text" className="w-full border p-2.5 rounded-xl font-mono text-xs" value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} />
          <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Mudar API Base y Reiniciar</button>
        </form>
      )}

      {activeTab === "connections" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form DB */}
          <form onSubmit={handleSaveDb} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-bold text-md flex items-center gap-2"><Database className="text-indigo-500" /> Conexión PostgreSQL</h3>
            <input type="text" className="w-full border p-2.5 rounded-xl font-mono text-xs" value={dbUrl} onChange={e => setDbUrl(e.target.value)} />
            <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Salvar Base de Datos</button>
          </form>

          {/* Form MinIO */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-bold text-md flex items-center gap-2"><HardDrive className="text-indigo-500" /> Almacenamiento MinIO</h3>
            <input type="text" className="w-full border p-2.5 rounded-xl font-mono text-xs" value={minioEndpoint} placeholder="db.espalhar.shop" disabled />
            <input type="text" className="w-full border p-2.5 rounded-xl font-mono text-xs" value={minioBucket} placeholder="logicakids-assets" disabled />
            <p className="text-[10px] text-slate-400">Mudar cubo MinIO se administra de forma segura en las platform_settings.</p>
          </div>
        </div>
      )}
    </div>
  );
};