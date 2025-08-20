
import React, { useEffect, useState } from "react";
import api from "../api";

function DollList() {
  const [dolls, setDolls] = useState([]);
  const [letters, setLetters] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dollsRes, lettersRes] = await Promise.all([
        api.get("/dolls"),
        api.get("/letters")
      ]);
      setDolls(dollsRes.data);
      setLetters(lettersRes.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setMessage("❌ No se pudieron cargar los datos");
    }
  };

  const getStats = (dollId) => {
    const cartas = letters.filter(l => l.doll_id === dollId);
    const clientesUnicos = new Set(cartas.map(l => l.cliente_id));
    return {
      cartas: cartas.length,
      clientes: clientesUnicos.size
    };
  };

  const handleChange = (id, field, value) => {
    setDolls(prev =>
      prev.map(doll =>
        doll.id === id ? { ...doll, [field]: value } : doll
      )
    );
  };

  const updateDoll = async (doll) => {
    try {
      await api.put(`/dolls/${doll.id}`, doll);
      setMessage(`✅ Doll ${doll.id} actualizado correctamente`);
      fetchData();
    } catch (error) {
      console.error("Error al actualizar doll:", error.response?.data);
      setMessage("❌ No se pudo actualizar el doll");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Listado de Dolls</h2>
      {message && <p className="text-sm text-red-600">{message}</p>}
      {dolls.map((doll) => {
        const stats = getStats(doll.id);
        return (
          <div key={doll.id} className="border p-4 rounded shadow space-y-2">
            <p><strong>ID:</strong> {doll.id}</p>
            <input
              type="text"
              value={doll.nombre}
              onChange={(e) => handleChange(doll.id, "nombre", e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Nombre"
            />
            <input
              type="number"
              value={doll.edad}
              onChange={(e) => handleChange(doll.id, "edad", e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Edad"
            />
            <select
              value={doll.activo ? "true" : "false"}
              onChange={(e) => handleChange(doll.id, "activo", e.target.value === "true")}
              className="border p-2 w-full rounded"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
            <input
              type="number"
              value={doll.carta}
              onChange={(e) => handleChange(doll.id, "carta", e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Carta"
            />
            <p><strong>Cartas escritas:</strong> {stats.cartas}</p>
            <p><strong>Clientes atendidos:</strong> {stats.clientes}</p>
            <button
              onClick={() => updateDoll(doll)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Guardar Cambios
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default DollList;
