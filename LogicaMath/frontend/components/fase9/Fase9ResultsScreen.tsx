import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Play, RotateCcw,
  AlertCircle, BookOpen, Target,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ResolucaoPaso {
  paso: number;
  texto: string;
}

interface DetalleQuestao {
  pregunta_id: string;
  orden: number;
  enunciado: string;
  alternativas: Record<string, string>;  // { A: "...", B: "...", C: "...", D: "..." }
  resposta_alumno: string | null;        // "A" | "B" | "C" | "D" | null (não respondeu)
  resposta_correta: string;              // "A" | "B" | "C" | "D"
  es_correcta: boolean;
  tema: string;
  resolucao: ResolucaoPaso[];
}

interface ResultadosData {
  puntaje: number;
  total: number;
  porcentaje: number;
  aprobado: boolean;
  simulacro_numero: number;
  proximo_simulacro: number | null;
  detalles: DetalleQuestao[];
  errores: { pregunta_id: string }[];
}

// ─── Componente de una pregunta expandible ─────────────────────────────────

const QuestaoCard: React.FC<{ detalhe: DetalleQuestao; index: number }> = ({ detalhe, index }) => {
  const [expanded, setExpanded] = useState(false);
  const { es_correcta, resposta_alumno, resposta_correta, alternativas, resolucao } = detalhe;

  const LETRAS = ['A', 'B', 'C', 'D'];

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden
        ${es_correcta
          ? 'border-emerald-500/25 bg-emerald-500/5'
          : 'border-rose-500/25 bg-rose-500/5'
        }
      `}
    >
      {/* Cabecera de la pregunta */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Indicador correcto/incorrecto */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
            ${es_correcta ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
          >
            {es_correcta
              ? <CheckCircle2 className="w-5 h-5" />
              : <XCircle className="w-5 h-5" />
            }
          </div>

          <div className="flex-1 min-w-0">
            {/* Número y tema */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-black text-slate-400 tracking-wider">Q{index + 1}</span>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                {detalhe.tema}
              </span>
            </div>

            {/* Enunciado (truncado) */}
            <p className="text-sm text-slate-200 leading-relaxed line-clamp-3 font-serif">
              {detalhe.enunciado}
            </p>

            {/* Respuestas inline */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {/* Respuesta del alumno */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Tu respuesta:</span>
                {resposta_alumno ? (
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg border
                    ${es_correcta
                      ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                      : 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                    }`}
                  >
                    {resposta_alumno}) {alternativas[resposta_alumno]}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 italic">Não respondida</span>
                )}
              </div>

              {!es_correcta && (
                <>
                  <span className="text-slate-600">→</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Correta:</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg border text-emerald-300 bg-emerald-500/15 border-emerald-500/30">
                      {resposta_correta}) {alternativas[resposta_correta]}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Toggle resolução */}
          {resolucao && resolucao.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Resolução</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Panel de resolução expandible */}
      {expanded && resolucao && resolucao.length > 0 && (
        <div className="border-t border-slate-800/80 bg-slate-900/60 p-4 sm:p-5">
          {/* Todas las alternativas */}
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Alternativas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LETRAS.map((letra) => {
                const isCorreta = letra === resposta_correta;
                const isElegida = letra === resposta_alumno;
                const isErrada = isElegida && !isCorreta;

                return (
                  <div
                    key={letra}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm
                      ${isCorreta
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : isErrada
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                      }
                    `}
                  >
                    <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black
                      ${isCorreta ? 'bg-emerald-500 text-white'
                        : isErrada ? 'bg-rose-500 text-white'
                        : 'bg-slate-700 text-slate-400'}
                    `}>
                      {letra}
                    </span>
                    <span className="leading-relaxed">{alternativas[letra]}</span>
                    {isCorreta && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-auto mt-0.5" />}
                    {isErrada && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 ml-auto mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pasos de resolución */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resolução Passo a Passo</p>
            <div className="space-y-3">
              {resolucao.map((paso) => (
                <div key={paso.paso} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-indigo-400">{paso.paso}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{paso.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export const Fase9ResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  if (!state || !state.resultados) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-300 mb-2">Sem resultados</h2>
          <p className="text-slate-500 mb-6">Não há dados para exibir. Complete um simulacro primeiro.</p>
          <button
            onClick={() => navigate('/welcome-fase9')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
          >
            Ir ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const resultados: ResultadosData = state.resultados;
  const { puntaje, total, porcentaje, aprobado, simulacro_numero, proximo_simulacro, detalles } = resultados;

  // Mensagem de performance
  let mensagem = '¡Excelente!';
  let subMensagem = 'Você está pronto para o próximo desafio.';
  let perfColor = 'text-emerald-400';
  let ringColor = 'stroke-emerald-500';
  let bgCard = 'bg-emerald-500/10 border-emerald-500/20';

  if (porcentaje < 60) {
    mensagem = 'Precisa Melhorar';
    subMensagem = 'Estude a resolução de cada questão e tente novamente.';
    perfColor = 'text-rose-400';
    ringColor = 'stroke-rose-500';
    bgCard = 'bg-rose-500/10 border-rose-500/20';
  } else if (porcentaje < 80) {
    mensagem = 'Bom Progresso!';
    subMensagem = 'Continue praticando para alcançar a excelência.';
    perfColor = 'text-yellow-400';
    ringColor = 'stroke-yellow-500';
    bgCard = 'bg-yellow-500/10 border-yellow-500/20';
  }

  const circunferencia = 2 * Math.PI * 54;
  const dashOffset = circunferencia - (circunferencia * porcentaje) / 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/welcome-fase9')}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-white text-base">Resultado do Simulacro</h1>
          <p className="text-xs text-slate-400">Simulacro {simulacro_numero} · Pedro II</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">

        {/* Score card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Círculo de puntuación */}
          <div className={`lg:col-span-1 rounded-2xl border p-6 flex flex-col items-center text-center ${bgCard}`}>
            {/* SVG circular */}
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" className="stroke-slate-800" strokeWidth="10" fill="none" />
                <circle
                  cx="60" cy="60" r="54"
                  className={`${ringColor} transition-all duration-1000 ease-out`}
                  strokeWidth="10"
                  strokeDasharray={circunferencia}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${perfColor}`}>{Math.round(porcentaje)}%</span>
              </div>
            </div>

            <h2 className={`text-xl font-black mb-1 ${perfColor}`}>{mensagem}</h2>
            <p className="text-slate-400 text-sm mb-5">{subMensagem}</p>

            {/* Aciertos / Total */}
            <div className={`w-full flex justify-around items-center py-3 px-4 rounded-xl border ${bgCard}`}>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Acertos</p>
                <p className={`text-2xl font-black ${perfColor}`}>{puntaje}</p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                <p className="text-2xl font-black text-slate-300">{total}</p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <p className={`text-sm font-black ${aprobado ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {aprobado ? '✓ Aprovado' : '✗ Reprovado'}
                </p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="w-full space-y-2 mt-5">
              {aprobado && proximo_simulacro && (
                <button
                  onClick={() => navigate(`/fase/9/game/${proximo_simulacro}/0`)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
                >
                  <Play className="w-4 h-4" />
                  Próximo Simulacro ({proximo_simulacro})
                </button>
              )}
              {!aprobado && (
                <button
                  onClick={() => navigate(`/fase/9/game/${simulacro_numero}/0`)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Tentar Novamente
                </button>
              )}
              <button
                onClick={() => navigate('/welcome-fase9')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors border border-slate-700 text-sm"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>

          {/* Resumen rápido de las 10 preguntas */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Target className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Resumo das Questões</h3>
                <p className="text-xs text-slate-400">
                  {puntaje} acertos · {total - puntaje} erros
                </p>
              </div>
            </div>

            {/* Grid visual 10 preguntas */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-5">
              {(detalles ?? []).map((d, i) => (
                <div
                  key={d.pregunta_id}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black
                    ${d.es_correcta
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }
                  `}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                <span>Acertou</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30" />
                <span>Errou</span>
              </div>
              {aprobado ? (
                <div className="ml-auto flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-400 font-bold">Simulacro aprovado!</span>
                </div>
              ) : (
                <div className="ml-auto text-rose-400 font-bold">
                  Mínimo 6/10 para aprovar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista expandible de cada questão */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-black text-white">Gabarito Completo</h2>
            <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
              Clique em "Resolução" para ver o passo a passo
            </span>
          </div>

          <div className="space-y-3">
            {(detalles ?? []).map((detalhe, i) => (
              <QuestaoCard key={detalhe.pregunta_id} detalhe={detalhe} index={i} />
            ))}
          </div>
        </div>

        {/* Footer de ação */}
        <div className="border-t border-slate-800 pt-6 pb-8 flex flex-col sm:flex-row gap-3 justify-center">
          {aprobado && proximo_simulacro && (
            <button
              onClick={() => navigate(`/fase/9/game/${proximo_simulacro}/0`)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
            >
              <Play className="w-5 h-5" />
              Próximo Simulacro ({proximo_simulacro})
            </button>
          )}
          {!aprobado && (
            <button
              onClick={() => navigate(`/fase/9/game/${simulacro_numero}/0`)}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Tentar Novamente
            </button>
          )}
          <button
            onClick={() => navigate('/welcome-fase9')}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors border border-slate-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};
