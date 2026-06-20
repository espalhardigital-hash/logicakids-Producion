import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock, ChevronRight, Trophy, BookOpen, Star,
  Clock, RotateCcw, Play, ArrowLeft, Loader2,
  CheckCircle2, Target, Zap, AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SimuladoInfo {
  numero: number;
  nome: string;
  modulo: number;
  dificuldade: 'facil' | 'medio' | 'dificil';
  tempo_minutos: number;
  estado: 'bloqueado' | 'disponivel' | 'concluido';
  melhor_porcentagem: number;
  aprovado: boolean;
}

interface ModuloInfo {
  modulo_id: number;
  nome: string;
  descricao: string;
  cor: string;
  total_simulacros: number;
  aprobados: number;
  porcentaje_modulo: number;
}

interface ProgressoData {
  simulacros: SimuladoInfo[];
  modulos: ModuloInfo[];
}

interface WelcomeScreenPhase9Props {
  studentName?: string;
  userAvatar?: string;
  userRole?: string;
  onModuleSelect: (moduloId: number, nivelId: number) => void;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIFICULDADE_LABEL: Record<string, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

const DIFICULDADE_COLOR: Record<string, string> = {
  facil: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medio: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  dificil: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const MODULO_ICONS = [BookOpen, Target, Zap];

// ─── Component ────────────────────────────────────────────────────────────────

export default function WelcomeScreenPhase9({
  studentName = 'Estudiante',
  userAvatar,
  userRole,
  onModuleSelect,
  onBack,
}: WelcomeScreenPhase9Props) {
  const [progresso, setProgresso] = useState<ProgressoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduloSelecionado, setModuloSelecionado] = useState<number | null>(null);

  // ── Fetch progresso from backend ──────────────────────────────────────────

  const fetchProgresso = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const res = await fetch('/api/fases/9/simulados/progresso', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao carregar progresso');
      const data: ProgressoData = await res.json();
      setProgresso(data);
    } catch (e: any) {
      setError(e.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgresso();
  }, [fetchProgresso]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const simulacrosDoModulo = moduloSelecionado
    ? (progresso?.simulacros ?? []).filter(s => s.modulo === moduloSelecionado)
    : [];

  const moduloAtivo = progresso?.modulos.find(m => m.modulo_id === moduloSelecionado);

  const totalAprobados = progresso?.simulacros.filter(s => s.aprovado).length ?? 0;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleIniciar = (simulacro: SimuladoInfo) => {
    if (simulacro.estado === 'bloqueado') return;
    // moduloId lleva el simulacro_numero; nivelId se ignora (store usa solo simulacro_numero)
    onModuleSelect(simulacro.numero, 0);
  };

  const handleBack = () => {
    if (moduloSelecionado !== null) {
      setModuloSelecionado(null);
    } else {
      onBack();
    }
  };

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-sm">Carregando simulacros...</p>
        </div>
      </div>
    );
  }

