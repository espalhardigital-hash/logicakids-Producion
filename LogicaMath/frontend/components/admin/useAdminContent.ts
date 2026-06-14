import { useState, useEffect } from 'react';
import { 
  getPreguntasByLevel, deletePregunta, createPregunta, updatePregunta,
  getNivelTeoria, saveNivelTeoria 
} from '../../services/storageService';
import { usePhaseMapContext } from './PhaseMapContext';

export function useAdminContent() {
  const { phaseMaps } = usePhaseMapContext();
  const [mgrFaseId, setMgrFaseId] = useState<number>(
    () => parseInt(localStorage.getItem('admin_content_fase') || '2', 10)
  );
  const [mgrModuloId, setMgrModuloId] = useState<number>(
    () => parseInt(localStorage.getItem('admin_content_modulo') || '1', 10)
  );
  const [mgrLevelId, setMgrLevelId] = useState<number>(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [theory, setTheory] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async (faseId: number, moduloId: number, levelId: number) => {
    setLoading(true);
    const phase = phaseMaps.find(p => p.id === faseId);
    const mod = phase?.modules.find(m => m.id === moduloId);
    const lvl = mod?.levels.find(l => l.id === levelId);

    if (!lvl) {
      setLoading(false);
      return;
    }

    try {
      const questionsRes = await getPreguntasByLevel(faseId, lvl.seccion, lvl.operacion);
      setQuestions(questionsRes);
      
      const theoryRes = await getNivelTeoria(faseId, moduloId, levelId);
      if (theoryRes) {
        setTheory({
          ...theoryRes,
          diccionario: theoryRes.diccionario || {},
          ejemplos: theoryRes.ejemplos || [],
          interactivos: theoryRes.interactivos || []
        });
      } else {
        setTheory({
          fase_id: faseId,
          modulo_id: moduloId,
          nivel_id: levelId,
          titulo: "",
          texto_descubrimiento: "",
          advertencia: "",
          diccionario: {},
          ejemplos: [],
          interactivos: []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phaseMaps.length > 0) {
      loadData(mgrFaseId, mgrModuloId, mgrLevelId);
    }
  }, [mgrFaseId, mgrModuloId, mgrLevelId, phaseMaps]);

  return {
    mgrFaseId, setMgrFaseId,
    mgrModuloId, setMgrModuloId,
    mgrLevelId, setMgrLevelId,
    questions, setQuestions,
    theory, setTheory,
    loading
  };
}
