from pydantic import BaseModel
from typing import Optional, List

class NivelTeoriaSave(BaseModel):
    fase_id: int
    modulo_id: int
    nivel_id: int
    titulo: str
    texto_descubrimiento: str
    diccionario: Optional[dict] = None
    advertencia: Optional[str] = None
    ejemplos: Optional[list] = None
    interactivos: Optional[list] = None

class ProgressOverridePayload(BaseModel):
    fase_id: int
    seccion: int
    operacion: str
    action: str # "approve", "unlock", "lock"

class ProgressOverrideItem(BaseModel):
    fase_id: int
    seccion: int
    operacion: str

class ProgressOverrideBulkPayload(BaseModel):
    items: List[ProgressOverrideItem]
    action: str # "approve", "unlock", "lock"

class SystemConfigUpdate(BaseModel):
    vps_host: str
    ssh_user: str
    database_url: str
