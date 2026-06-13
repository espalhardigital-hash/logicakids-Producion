import { execSync } from 'child_process';

export interface LevelInfo {
  nivel_id: number;
  seccion: number;
  isDesafio: boolean;
}

export interface ModuleInfo {
  modulo_id: number;
  niveles: LevelInfo[];
  desafios: LevelInfo[];
}

export interface PhaseMetadata {
  fase_id: number;
  modulos: ModuleInfo[];
}

/**
 * Consulta la base de datos de test y devuelve todos los módulos, niveles y desafíos disponibles para una fase.
 * Se salta las secciones especiales como 99099 (admin/dummies).
 */
export function getPhaseMetadata(faseId: number): PhaseMetadata {
  const query = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT DISTINCT seccion FROM preguntas WHERE fase_id = ${faseId} ORDER BY seccion"`;
  
  let result = '';
  try {
    result = execSync(query).toString().trim();
  } catch (e) {
    console.error(`Error al consultar las secciones de la fase ${faseId}:`, e);
    return { fase_id: faseId, modulos: [] };
  }

  if (!result) return { fase_id: faseId, modulos: [] };

  const sections = result.split('\n').map(s => parseInt(s.trim())).filter(s => !isNaN(s) && s < 90000);

  const modulosMap = new Map<number, ModuleInfo>();

  for (const seccion of sections) {
    let modulo_id = 1;
    let isDesafio = false;
    let nivel_id = 1;

    // Lógica para descifrar la sección
    // Fases 1 a 6 usan el formato 101, 102... para niveles y 1011, 1012... para desafíos
    if (seccion < 1000) {
      modulo_id = Math.floor(seccion / 100);
      nivel_id = seccion % 100;
      isDesafio = false;
    } else {
      modulo_id = Math.floor(seccion / 1000);
      nivel_id = seccion % 1000; // Podría ser 011, 012 etc. pero lo trataremos como desafío
      isDesafio = true;
    }

    if (!modulosMap.has(modulo_id)) {
      modulosMap.set(modulo_id, { modulo_id, niveles: [], desafios: [] });
    }

    const mod = modulosMap.get(modulo_id)!;
    if (isDesafio) {
      mod.desafios.push({ nivel_id, seccion, isDesafio });
    } else {
      mod.niveles.push({ nivel_id, seccion, isDesafio });
    }
  }

  // Ordenar los modulos
  const modulos = Array.from(modulosMap.values()).sort((a, b) => a.modulo_id - b.modulo_id);
  
  return { fase_id: faseId, modulos };
}
