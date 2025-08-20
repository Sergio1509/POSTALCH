
import React, { useEffect, useState } from "react";
import api from "../api";

function LetterList() {
  const [letters, setLetters] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await api.get("/letters");
      setLetters(res.data);
    } catch (err) {
      console.error("Error al cargar cartas:", err);
      setMessage("❌ No se pudieron cargar las cartas");
    }
  };

  const transitionLetter = async (letterId, currentState) => {
    const nextState = currentState === "borrador"
      ? "enviado"
      : currentState === "enviado"
      ? "archivado"
      : null;

    if (!nextState) return;

    try {
      await api.post(`/letters/${letterId}/transition?to=${nextState}`);
      setMessage(`✅ Carta ${letterId} actualizada a estado '${nextState}'`);
      fetchLetters();
    } catch (error) {
      console.error("Error en transición:", error.response?.data);
      setMessage("❌ Error al cambiar el estado de la carta");
    }
  };

  const deleteLetter = async (letterId) => {
    try {
      await api.delete(`/letters/${letterId}`);
      setMessage(`✅ Carta ${letterId} eliminada correctamente`);
      fetchLetters();
    } catch (error) {
      console.error("Error al eliminar carta:", error.response?.data);
      setMessage("❌ No se pudo eliminar la carta");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Listado de Cartas</h2>
      {message && <p className="text-sm text-red-600">{message}</p>}
      {letters.map((letter) => (
        <div key={letter.id} className="border p-4 rounded shadow">
          <p><strong>ID:</strong> {letter.id}</p>
          <p><strong>Cliente:</strong> {letter.cliente_id}</p>
          <p><strong>Doll:</strong> {letter.doll_id}</p>
          <p><strong>Fecha:</strong> {letter.fecha}</p>
          <p><strong>Estado:</strong> {letter.estado}</p>
          <p><strong>Contenido:</strong> {letter.contenido_resumen}</p>
          {(letter.estado === "borrador" || letter.estado === "enviado") && (
            <button
              onClick={() => transitionLetter(letter.id, letter.estado)}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded mr-2"
            >
              Cambiar a {letter.estado === "borrador" ? "enviado" : "archivado"}
            </button>
          )}
          {letter.estado === "borrador" && (
            <button
              onClick={() => deleteLetter(letter.id)}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              Eliminar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default LetterList;
