import React, { useState } from "react";
import api from "../api";

function DollForm() {
  const [form, setForm] = useState({ id: "", nombre: "" , edad:"",activo:"", carta:""});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/dolls", form);
      setMessage("✅ Doll registrada correctamente");
      setForm({ id: "", nombre: "",edad:"",activo:"" ,carta: ""});
    } catch (error) {
      setMessage("❌ Error al registrar doll");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        name="id"
        placeholder="Id"
        value={form.id}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="number"
        name="edad"
        placeholder="Edad"
        value={form.edad}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="bool"
        name="activo"
        placeholder="Activo"
        value={form.activo}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="number"
        name="carta"
        placeholder="Cartas escritas"
        value={form.carta}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Guardar
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}

export default DollForm;
