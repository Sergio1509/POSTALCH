import { useState } from "react";
import ClientForm from "./components/ClientForm";
import DollForm from "./components/DollForm";
import LetterForm from "./components/LetterForm";
import LetterList from "./components/LetterList";
import DollList from "./components/DollList";
import ClientList from "./components/ClientList";

export default function App() {
  const [view, setView] = useState(null); // controla qué mostrar

  return (
    <div style={{ padding: "20px" }}>
      <h1>📖 POSTAL CH</h1>

      {/* Botones del menú */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setView("clientform")}>👤 Crear Clientes</button>
        <button onClick={() => setView("clientlist")}>👤 Listado de Clientes</button>
        <button onClick={() => setView("dollform")}>🧸 Crear Dolls</button>
        <button onClick={() => setView("dolllist")}>🧸 Listado de Dolls</button>
        <button onClick={() => setView("letterform")}>✉️ Crear Cartas</button>
        <button onClick={() => setView("letterlist")}>✉️ Listado de Cartas</button>
      </div>

      {/* Mostrar el formulario seleccionado */}
      {view === "clientform" && <ClientForm />}
      {view === "clientlist" && <ClientList />}
      {view === "dollform" && <DollForm />}
      {view === "dolllist" && <DollList />}
      {view === "letterform" && <LetterForm />}
      {view === "letterlist" && <LetterList />}
      
    </div>
  );
}

