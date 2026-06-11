import { getFaseMetadata } from './LogicaMath/frontend/components/fase_generic/faseMetadata';
import * as fs from 'fs';

function analyzeFase(faseId) {
    const md = getFaseMetadata(faseId);
    if (!md) {
        console.log(`FASE ${faseId} NO EXISTE`);
        return;
    }
    console.log(`\n=== FASE ${faseId}: ${md.nombre} ===`);
    let missingQuestions = 0;
    let totalQuestions = 0;
    
    md.modulos.forEach(m => {
        console.log(`Modulo ${m.moduloId} (${m.nombre}): ${m.niveles.length} niveles`);
        m.niveles.forEach(n => {
            if (!n.preguntas || n.preguntas.length === 0) {
                console.log(`  [ALERTA] Nivel ${n.nivelId} no tiene preguntas.`);
                missingQuestions++;
            } else {
                totalQuestions += n.preguntas.length;
                n.preguntas.forEach((p, idx) => {
                    if (!p.enunciado || !p.tipo || !p.respuesta_correcta) {
                        if (p.tipo !== 'opcion_multiple' || !p.opciones || p.opciones.length === 0) {
                             console.log(`  [ALERTA] Nivel ${n.nivelId} Pregunta ${idx} corrupta:`, p);
                             missingQuestions++;
                        } else if (!p.respuesta_correcta) {
                             console.log(`  [ALERTA] Nivel ${n.nivelId} Pregunta ${idx} sin respuesta_correcta:`, p);
                             missingQuestions++;
                        }
                    }
                });
            }
            
            // Check interactivos
            if (n.teoria && n.teoria.interactivos) {
                n.teoria.interactivos.forEach((int, idx) => {
                     if (!int.respuesta) {
                         console.log(`  [ALERTA] Nivel ${n.nivelId} Interactivo ${idx} sin respuesta`);
                         missingQuestions++;
                     }
                });
            }
        });
    });
    console.log(`Total preguntas válidas: ${totalQuestions}, Errores: ${missingQuestions}`);
}

analyzeFase(7);
analyzeFase(8);
analyzeFase(9);
