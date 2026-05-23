export interface LevelMap {
  id: number;
  name: string;
  seccion: number;
  operacion: string;
  isChallenge?: boolean;
}

export interface ModuleMap {
  id: number;
  name: string;
  levels: LevelMap[];
}

export interface PhaseMap {
  id: number;
  name: string;
  modules: ModuleMap[];
}

export const PHASE_MAPS: PhaseMap[] = [
  {
    id: 1,
    name: "Fase 1: Aritmética Básica",
    modules: [
      {
        id: 1,
        name: "Operaciones Directas",
        levels: [
          { id: 1, name: "Suma Directa", seccion: 1, operacion: "suma" },
          { id: 2, name: "Resta Directa", seccion: 1, operacion: "resta" },
          { id: 3, name: "Multiplicación Directa", seccion: 1, operacion: "multiplicacion" },
          { id: 4, name: "División Directa", seccion: 1, operacion: "division" }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Fase 2: Desarrollo Numérico",
    modules: [
      {
        id: 1,
        name: "Módulo 1: Gimnasio Numérico Mental",
        levels: [
          { id: 1, name: "Multiplicadores de Tamaño", seccion: 101, operacion: "suma" },
          { id: 2, name: "Jerarquía Lógica", seccion: 102, operacion: "suma" },
          { id: 3, name: "Traducción Lógica", seccion: 103, operacion: "suma" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 1011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 1012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 1013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Tablas en Acción",
        levels: [
          { id: 1, name: "Suma e Inversa", seccion: 201, operacion: "multiplicacion" },
          { id: 2, name: "Multiplicación e Inversa", seccion: 202, operacion: "multiplicacion" },
          { id: 3, name: "El Número Faltante", seccion: 203, operacion: "multiplicacion" },
          { id: 4, name: "Gran Integración", seccion: 204, operacion: "multiplicacion" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 2011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 2012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 2013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Tienda Matemática",
        levels: [
          { id: 1, name: "Reconozco el Dinero", seccion: 301, operacion: "mixta" },
          { id: 2, name: "Pago y Cambio", seccion: 302, operacion: "mixta" },
          { id: 3, name: "Carrito de Compras", seccion: 303, operacion: "mixta" },
          { id: 4, name: "Comprador Inteligente", seccion: 304, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 3011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 3012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 3013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: Constructor de Soluciones",
        levels: [
          { id: 1, name: "Dos Pasos Guiados", seccion: 401, operacion: "mixta" },
          { id: 2, name: "Encadenamiento", seccion: 402, operacion: "mixta" },
          { id: 3, name: "Error de Arrastre", seccion: 403, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 4011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 4012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 4013, operacion: "mixta", isChallenge: true }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Fase 3: Problemas de Texto",
    modules: [
      {
        id: 1,
        name: "Módulo 1: El Escáner de la Verdad",
        levels: [
          { id: 1, name: "El Lápiz Mágico", seccion: 101, operacion: "mixta" },
          { id: 2, name: "El Escudo Anti-Basura", seccion: 102, operacion: "mixta" },
          { id: 3, name: "El Laberinto Numérico", seccion: 103, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 1011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 1012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 1013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: La Máquina del Tiempo",
        levels: [
          { id: 1, name: "El Reloj hacia Adelante", seccion: 201, operacion: "mixta" },
          { id: 2, name: "El Reloj en Reversa", seccion: 202, operacion: "mixta" },
          { id: 3, name: "El Tiempo Multiplicado", seccion: 203, operacion: "mixta" },
          { id: 4, name: "El Laberinto del Tiempo", seccion: 204, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 2011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 2012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 2013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: El Ojo del Comerciante",
        levels: [
          { id: 1, name: "El Enigma de los Carritos", seccion: 301, operacion: "mixta" },
          { id: 2, name: "Cruce de Datos", seccion: 302, operacion: "mixta" },
          { id: 3, name: "El Código Oculto", seccion: 303, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 3011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 3012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 3013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: El Maestro del Empaque",
        levels: [
          { id: 1, name: "El Reparto Perfecto", seccion: 401, operacion: "mixta" },
          { id: 2, name: "Las Piezas Sobrantes", seccion: 402, operacion: "mixta" },
          { id: 3, name: "El Ciclo Infinito", seccion: 403, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 4011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 4012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 4013, operacion: "mixta", isChallenge: true }
        ]
      }
    ]
  }
];
