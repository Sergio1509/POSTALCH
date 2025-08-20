# main.py
from fastapi import FastAPI, HTTPException
from .database import get_connection  
from pydantic import BaseModel
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import oracledb


app = FastAPI(title="Postal CH API con Oracle")

# Permitir solicitudes desde el frontend
origins = [
    "http://localhost:5173",  # frontend Vite
    "http://127.0.0.1:5173",  # alternativa si usas 127.0.0.1
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # sitios permitidos
    allow_credentials=True,
    allow_methods=["*"],          # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],          # headers permitidos
)

#   SCHEMAS
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

def pick_available_doll():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT d.id
        FROM dolls d
        LEFT JOIN (
            SELECT doll_id, COUNT(*) cnt
            FROM letters
            WHERE estado IN ('borrador')
            GROUP BY doll_id
        ) l ON d.id = l.doll_id
        WHERE d.activo = 1
          AND NVL(l.cnt, 0) < 5
        ORDER BY NVL(l.cnt, 0), d.id
        FETCH FIRST 1 ROWS ONLY
    """)
    row = cur.fetchone()
    cur.close(); conn.close()
    return row[0] if row else None

#   ENDPOINTS

# ---- Dolls ----
@app.post("/api/dolls", response_model=DollOut)
def create_doll(payload: DollIn):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO dolls (id, nombre, edad, activo, carta)
        VALUES (:1, :2, :3, :4, :5)
    """, (payload.id, payload.nombre, payload.edad, payload.activo, payload.carta))
    conn.commit()
    cur.close(); conn.close()
    return DollOut(**payload.dict())

@app.get("/api/dolls", response_model=list[DollOut])
def list_dolls():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, nombre, edad, activo, carta FROM dolls")
    result = [DollOut(id=row[0], nombre=row[1], edad=row[2], activo=row[3], carta=row[4]) for row in cur]
    cur.close(); conn.close()
    return result

@app.put("/api/dolls/{doll_id}", response_model=DollOut)
def update_doll(doll_id: str, payload: DollIn):
    conn = get_connection()
    cur = conn.cursor()

    # Verificar si el doll existe
    cur.execute("SELECT COUNT(*) FROM dolls WHERE id = :1", (doll_id,))
    if cur.fetchone()[0] == 0:
        cur.close(); conn.close()
        raise HTTPException(404, "Doll no encontrado")

    # Actualizar doll
    cur.execute("""
        UPDATE dolls
        SET nombre = :1,
            edad = :2,
            activo = :3,
            carta = :4
        WHERE id = :5
    """, (payload.nombre, payload.edad, payload.activo, payload.carta, doll_id))

    conn.commit()
    cur.close(); conn.close()

    data = payload.dict()
    data["id"] = doll_id
    return DollOut(**data)

