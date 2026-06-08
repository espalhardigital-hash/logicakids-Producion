/**
 * Validador Contextual para el Motor de Generación de Preguntas (TypeScript)
 * 
 * Este módulo administra la lógica de si un objeto admite decimales según el tema
 * del nivel (Compras, Monedas, Medidas) y la naturaleza del objeto (Libros, Manzanas).
 * También realiza la segmentación dinámica de enunciados de dos pasos.
 */

// Categorías del diccionario de dominio
const OBJETOS_DISCRETOS = new Set([
  "libros", "cuadernos", "lapices", "juguetes", "pelotas", 
  "manzanas", "personas", "estudiantes", "dulces", "globos", 
  "naranjas", "tazos", "crayones", "chocolates", "bombones"
]);

const OBJETOS_CONTINUOS = new Set([
  "agua", "harina", "leche", "arena", "tela", "madera", "tiempo", 
  "litros", "kilos", "metros"
]);

const OBJETOS_MONETARIOS = new Set([
  "pesos", "dolares", "monedas", "centavos", "dinero", "vuelto", 
  "reales", "reais", "cambio", "precio", "costo"
]);

const TEMAS_DECIMALES_VALIDOS = new Set([
  "compras", "monedas", "medidas", "peso", "longitud", "volumen"
]);

export type MagnitudObjeto = "discreto" | "monetario" | "continuo" | "desconocido";

export interface ParametrosEntrada {
  id?: string;
  tema?: string;
  objeto?: string;
  cajas?: number;
  cantidadPorCaja?: number;
  divisor?: number;
  tipo?: string;
  enunciadoTemplate?: string;
}

export interface ParametrosCalculados {
  cajas: number;
  cantidadPorCaja: number;
  total: number;
  divisor: number;
  respuesta: number;
}

export interface EnunciadosSegmentados {
  paso1: string;
  paso2: string;
}

export interface ResultadoValidacion {
  id: string;
  valido: boolean;
  error: string | null;
  advertencia: string | null;
  parametrosOriginales: ParametrosCalculados;
  parametrosCorregidos: ParametrosCalculados;
  enunciadosSegmentados: EnunciadosSegmentados;
}

/**
 * Clasifica un sustantivo común en su magnitud física.
 */
export function clasificarObjeto(objeto: string): MagnitudObjeto {
  if (!objeto) return "desconocido";
  const objClean = objeto.toLowerCase().trim();
  if (OBJETOS_DISCRETOS.has(objClean)) return "discreto";
  if (OBJETOS_MONETARIOS.has(objClean)) return "monetario";
  if (OBJETOS_CONTINUOS.has(objClean)) return "continuo";
  return "desconocido";
}

/**
 * Recibe los parámetros generados y el tema del nivel para verificar coherencia.
 * Devuelve un objeto con la validez, advertencias y los parámetros corregidos si aplica.
 */
export function validarYCorregirParametros({
  id = "gen-pregunta",
  tema = "reparto",
  objeto = "libros",
  cajas = 1,
  cantidadPorCaja = 1,
  divisor = 1,
  tipo = "simple",
  enunciadoTemplate = ""
}: ParametrosEntrada): ResultadoValidacion {
  const tipoObj = clasificarObjeto(objeto);
  const total = cajas * cantidadPorCaja;
  const respuestaBruta = total / divisor;
  
  // 1. Determinar si el contexto del nivel o del objeto admite decimales
  const admiteDecimales = TEMAS_DECIMALES_VALIDOS.has(tema.toLowerCase()) || 
                           tipoObj === "continuo" || 
                           tipoObj === "monetario";

  let esValido = true;
  let errorMsg: string | null = null;
  let advertenciaMsg: string | null = null;
  
  let cajasCorregidas = cajas;
  let cantidadCorregida = cantidadPorCaja;
  let respuestaCorregida = respuestaBruta;

  // A. Corrección de Inconsistencia en Objetos Discretos (No continuos)
  if (!admiteDecimales && tipoObj === "discreto" && respuestaBruta % 1 !== 0) {
    esValido = false;
    errorMsg = `Inconsistencia de dominio: '${objeto}' es un objeto discreto indivisible, no puede dividirse en partes fraccionarias (${respuestaBruta}).`;
    
    // Buscar la cantidad por caja más cercana que haga la división entera
    let encontrado = false;
    for (let delta = 1; delta < 15; delta++) {
      if ((cajas * (cantidadPorCaja + delta)) % divisor === 0) {
        cantidadCorregida = cantidadPorCaja + delta;
        encontrado = true;
        break;
      }
      if (cantidadPorCaja - delta > 0 && (cajas * (cantidadPorCaja - delta)) % divisor === 0) {
        cantidadCorregida = cantidadPorCaja - delta;
        encontrado = true;
        break;
      }
    }
    
    respuestaCorregida = (cajas * cantidadCorregida) / divisor;
  }

  // B. Corrección de Formato en Módulo de Dinero
  if (tipoObj === "monetario" && respuestaBruta % 1 !== 0) {
    const partes = String(respuestaBruta).split(".");
    if (partes.length > 1 && partes[1].length > 2) {
      advertenciaMsg = "Formato monetario redondeado a centavos.";
      respuestaCorregida = Math.round(respuestaBruta * 100) / 100;
    }
  }

  // C. Segmentación de enunciados para Preguntas de Dos Pasos
  let enunciadoPaso1 = enunciadoTemplate;
  let enunciadoPaso2 = "";
  
  if (tipo === "dos_pasos" && enunciadoTemplate) {
    const partes = enunciadoTemplate.split(". ");
    if (partes.length > 1) {
      enunciadoPaso1 = partes[0] + ".";
      enunciadoPaso2 = partes.slice(1).join(". ");
    }
  }

  return {
    id,
    valido: esValido,
    error: errorMsg,
    advertencia: advertenciaMsg,
    parametrosOriginales: {
      cajas,
      cantidadPorCaja,
      total,
      divisor,
      respuesta: respuestaBruta
    },
    parametrosCorregidos: {
      cajas: cajasCorregidas,
      cantidadPorCaja: cantidadCorregida,
      total: cajasCorregidas * cantidadCorregida,
      divisor,
      respuesta: respuestaCorregida
    },
    enunciadosSegmentados: {
      paso1: enunciadoPaso1,
      paso2: enunciadoPaso2
    }
  };
}
