
import React, { useEffect, useState } from "react";
import api from "../api";

function ClientList() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchName, searchCity, clients]);

  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
      setClients(res.data);
      setFilteredClients(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setMessage("❌ No se pudieron cargar los clientes");
    }
  };

  const filterClients = () => {
    const filtered = clients.filter(client => {
      const matchName = client.nombre.toLowerCase().includes(searchName.toLowerCase());
      const matchCity = client.ciudad.toLowerCase().includes(searchCity.toLowerCase());
      return matchName && matchCity;
    });
    setFilteredClients(filtered);
  };

  const handleChange = (id, field, value) => {
    setFilteredClients(prev =>
      prev.map(client =>
        client.id === id ? { ...client, [field]: value } : client
      )
    );
  };

  const updateClient = async (client) => {
    try {
      await api.put(`/clients/${client.id}`, client);
      setMessage(`✅ Cliente ${client.id} actualizado correctamente`);
      fetchClients();
    } catch (error) {
      console.error("Error al actualizar cliente:", error.response?.data);
      setMessage("❌ No se pudo actualizar el cliente");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Listado de Clientes</h2>
      {message && <p className="text-sm text-red-600">{message}</p>}

      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
        <input
          type="text"
          placeholder="Buscar por ciudad"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
      </div>

      {filteredClients.map((client) => (
        <div key={client.id} className="border p-4 rounded shadow space-y-2">
          <p><strong>ID:</strong> {client.id}</p>
          <input
            type="text"
            value={client.nombre}
            onChange={(e) => handleChange(client.id, "nombre", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Nombre"
          />
          <input
            type="text"
            value={client.ciudad}
            onChange={(e) => handleChange(client.id, "ciudad", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Ciudad"
          />
          <input
            type="text"
            value={client.motivo}
            onChange={(e) => handleChange(client.id, "motivo", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Motivo"
          />
          <input
            type="text"
            value={client.contacto}
            onChange={(e) => handleChange(client.id, "contacto", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Contacto"
          />
          <button
            onClick={() => updateClient(client)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Guardar Cambios
          </button>
        </div>
      ))}
    </div>
  );
}

export default ClientList;
