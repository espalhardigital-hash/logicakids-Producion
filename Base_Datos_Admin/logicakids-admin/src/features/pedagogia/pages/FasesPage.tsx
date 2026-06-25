import React, { useState } from "react";
import { useFases, useConfiguraciones } from "../hooks/usePedagogiaQuery";
import { usePedagogiaMutations } from "../hooks/usePedagogiaMutations";
import { ChevronDown, ChevronUp, Loader2, Save } from "lucide-react";

// Diccionario de nombres de módulos por Fase (Fase E.2)
const FASE_MODULOS: Record<number, Record<number, string>> = {
  1: {
    1: "Operaciones Simples",
    2: "Inferencia y Contexto",
    3: "Resistencia y Combinación"
  },
  2: {
    1: "Gimnasio Numérico Mental",
    2: "Tablas en Acción",
    3: "Tienda Matemática",
    4: "Constructor de Soluciones"
  },
  3: {
    1: "El Detective Literario",
    2: "Secuencia Temporal",
    3: "Deducción de Precios",
    4: "Reparto y Residuos",
    5: "Ciclos y Agrupaciones Máximas"
  },
  4: {
    1: "La Fracción Visual",
    2: "Fracción de Cantidad",
    3: "Porcentajes Rápidos",
    4: "Razón y Mezclas"
  }
};

export const getModuloName = (faseId: number, seccion: number): string => {
  let moduloId = seccion >= 1000 ? Math.floor(seccion / 1000) : Math.floor(seccion / 100);
  if (seccion === 99099) {
    const mods = FASE_MODULOS[faseId] || {};
    const modIds = Object.keys(mods).map(Number);
    moduloId = modIds.length > 0 ? Math.max(...modIds) : 5;
  } else if (faseId === 1) {
    if (moduloId === 1 || moduloId === 2) moduloId = 1;
    else if (moduloId === 3) moduloId = 2;
    else if (moduloId === 4) moduloId = 3;
  }
  return FASE_MODULOS[faseId]?.[moduloId] || `Módulo ${moduloId}`;
};

export const FasesPage: React.FC = () => {
  const { data: fases = [], isLoading } = useFases();
  const [activeFaseId, setActiveFaseId] = useState<number | null>(null);

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>;

  // Filtrar Fase 0 para remover referencias (Fase E.1)
  const fasesActivas = fases.filter(f => f.orden !== 0 && f.id !== 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Fases Pedagógicas</h1>
      <div className="grid grid-cols-1 gap-4">
        {fasesActivas.map(f => (
          <div key={f.id} className="border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
            <div 
              onClick={() => setActiveFaseId(activeFaseId === f.id ? null : f.id)} 
              className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="font-bold">Fase {f.orden}: {f.nombre}</span>
              {activeFaseId === f.id ? <ChevronUp /> : <ChevronDown />}
            </div>
            {activeFaseId === f.id && (
              <div className="p-5 border-t bg-slate-50/55 dark:bg-zinc-950/35 dark:border-zinc-800">
                <FaseConfigList faseId={f.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FaseConfigList: React.FC<{ faseId: number }> = ({ faseId }) => {
  const { data: configs = [], isLoading } = useConfiguraciones(faseId);
  const { updateConfiguracion } = usePedagogiaMutations();
  const [editId, setEditId] = useState<number | null>(null);
  const [pct, setPct] = useState(80);

  if (isLoading) return <p className="text-slate-400 text-xs">Cargando reglas...</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b text-xs font-bold text-slate-400 dark:border-zinc-800">
          <th className="py-2 px-2">Sección / Módulo</th>
          <th className="py-2 px-2">Operación</th>
          <th className="py-2 px-2">Aprobación</th>
          <th className="py-2 px-2 text-right">Acción</th>
        </tr>
      </thead>
      <tbody className="divide-y dark:divide-zinc-800">
        {configs.map(c => (
          <tr key={c.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/20">
            <td className="py-3 px-2 font-semibold text-slate-800 dark:text-slate-200">
              {getModuloName(faseId, c.seccion)}
              <span className="text-slate-400 text-xs font-mono block sm:inline sm:ml-2 font-normal">#Sec {c.seccion}</span>
            </td>
            <td className="py-3 px-2 font-bold text-indigo-600 dark:text-indigo-400">{c.operacion}</td>
            <td className="py-3 px-2">
              {editId === c.id ? (
                <input 
                  type="number" 
                  className="border px-2 py-0.5 rounded-lg w-16 dark:bg-zinc-800 dark:border-zinc-700" 
                  value={pct} 
                  onChange={e => setPct(Number(e.target.value))} 
                />
              ) : (
                `${c.porcentaje_aprobacion}%`
              )}
            </td>
            <td className="py-3 px-2 text-right">
              {editId === c.id ? (
                <button 
                  onClick={async () => { 
                    await updateConfiguracion({ id: c.id, payload: { porcentaje_aprobacion: pct } }); 
                    setEditId(null); 
                  }} 
                  className="inline-flex gap-1 items-center bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Save className="h-3.5 w-3.5" /> Salvar
                </button>
              ) : (
                <button 
                  onClick={() => { 
                    setEditId(c.id); 
                    setPct(c.porcentaje_aprobacion); 
                  }} 
                  className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs transition-colors"
                >
                  Editar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};