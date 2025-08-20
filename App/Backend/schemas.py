# schemas.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class DollIn(BaseModel):
    id: str
    nombre: str
    edad: int
    activo: bool=True
    carta: int

class DollOut(DollIn):
    pass

class ClientIn(BaseModel):
    id: str
    nombre: str
    ciudad: str
    motivo: str
    contacto: str

class ClientOut(ClientIn):
    pass

class LetterIn(BaseModel):
    #id: int
    cliente_id: str
    doll_id: Optional[str]= None    
    fecha: date
    estado: str
    contenido_resumen: str

class LetterOut(LetterIn):
   id: int
