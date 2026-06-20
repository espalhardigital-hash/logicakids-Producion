import { z } from "zod";
import { OperacionEnum, TipoPreguntaEnum, StatusEnum, TipoErrorEnum } from "../../../types/db-enums";

const emptyToNull = z.union([z.string(), z.null()]).transform(val => (val === "" ? null : val));

export const alternativaSchema = z.object({
  id: z.number().optional(), texto: z.string().min(1), es_correcta: z.boolean().default(false),
  orden: z.number().nullable().optional(), tipo_error: z.nativeEnum(TipoErrorEnum).nullable().optional(), feedback_error: emptyToNull.optional()
});

export const preguntaSchema = z.object({
  fase_id: z.number(), seccion: z.number(), sub_nivel: z.number().nullable().optional(),
  estructura_padre_id: emptyToNull.optional(), operacion: z.nativeEnum(OperacionEnum),
  tipo_pregunta: z.nativeEnum(TipoPreguntaEnum), enunciado: z.string().min(5),
  respuesta_correcta: z.string().min(1), datos_numericos: z.any().nullable().optional(),
  estado: z.nativeEnum(StatusEnum).default(StatusEnum.ACTIVO), alternativas: z.array(alternativaSchema).default([])
});

export type PreguntaInput = z.infer<typeof preguntaSchema>;