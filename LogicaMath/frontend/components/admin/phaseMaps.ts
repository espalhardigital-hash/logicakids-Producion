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
          {
            id: 1,
            name: "Suma Directa",
            seccion: 1,
            operacion: "suma"
          },
          {
            id: 2,
            name: "Resta Directa",
            seccion: 1,
            operacion: "resta"
          },
          {
            id: 3,
            name: "Multiplicación Directa",
            seccion: 1,
            operacion: "multiplicacion"
          },
          {
            id: 4,
            name: "División Directa",
            seccion: 1,
            operacion: "division"
          },
          {
            id: 99,
            name: "Desafío Mixto (Examen Final)",
            seccion: 99099,
            operacion: "mixta",
            isChallenge: true
          }
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
          {
            id: 1,
            name: "Multiplicadores de Tamaño",
            seccion: 101,
            operacion: "suma"
          },
          {
            id: 2,
            name: "Jerarquía Lógica",
            seccion: 102,
            operacion: "suma"
          },
          {
            id: 3,
            name: "Traducción Lógica",
            seccion: 103,
            operacion: "suma"
          },
          {
            id: 11,
            name: "Desafío 1 (Estándar)",
            seccion: 1011,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2 (Avanzado)",
            seccion: 1012,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final (Maestría)",
            seccion: 1013,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Tablas en Acción",
        levels: [
          {
            id: 1,
            name: "Suma e Inversa",
            seccion: 201,
            operacion: "multiplicacion"
          },
          {
            id: 2,
            name: "Multiplicación e Inversa",
            seccion: 202,
            operacion: "multiplicacion"
          },
          {
            id: 3,
            name: "El Número Faltante",
            seccion: 203,
            operacion: "multiplicacion"
          },
          {
            id: 4,
            name: "Gran Integración",
            seccion: 204,
            operacion: "multiplicacion"
          },
          {
            id: 11,
            name: "Desafío 1 (Estándar)",
            seccion: 2011,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2 (Avanzado)",
            seccion: 2012,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final (Maestría)",
            seccion: 2013,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Tienda Matemática",
        levels: [
          {
            id: 1,
            name: "Reconozco el Dinero",
            seccion: 301,
            operacion: "mixta"
          },
          {
            id: 2,
            name: "Pago y Cambio",
            seccion: 302,
            operacion: "mixta"
          },
          {
            id: 3,
            name: "Carrito de Compras",
            seccion: 303,
            operacion: "mixta"
          },
          {
            id: 4,
            name: "Comprador Inteligente",
            seccion: 304,
            operacion: "mixta"
          },
          {
            id: 11,
            name: "Desafío 1 (Estándar)",
            seccion: 3011,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2 (Avanzado)",
            seccion: 3012,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final (Maestría)",
            seccion: 3013,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: Constructor de Soluciones",
        levels: [
          {
            id: 1,
            name: "Dos Pasos Guiados",
            seccion: 401,
            operacion: "mixta"
          },
          {
            id: 2,
            name: "Encadenamiento",
            seccion: 402,
            operacion: "mixta"
          },
          {
            id: 3,
            name: "Error de Arrastre",
            seccion: 403,
            operacion: "mixta"
          },
          {
            id: 11,
            name: "Desafío 1 (Estándar)",
            seccion: 4011,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2 (Avanzado)",
            seccion: 4012,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final (Maestría)",
            seccion: 4013,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 99,
        name: "Graduación y Examen Final",
        levels: [
          {
            id: 99,
            name: "Desafío Mixto (Examen Final)",
            seccion: 99099,
            operacion: "mixta",
            isChallenge: true
          }
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
        name: "Módulo 1: Lectura Matemática",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 3011,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 3012,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 3013,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Extracción de Datos",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 3021,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 3022,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 3023,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Enigmas Numéricos",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 3031,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 3032,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 3033,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: Historias con Contexto",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 3041,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 3042,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 3043,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Fase 4: Fracciones, Porcentajes y Proporciones",
    modules: [
      {
        id: 1,
        name: "Módulo 1: La Fracción Visual",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 4011,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 4012,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 4013,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Fracción de Cantidad",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 4021,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 4022,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 4023,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Porcentajes Rápidos",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 4031,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 4032,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 4033,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: Razón y Mezclas",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 4041,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 4042,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 4043,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Fase 5: Geometría Plana y Medidas",
    modules: [
      {
        id: 1,
        name: "Módulo 1: Perímetro y Borde",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 5011,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 5012,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 5013,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Área en Cuadrícula",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 5021,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 5022,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 5023,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Figuras Compuestas",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 5031,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 5032,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 5033,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: Conversión y Pantallas",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 5041,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 5042,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 5043,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Fase 6: Geometría Espacial y Volumen",
    modules: [
      {
        id: 1,
        name: "Módulo 1: Reconocimiento 3D",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 6011,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 6012,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 6013,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Patrones de Crecimiento",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 6021,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 6022,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 6023,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Cubos Unitarios",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 6031,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 6032,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 6033,
            operacion: "mixta",
            isChallenge: false
          }
        ]
      }
    ]
  },
  {
    id: 7,
    name: "Fase 7: Coordenadas, Rutas y Tiempo",
    modules: [
      {
        id: 1,
        name: "Módulo 1: Orientación Cardinal",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 7011,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 7012,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 7013,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 11,
            name: "Desafío 1: Navegación",
            seccion: 70111,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2: Explorador",
            seccion: 70112,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final: Maestro",
            seccion: 70113,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Plano Cartesiano",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 7021,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 7022,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 7023,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 11,
            name: "Desafío 1: Cartesiano",
            seccion: 70211,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2: Topógrafo",
            seccion: 70212,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final: Geómetra",
            seccion: 70213,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: La Mecánica del Tiempo",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 7031,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 7032,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 7033,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 11,
            name: "Desafío 1: Cronómetro",
            seccion: 70311,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2: Calculista",
            seccion: 70312,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final: Maestro del Tiempo",
            seccion: 70313,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: Horarios y Apps",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 7041,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 7042,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 7043,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 11,
            name: "Desafío 1: Coordinador",
            seccion: 70411,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2: Despachador",
            seccion: 70412,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final: Logístico",
            seccion: 70413,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      }
    ]
  },
  {
    id: 8,
    name: "Fase 8: Lógica, Combinatoria y Probabilidad",
    modules: [
      {
        id: 1,
        name: "Módulo 1: Secuencias Lógicas",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 8011,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 8012,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 8013,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 11,
            name: "Desafío 1: Extensión directa",
            seccion: 80111,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2: Reglas simultáneas",
            seccion: 80112,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final: Exponencial",
            seccion: 80113,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Combinatoria Visual",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 8021,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 8022,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 8023,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 11,
            name: "Desafío 1: Multiplicación",
            seccion: 80211,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2: Restricciones",
            seccion: 80212,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final: Empaquetado tech",
            seccion: 80213,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Probabilidad",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 8031,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 8032,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 8033,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 11,
            name: "Desafío 1: Fracción simple",
            seccion: 80311,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 12,
            name: "Desafío 2: Cambio de espacio",
            seccion: 80312,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 13,
            name: "Desafío Final: Mezcla compleja",
            seccion: 80313,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      }
    ]
  },
  {
    id: 9,
    name: "Fase 9: Simulados Colegio Pedro II",
    modules: [
      {
        id: 1,
        name: "Módulo 1: Simulados Cortos",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 9011,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 9012,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 9013,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 4,
            name: "Desafío 1: Filtro de Tiempo",
            seccion: 9014,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 5,
            name: "Desafío 2: Enunciados Largos",
            seccion: 9015,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 6,
            name: "Desafío Final: Candado Corto",
            seccion: 9016,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Simulados Completos",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 9021,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 9022,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 9023,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 4,
            name: "Desafío 1: Corte Resistencia",
            seccion: 9024,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 5,
            name: "Desafío 2: Banco Error",
            seccion: 9025,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 6,
            name: "Desafío Final: Maestro",
            seccion: 9026,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Revisión Dirigida y Tutoría IA",
        levels: [
          {
            id: 1,
            name: "Descubrimiento",
            seccion: 9031,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 2,
            name: "Consolidación",
            seccion: 9032,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 3,
            name: "Fluidez",
            seccion: 9033,
            operacion: "mixta",
            isChallenge: false
          },
          {
            id: 4,
            name: "Desafío 1: Filtro Corrección",
            seccion: 9034,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 5,
            name: "Desafío 2: Trampa Recurrente",
            seccion: 9035,
            operacion: "mixta",
            isChallenge: true
          },
          {
            id: 6,
            name: "Desafío Final: Graduación",
            seccion: 9036,
            operacion: "mixta",
            isChallenge: true
          }
        ]
      }
    ]
  }
];