# ---- Clients ----
@app.post("/api/clients", response_model=ClientOut)
def create_client(payload: ClientIn):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO clients (id, nombre, ciudad, motivo, contacto)
        VALUES (:1, :2, :3, :4, :5)
    """, (payload.id, payload.nombre, payload.ciudad, payload.motivo, payload.contacto))
    conn.commit()
    cur.close(); conn.close()
    return ClientOut(**payload.dict())

@app.get("/api/clients", response_model=list[ClientOut])
def list_clients():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, nombre, ciudad, motivo, contacto FROM clients")
    result = [ClientOut(id=r[0], nombre=r[1], ciudad=r[2], motivo=r[3], contacto=r[4]) for r in cur]
    cur.close(); conn.close()
    return result

@app.put("/api/clients/{client_id}", response_model=ClientOut)
def update_client(client_id: str, payload: ClientIn):
    conn = get_connection()
    cur = conn.cursor()

    # Verificar si el cliente existe
    cur.execute("SELECT COUNT(*) FROM clients WHERE id = :1", (client_id,))
    if cur.fetchone()[0] == 0:
        cur.close(); conn.close()
        raise HTTPException(404, "Cliente no encontrado")

    # Actualizar cliente
    cur.execute("""
        UPDATE clients
        SET nombre = :1,
            ciudad = :2,
            motivo = :3,
            contacto = :4
        WHERE id = :5
    """, (payload.nombre, payload.ciudad, payload.motivo, payload.contacto, client_id))

    conn.commit()
    cur.close(); conn.close()

    data = payload.dict()
    data["id"] = client_id
    return ClientOut(**data)

# ---- Letters ----
@app.post("/api/letters", response_model=LetterOut)
def create_letter(payload: LetterIn):
    conn = get_connection()
    cur = conn.cursor()

    # 1) Si no viene doll_id, buscamos automáticamente
    doll_id = payload.doll_id or pick_available_doll()
    if not doll_id:
        raise HTTPException(409, "No hay Dolls disponibles (<5 en proceso)")

    # 2) Validamos que la Doll seleccionada no tenga ya 5 en proceso
    cur.execute("""
        SELECT COUNT(*) 
        FROM letters 
        WHERE doll_id = :1 
          AND estado IN ('borrador')
    """, (doll_id,))
    count = cur.fetchone()[0]
    if count >= 5:
        raise HTTPException(409, f"La Doll {doll_id} ya tiene 5 cartas en proceso")

    # 3) Insertamos carta. 
    new_id_var = cur.var(oracledb.NUMBER)
    cur.execute("""
        INSERT INTO letters (cliente_id, doll_id, fecha, estado, contenido_resumen)
        VALUES (:1, :2, :3, 'borrador', :4)
        RETURNING id INTO :new_id
    """, (payload.cliente_id, doll_id, payload.fecha, payload.contenido_resumen,new_id_var))
    new_id = new_id_var.getvalue()[0]
    
    conn.commit()
    cur.close(); conn.close()

    return LetterOut(
        id=new_id, # Usamos el ID devuelto por la DB
        cliente_id=payload.cliente_id,
        doll_id=doll_id,
        fecha=payload.fecha,
        estado="borrador",
        contenido_resumen=payload.contenido_resumen
    )

@app.post("/api/letters/{letter_id}/transition", response_model=LetterOut)
def transition_letter(letter_id: str, to: str):
    conn = get_connection()
    cur = conn.cursor()

    # 1) Buscar la carta
    cur.execute("SELECT id, cliente_id, doll_id, fecha, estado, contenido_resumen FROM letters WHERE id = :1", (letter_id,))
    row = cur.fetchone()
    if not row:
        cur.close(); conn.close()
        raise HTTPException(404, "Carta no encontrada")

    current_estado = row[4]

    # 2) Validar transición
    next_state = {"borrador": "enviado", "enviado": "archivado"}
    if to != next_state.get(current_estado):
        cur.close(); conn.close()
        raise HTTPException(409, f"Transición inválida desde '{current_estado}' hacia '{to}'")

    # 3) Actualizar estado
    cur.execute("UPDATE letters SET estado = :1 WHERE id = :2", (to, letter_id))
    conn.commit()

    cur.close(); conn.close()

    return LetterOut(
        id=row[0],
        cliente_id=row[1],
        doll_id=row[2],
        fecha=row[3],
        estado=to,
        contenido_resumen=row[5]
    )

@app.get("/api/letters", response_model=list[LetterOut])
def list_letters():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, cliente_id, doll_id, fecha, estado, contenido_resumen
        FROM letters
    """)
    result = [
        LetterOut(
            id=row[0],
            cliente_id=row[1],
            doll_id=row[2],
            fecha=row[3],
            estado=row[4],
            contenido_resumen=row[5]
        )
        for row in cur
    ]
    cur.close(); conn.close()
    return result

@app.delete("/api/letters/{letter_id}", status_code=204)
def delete_letter(letter_id: str):
    conn = get_connection()
    cur = conn.cursor()

    # 1) Verificar existencia y estado
    cur.execute("SELECT estado FROM letters WHERE id = :1", (letter_id,))
    row = cur.fetchone()
    if not row:
        cur.close(); conn.close()
        raise HTTPException(404, "Carta no encontrada")

    estado = row[0]
    if estado != "borrador":
        cur.close(); conn.close()
        raise HTTPException(409, f"Solo se pueden eliminar cartas en estado 'borrador'. Estado actual: {estado}")

    # 2) Eliminar carta
    cur.execute("DELETE FROM letters WHERE id = :1", (letter_id,))
    conn.commit()
    cur.close(); conn.close()
    return  