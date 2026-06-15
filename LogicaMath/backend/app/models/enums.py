import enum

class StatusEnum(str, enum.Enum):
    ACTIVO = "activo"
    INACTIVO = "inactivo"
    ELIMINADO = "eliminado"


class OperacionEnum(str, enum.Enum):
    SUMA = "suma"
    RESTA = "resta"
    MULTIPLICACION = "multiplicacion"
    DIVISION = "division"
    MIXTA = "mixta"


class TipoPreguntaEnum(str, enum.Enum):
    CALCULO_DIRECTO = "calculo_directo"
    PROBLEMA_CONTEXTO = "problema_contexto"
    PROBLEMA_MIXTO = "problema_mixto"
    IDENTIFICAR_OPERACION = "identificar_operacion"
    MULTIPLE_OPCION = "multiple_opcion"
    RESPUESTA_NUMERICA = "respuesta_numerica"
    # Fase 2 — Módulo 4 (Detective de Historias)
    SUBRAYADO_TOKENS = "subrayado_tokens"
    # Fase 2 — Módulo 5 (Constructor de Soluciones)
    CONSTRUCTOR_CHAINED = "constructor_soluciones_chained"


class EstadoProgresoEnum(str, enum.Enum):
    BLOQUEADO = "bloqueado"
    EN_PROGRESO = "en_progreso"
    EN_REVISION = "en_revision"
    APROBADO = "aprobado"


class TipoErrorEnum(str, enum.Enum):
    CALCULO = "calculo"
    LECTURA = "lectura"
    ATENCION = "atencion"
    OPERACION_INCORRECTA = "operacion_incorrecta"
    NO_IDENTIFICA_DATOS = "no_identifica_datos"
    PROBLEMA_INCOMPLETO = "problema_incompleto"
    TABUADA = "tabuada"
    DIVISION = "division"
    VALOR_POSICIONAL = "valor_posicional"
    TROCO = "troco"
    INFERENCIA = "inferencia"


class EstadoSimuladoEnum(str, enum.Enum):
    EN_CURSO = "EN_CURSO"
    FINALIZADO = "FINALIZADO"

