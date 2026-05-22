import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetectiveNotebook } from './DetectiveNotebook';
import { OperationBuilder } from './OperationBuilder';
import api from '../../services/api';
import './Fase3Styles.css';

interface TokenData {
  id: string;
  word: string;
  isNumeric: boolean;
  value?: number;
  isValid?: boolean;
}

export const Fase3GameScreen: React.FC = () => {
  const { moduloId, nivelId } = useParams<{ moduloId: string; nivelId: string }>();
  const navigate = useNavigate();

  const [preguntaId, setPreguntaId] = useState<number | null>(null);
  const [enunciadoText, setEnunciadoText] = useState<string>('');
  const [tokens, setTokens] = useState<(string | TokenData)[]>([]);
  
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Bucle Espejo y Feedback
  const [mirrorLoopAlert, setMirrorLoopAlert] = useState<{ active: boolean, msg: string }>({ active: false, msg: '' });

  useEffect(() => {
    loadNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduloId, nivelId]);

  const loadNextQuestion = async () => {
    setIsLoading(true);
    setMirrorLoopAlert({ active: false, msg: '' });
    setAvailableNumbers([]);
    try {
      const response = await api.get(`/fase3/modulo/${moduloId}/nivel/${nivelId}/pregunta`);
      const q = response.data;
      setPreguntaId(q.id);
      setEnunciadoText(q.enunciado);
      
      // Simulación de parser de tokens: (Esto vendría idealmente de q.datos_numericos)
      // Ejemplo: Convertimos "Juan tiene 5 manzanas." a un arreglo.
      // Para efectos de UI, si no hay tokens, lo ponemos como string directo.
      if (q.datos_numericos?.tokens) {
        setTokens(q.datos_numericos.tokens);
      } else {
        setTokens([q.enunciado]);
        // Y cargamos unos números random para probar si no hay parser
        setAvailableNumbers(extractNumbers(q.enunciado));
      }

    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractNumbers = (text: string): number[] => {
    const nums = text.match(/\d+/g);
    return nums ? nums.map(Number) : [];
  };

  const handleDataFound = (num: number) => {
    setAvailableNumbers(prev => [...prev, num]);
  };

  const handleSubmitOperation = async (result: number) => {
    if (!preguntaId) return;

    try {
      const resp = await api.post('/fase3/responder', {
        modulo_id: Number(moduloId),
        nivel_id: Number(nivelId),
        pregunta_id: preguntaId,
        respuesta_dada: String(result),
        tiempo_respuesta_segundos: 15 // Mock temporal
      });

      const { es_correcta, espejo_activado, bloque_completado, early_exit } = resp.data;

      if (es_correcta) {
        if (bloque_completado) {
          navigate('/dashboard'); // O pantalla de victoria
        } else {
          loadNextQuestion();
        }
      } else {
        if (early_exit) {
          alert("¡Demasiados errores en el desafío! El progreso se ha reiniciado.");
          navigate('/dashboard');
        } else if (espejo_activado) {
          setMirrorLoopAlert({
            active: true,
            msg: `¡Ups! Esa operación no es correcta. Analiza de nuevo el Cuaderno. ¡Aquí tienes una oportunidad espejo!`
          });
          // Esperamos 3 segundos y cargamos el espejo
          setTimeout(() => {
            loadNextQuestion();
          }, 3500);
        } else {
          setMirrorLoopAlert({
            active: true,
            msg: `¡Respuesta incorrecta! Vuelve a intentarlo.`
          });
        }
      }

    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  if (isLoading) {
    return <div className="fase3-container flex items-center justify-center"><h2>Cargando Misión...</h2></div>;
  }

  return (
    <div className="fase3-container p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-orange-500">Módulo {moduloId} - Nivel {nivelId}</h1>
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white">
            Volver a la Base
          </button>
        </header>

        {mirrorLoopAlert.active && (
          <div className="mirror-loop-alert mb-6">
            <h4>Bucle Espejo Activado</h4>
            <p>{mirrorLoopAlert.msg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lado Izquierdo: Cuaderno del Detective */}
          <div>
            <DetectiveNotebook 
              textSegments={tokens} 
              onDataFound={handleDataFound} 
            />
          </div>

          {/* Lado Derecho: Area de acción */}
          <div className="flex flex-col justify-end">
            <OperationBuilder 
              availableNumbers={availableNumbers} 
              onSubmit={handleSubmitOperation}
              onClear={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
