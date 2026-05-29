import { useState, useEffect } from 'react';
import { 
  getPreguntasByLevel, deletePregunta, createPregunta, updatePregunta,
  getNivelTeoria, saveNivelTeoria 
} from '../../services/storageService';
import { PHASE_MAPS } from './phaseMaps';

export function useAdminContent() {
  const [mgrFaseId, setMgrFaseId] = useState<number>(2);
  const [mgrModuloId, setMgrModuloId] = useState<number>(1);
  const [mgrLevelId, setMgrLevelId] = useState<number>(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [theory, setTheory] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async (faseId: number, moduloId: number, levelId: number) => {
    setLoading(true);
    const phase = PHASE_MAPS.find(p => p.id === faseId);
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
    loadData(mgrFaseId, mgrModuloId, mgrLevelId);
  }, [mgrFaseId, mgrModuloId, mgrLevelId]);

  return {
    mgrFaseId, setMgrFaseId,
    mgrModuloId, setMgrModuloId,
    mgrLevelId, setMgrLevelId,
    questions, setQuestions,
    theory, setTheory,
    loading
  };
}
