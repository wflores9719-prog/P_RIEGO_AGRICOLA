import { useCallback, useEffect, useReducer, useState } from "react";
import { estadoInicial, reducer } from "./logic.js";
import {
  Aviso, Bitacora, Clima, ConfigurarZonas, ControlSimulacion, Encabezado, Fallas, Horarios, Reporte, Zonas,
} from "./components.jsx";

const CLAVE = "riego-agricola-v1";

// Recupera el estado guardado en el navegador (si existe); si no, crea los datos de demostración.
function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado && Array.isArray(guardado.zonas)) return guardado;
  } catch { /* sin almacenamiento disponible */ }
  return estadoInicial();
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, null, cargar);
  const [toast, setToast] = useState({ msg: "" });
  const aviso = useCallback((msg) => setToast({ msg }), []);

  // Un "tick" por segundo: avanza el reloj simulado y ejecuta el ciclo de control.
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, []);

  // Guarda el estado para que sobreviva a recargas de la página
  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(s)); } catch { /* ignorar */ }
  }, [s]);

  return (
    <>
      <Encabezado s={s} />
      <main>
        <ControlSimulacion s={s} dispatch={dispatch} />
        <Zonas s={s} dispatch={dispatch} />
        <div className="columnas">
          <ConfigurarZonas s={s} dispatch={dispatch} aviso={aviso} />
          <Horarios s={s} dispatch={dispatch} aviso={aviso} />
          <Clima s={s} dispatch={dispatch} aviso={aviso} />
          <Fallas s={s} dispatch={dispatch} aviso={aviso} />
        </div>
        <Reporte s={s} />
        <Bitacora s={s} />
      </main>
      <Aviso texto={toast} />
    </>
  );
}
