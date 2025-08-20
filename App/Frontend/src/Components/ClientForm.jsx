import React, { useState } from "react";
import api from "../api";

function ClientForm() {
  const [form, setForm] = useState({ id: "",nombre: "", ciudad: "",motivo: "", contacto: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/clients", form);
      setMessage("✅ Cliente registrado correctamente");
      setForm({ id:"",nombre: "", ciudad: "", motivo:"",contacto:"" });
    } catch (error) {
      setMessage("❌ Error al registrar cliente");
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
        type="text"
        name="ciudad"
        placeholder="Ciudad"
        value={form.ciudad}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="text"
        name="motivo"
        placeholder="Motivo"
        value={form.motivo}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="text"
        name="contacto"
        placeholder="Contacto"
        value={form.contacto}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Guardar
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}

export default ClientForm;
