import React from "react";
import Login from "./Login"; // Importamos el formulario de login
import "./App.css"; // Importamos los estilos

function App() {
  return (
    <div className="app-container">
      <h1 className="title">Gestión de Encomiendas</h1>
      <Login />
    </div>
  );
}

export default App;
