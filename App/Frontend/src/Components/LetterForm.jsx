
import React, { useState, useEffect } from "react";
import api from "../api"; // instancia de Axios con baseURL

function LetterForm() {
  const [form, setForm] = useState({
    cliente_id: "",
    doll_id: "",
    fecha: "",
    estado: "Borrador",
    contenido_resumen: "",
  });
  const [clients, setClients] = useState([]);
  const [dolls, setDolls] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cRes, dRes] = await Promise.all([
          api.get("/clients"),
          api.get("/dolls"),
        ]);
        if (mounted) {
          setClients(cRes.data || []);
          setDolls(dRes.data || []);
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ No se pudieron cargar clientes o dolls");
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.cliente_id ||
      !form.fecha ||
      !form.contenido_resumen.trim()
    ) {
      setMessage("❌ Todos los campos obligatorios deben estar completos");
      return;
    }

    const fechaFormateada = new Date(form.fecha).toISOString().split("T")[0];

    const payload = {
      cliente_id: form.cliente_id,
      doll_id: form.doll_id || null,
      fecha: fechaFormateada,
      estado: form.estado || "Borrador",
      contenido_resumen: form.contenido_resumen.trim(),
    };

    console.log("Payload enviado:", payload);

    try {
      await api.post("/letters", payload);
      setMessage("✅ Carta creada correctamente (estado: Borrador)");
      setForm({
        cliente_id: "",
        doll_id: "",
        fecha: "",
        estado: "Borrador",
        contenido_resumen: "",
      });
    } catch (error) {
      console.error("Error completo:", error.response?.data);
      if (error.response?.status === 422) {
        setMessage("❌ Error de validación: revisa los campos del formulario");
      } else {
        setMessage("❌ Error al crear carta");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        name="cliente_id"
        value={form.cliente_id}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
        disabled={loading}
      >
        <option value="">
          {loading ? "Cargando clientes..." : "Selecciona un cliente"}
        </option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <select
        name="doll_id"
        value={form.doll_id}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        disabled={loading}
      >
        <option value="">
          {loading ? "Cargando dolls..." : "Selecciona un doll (opcional)"}
        </option>
        {dolls.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>

      <input
        type="date"
        name="fecha"
        placeholder="Fecha"
        value={form.fecha}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />

      <input
        type="text"
        name="estado"
        placeholder="Estado"
        value={form.estado}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />

      <textarea
        name="contenido_resumen"
        placeholder="Contenido de la carta"
        value={form.contenido_resumen}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        required
      />

      <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">
        Crear Carta
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}

export default LetterForm;