  if (error || !progresso) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro ao carregar</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchProgresso}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ── Vista: Lista de simulacros de un módulo ──────────────────────────────

  if (moduloSelecionado !== null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{moduloAtivo?.nome}</h1>
            <p className="text-xs text-slate-400">{moduloAtivo?.descricao}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-slate-400">
              <span className="text-emerald-400 font-bold">{moduloAtivo?.aprobados}</span>
              /{moduloAtivo?.total_simulacros} aprovados
            </span>
          </div>
        </header>

        {/* Lista de simulacros */}
        <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-3">
          {simulacrosDoModulo.map((sim) => {
            const bloqueado = sim.estado === 'bloqueado';
            const concluido = sim.estado === 'concluido';
            const disponivel = sim.estado === 'disponivel';

            return (
              <div
                key={sim.numero}
                onClick={() => !bloqueado && handleIniciar(sim)}
                className={`fg-level-card
                  relative rounded-2xl border p-5 transition-all duration-200
                  ${bloqueado
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                    : concluido
                      ? 'bg-slate-900 border-emerald-500/20 hover:border-emerald-500/40'
                      : 'bg-slate-900 border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Número / Status */}
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-lg
                    ${bloqueado
                      ? 'bg-slate-800 text-slate-600'
                      : concluido
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-indigo-500/15 text-indigo-300'
                    }
                  `}>
                    {bloqueado ? (
                      <Lock className="w-6 h-6" />
                    ) : concluido ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      sim.numero
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-white text-sm leading-tight">{sim.nome}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFICULDADE_COLOR[sim.dificuldade]}`}>
                        {DIFICULDADE_LABEL[sim.dificuldade]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sim.tempo_minutos} min
                      </span>
                      <span>·</span>
                      <span>10 questões</span>
                      {sim.melhor_porcentagem > 0 && (
                        <>
                          <span>·</span>
                          <span className={`font-bold ${sim.aprovado ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            Melhor: {sim.melhor_porcentagem.toFixed(0)}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Barra de progresso (si tiene intento) */}
                    {sim.melhor_porcentagem > 0 && (
                      <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${sim.aprovado ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                          style={{ width: `${sim.melhor_porcentagem}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Botão de ação */}
                  {!bloqueado && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleIniciar(sim); }}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex-shrink-0
                        ${concluido
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/30'
                        }
                      `}
                    >
                      {concluido ? (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>Rever</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Iniciar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  }

  // ── Vista principal: 3 módulos ────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                FASE 9
              </span>
              <h1 className="text-base font-bold text-white hidden sm:block">
                Simulacros Colégio Pedro II
              </h1>
            </div>
            <p className="text-xs text-slate-400">Olá, {studentName}!</p>
          </div>
        </div>

        {/* Progresso global */}
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-white">
            {totalAprobados}
            <span className="text-slate-400 font-normal">/20</span>
          </span>
          <span className="text-xs text-slate-400 hidden sm:block">simulacros</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">

        {/* Barra de progresso global */}
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
              Progresso Geral da Fase 9
            </span>
            <span className="text-sm font-black text-white">
              {totalAprobados}/20
              <span className="text-slate-400 font-normal text-xs ml-1">aprovados</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${(totalAprobados / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Grid de módulos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {progresso.modulos.map((modulo, idx) => {
            const Icon = MODULO_ICONS[idx] ?? BookOpen;
            const simulacrosDoMod = progresso.simulacros.filter(s => s.modulo === modulo.modulo_id);
            const proxDisponivel = simulacrosDoMod.find(s => s.estado === 'disponivel');
            const todoBloqueado = simulacrosDoMod.every(s => s.estado === 'bloqueado');

            return (
              <button
                key={modulo.modulo_id}
                onClick={() => !todoBloqueado && setModuloSelecionado(modulo.modulo_id)}
                disabled={todoBloqueado}
                className={`fg-module-card
                  relative text-left rounded-2xl border p-6 transition-all duration-200 group
                  ${todoBloqueado
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600 cursor-pointer active:scale-[0.98]'
                  }
                `}
                style={!todoBloqueado ? { '--mod-color': modulo.cor } as React.CSSProperties : {}}
              >
                {/* Ícono */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: todoBloqueado ? 'rgba(255,255,255,0.03)' : `${modulo.cor}18` }}
                >
                  {todoBloqueado
                    ? <Lock className="w-5 h-5 text-slate-600" />
                    : <Icon className="w-6 h-6" style={{ color: modulo.cor }} />
                  }
                </div>

                {/* Info */}
                <h2 className="font-black text-white text-base mb-1">{modulo.nome}</h2>
                <p className="text-slate-400 text-xs leading-relaxed mb-5">{modulo.descricao}</p>

                {/* Progresso do módulo */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 uppercase tracking-wider font-bold">Progresso</span>
                    <span className="font-black" style={{ color: todoBloqueado ? '#475569' : modulo.cor }}>
                      {modulo.aprobados}/{modulo.total_simulacros}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${modulo.porcentaje_modulo}%`,
                        background: todoBloqueado ? '#334155' : modulo.cor,
                      }}
                    />
                  </div>
                </div>

                {/* CTA */}
                {!todoBloqueado && (
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {proxDisponivel
                        ? `Próximo: Simulacro ${proxDisponivel.numero}`
                        : modulo.aprobados === modulo.total_simulacros
                          ? '✓ Módulo concluído'
                          : 'Ver simulacros'
                      }
                    </span>
                    <ChevronRight
                      className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Banner de conclusão quando completo */}
        {totalAprobados === 20 && (
          <div className="mt-8 bg-gradient-to-r from-emerald-900/30 to-indigo-900/30 border border-emerald-500/30 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-1">🎉 Parabéns, {studentName}!</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Você completou todos os 20 simulacros do Colégio Pedro II.
                Você está pronto para o exame real!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
