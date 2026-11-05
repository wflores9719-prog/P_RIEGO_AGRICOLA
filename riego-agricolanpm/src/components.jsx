import { useEffect, useState } from "react";
import {
  DIAS, TEXTOS, claveDia, consumoCsv, estadoHumedad, fmt, proximoRiego, validarHorario, validarZona,
} from "./logic.js";

const ETQ = {
  OPTIMO: ["Humedad óptima", "etq"],
  INSUFICIENTE: ["Riego insuficiente", "etq aviso"],
  SOBRE_RIEGO: ["Sobre-riego", "etq info"],
};

/* ------------------------------- encabezado ------------------------------ */
export function Encabezado({ s }) {
  const c = s.clima;
  const hoy = s.consumo[claveDia(s.reloj)] || {};
  const litrosHoy = Object.values(hoy).reduce((t, r) => t + r.litros, 0);
  return (
    <header className="barra">
      <h1>Riego Agrícola</h1>
      <div className="chips">
        <span className="chip"><b>{DIAS[(new Date(s.reloj).getDay() + 6) % 7]}</b> {fmt(s.reloj)}</span>
        <span className="chip"><b>{c.temp.toFixed(1)} °C</b></span>
        <span className={"chip" + (c.lluvia >= 60 || c.lloviendo ? " aviso" : "")}>
          Lluvia <b>{Math.round(c.lluvia)} %</b>{c.lloviendo ? " · lloviendo" : ""}
        </span>
        <span className="chip">Clima {c.modo === "manual" ? "manual" : "automático"}</span>
        <span className="chip">Hoy <b>{Math.round(litrosHoy).toLocaleString("es")} L</b></span>
        {s.pausa && <span className="chip aviso">En pausa</span>}
      </div>
    </header>
  );
}

/* ------------------------- control de la simulación ---------------------- */
export function ControlSimulacion({ s, dispatch }) {
  const [hora, setHora] = useState("05:50");
  return (
    <section className="panel fila-controles">
      <button onClick={() => dispatch({ type: "pausa" })}>{s.pausa ? "Reanudar" : "Pausar"}</button>
      <label>
        <span className="lbl">Velocidad (min simulados por segundo)</span>
        <select value={s.minTick} onChange={(e) => dispatch({ type: "velocidad", valor: Number(e.target.value) })}>
          {[1, 5, 15, 30].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label>
        <span className="lbl">Saltar a la hora</span>
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
      </label>
      <button onClick={() => dispatch({ type: "saltar", hora })}>Ir</button>
      <button className="peligro" onClick={() => confirm("¿Reiniciar todo con los datos de demostración?") && dispatch({ type: "reiniciar" })}>
        Reiniciar demo
      </button>
    </section>
  );
}

/* ------------------------------ tarjetas de zona ------------------------- */
function Tarjeta({ s, z, dispatch }) {
  const c = z.c;
  const est = estadoHumedad(z.h, z.min, z.max);
  const hoy = (s.consumo[claveDia(s.reloj)] || {})[z.id];
  return (
    <article className={"zona" + (c.alarma ? " alarma" : "") + (z.activa ? "" : " inactiva")}>
      <div className="zona-cab"><h3>{z.nombre}</h3><span>{z.cultivo}</span></div>
      <div className="fila-humedad">
        <div className="humedad">{z.h.toFixed(1)}<small> %</small></div>
        <div className="etiquetas">
          {z.activa ? <span className={ETQ[est][1]}>{ETQ[est][0]}</span> : <span className="etq">Inactiva</span>}
          <span className={"etq" + (c.abierta ? " abierta" : "")}>Válvula {c.abierta ? "abierta" : "cerrada"}</span>
          {c.susp && <span className="etq aviso">Suspendido: {TEXTOS[c.susp]}</span>}
        </div>
      </div>
      <div>
        <div className="medidor">
          <div className={"nivel " + est} style={{ width: `${Math.max(0, Math.min(100, z.h))}%` }} />
          <div className="umbral" style={{ left: `${z.min}%` }} />
          <div className="umbral" style={{ left: `${z.max}%` }} />
        </div>
        <div className="leyenda-medidor"><span>mín {z.min} %</span><span>máx {z.max} %</span></div>
      </div>
      <dl className="datos">
        <dt>Estado</dt><dd>{TEXTOS[c.motivo] || c.motivo}</dd>
        <dt>Flujo</dt><dd>{c.flujo.toFixed(1)} l/min</dd>
        <dt>Consumo hoy</dt><dd>{Math.round(hoy ? hoy.litros : 0).toLocaleString("es")} L</dd>
        <dt>Próximo riego</dt><dd>{proximoRiego(s, z)}</dd>
      </dl>
      {c.alarma && (
        <div className="alerta">
          <b>Alarma · zona bloqueada</b>
          <span>{c.alarma.msg}</span>
          <button className="chico peligro" onClick={() => dispatch({ type: "resolverAlarma", id: z.id })}>
            Reconocer y reanudar
          </button>
        </div>
      )}
    </article>
  );
}

export function Zonas({ s, dispatch }) {
  return (
    <section>
      <h2>Zonas de cultivo</h2>
      <div className="rejilla-zonas">
        {s.zonas.length === 0 && <p className="nota">No hay zonas. Cree la primera en “Configurar zona”.</p>}
        {s.zonas.map((z) => <Tarjeta key={z.id} s={s} z={z} dispatch={dispatch} />)}
      </div>
    </section>
  );
}

/* ----------------------------- configurar zonas -------------------------- */
const VACIA = { nombre: "", cultivo: "", min: "", max: "", activa: true };

export function ConfigurarZonas({ s, dispatch, aviso }) {
  const [campos, setCampos] = useState(VACIA);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const set = (k, v) => setCampos((c) => ({ ...c, [k]: v }));
  const limpiar = () => { setCampos(VACIA); setEditId(null); setError(""); };

  const enviar = (ev) => {
    ev.preventDefault();
    const { e, valor } = validarZona(campos, s.zonas, editId);
    if (e.length) return setError(e.join(" "));
    dispatch({ type: "guardarZona", id: editId, valor });
    aviso(editId ? "Zona actualizada" : "Zona creada");
    limpiar();
  };
  const editar = (z) => {
    setEditId(z.id);
    setCampos({ nombre: z.nombre, cultivo: z.cultivo, min: z.min, max: z.max, activa: z.activa });
  };

  return (
    <section className="panel">
      <h2>Configurar zona</h2>
      <form onSubmit={enviar} autoComplete="off">
        <div className="fila">
          <label><span className="lbl">Nombre</span><input value={campos.nombre} maxLength={60} onChange={(e) => set("nombre", e.target.value)} /></label>
          <label><span className="lbl">Cultivo</span><input value={campos.cultivo} maxLength={60} onChange={(e) => set("cultivo", e.target.value)} /></label>
          <label><span className="lbl">Humedad mínima (%)</span><input type="number" value={campos.min} onChange={(e) => set("min", e.target.value)} /></label>
          <label><span className="lbl">Humedad máxima (%)</span><input type="number" value={campos.max} onChange={(e) => set("max", e.target.value)} /></label>
        </div>
        <label className="check"><input type="checkbox" checked={campos.activa} onChange={(e) => set("activa", e.target.checked)} /> Zona activa</label>
        <div className="acciones">
          <button className="primario" type="submit">{editId ? "Guardar cambios" : "Crear zona"}</button>
          {editId && <button type="button" onClick={limpiar}>Cancelar</button>}
        </div>
        <p className="error" role="alert">{error}</p>
      </form>
      <table className="tabla">
        <thead><tr><th>Zona</th><th>Umbrales</th><th /></tr></thead>
        <tbody>
          {s.zonas.map((z) => (
            <tr key={z.id}>
              <td>{z.nombre}<div className="nota">{z.cultivo}{z.activa ? "" : " · inactiva"}</div></td>
              <td>{z.min}–{z.max} %</td>
              <td className="acc">
                <button className="chico" onClick={() => editar(z)}>Editar</button>{" "}
                <button className="chico peligro" onClick={() => {
                  if (confirm("¿Eliminar la zona y sus horarios?")) { dispatch({ type: "borrarZona", id: z.id }); aviso("Zona eliminada"); }
                }}>Eliminar</button>
              </td>
            </tr>
          ))}
          {s.zonas.length === 0 && <tr><td colSpan={3} className="nota">Sin zonas</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

/* --------------------------------- horarios ------------------------------ */
export function Horarios({ s, dispatch, aviso }) {
  const [zonaId, setZonaId] = useState(null);
  const [dias, setDias] = useState([0, 1, 2, 3, 4]);
  const [ini, setIni] = useState("06:00");
  const [fin, setFin] = useState("06:30");
  const [error, setError] = useState("");
  const zonaSel = s.zonas.some((z) => z.id === zonaId) ? zonaId : s.zonas[0]?.id ?? null;
  const nombre = Object.fromEntries(s.zonas.map((z) => [z.id, z.nombre]));

  const alternarDia = (d) => setDias((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d].sort()));
  const enviar = (ev) => {
    ev.preventDefault();
    const valor = { zonaId: zonaSel, dias, ini, fin };
    const e = validarHorario(valor, s.zonas, s.horarios);
    if (e.length) return setError(e.join(" "));
    dispatch({ type: "agregarHorario", valor });
    setError("");
    aviso("Horario agregado");
  };

  return (
    <section className="panel">
      <h2>Horarios de riego</h2>
      <form onSubmit={enviar}>
        <label>
          <span className="lbl">Zona</span>
          <select value={zonaSel ?? ""} onChange={(e) => setZonaId(Number(e.target.value))}>
            {s.zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
          </select>
        </label>
        <div>
          <span className="lbl">Días</span>
          <div className="dias">
            {DIAS.map((d, i) => (
              <label key={d}><input type="checkbox" checked={dias.includes(i)} onChange={() => alternarDia(i)} />{d}</label>
            ))}
          </div>
        </div>
        <div className="fila">
          <label><span className="lbl">Inicio</span><input type="time" value={ini} onChange={(e) => setIni(e.target.value)} /></label>
          <label><span className="lbl">Fin</span><input type="time" value={fin} onChange={(e) => setFin(e.target.value)} /></label>
        </div>
        <div className="acciones"><button className="primario" type="submit">Agregar horario</button></div>
        <p className="error" role="alert">{error}</p>
      </form>
      <table className="tabla">
        <thead><tr><th>Zona</th><th>Días</th><th>Hora</th><th /></tr></thead>
        <tbody>
          {s.horarios.map((h) => (
            <tr key={h.id}>
              <td>{nombre[h.zonaId]}</td>
              <td>{h.dias.map((d) => DIAS[d]).join(" ")}</td>
              <td>{h.ini}–{h.fin}</td>
              <td className="acc"><button className="chico peligro" onClick={() => dispatch({ type: "borrarHorario", id: h.id })}>Quitar</button></td>
            </tr>
          ))}
          {s.horarios.length === 0 && <tr><td colSpan={4} className="nota">Sin horarios</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

/* ----------------------------------- clima ------------------------------- */
export function Clima({ s, dispatch, aviso }) {
  const [temp, setTemp] = useState(Math.round(s.clima.temp));
  const [lluvia, setLluvia] = useState(Math.round(s.clima.lluvia));
  const [lloviendo, setLloviendo] = useState(false);
  return (
    <section className="panel">
      <h2>Clima <small>(simulado)</small></h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: "fijarClima", temp, lluvia, lloviendo });
        aviso("Clima manual aplicado");
      }}>
        <label><span className="lbl">Temperatura: <b>{temp}</b> °C</span>
          <input type="range" min={-5} max={50} value={temp} onChange={(e) => setTemp(Number(e.target.value))} /></label>
        <label><span className="lbl">Probabilidad de lluvia: <b>{lluvia}</b> %</span>
          <input type="range" min={0} max={100} step={5} value={lluvia} onChange={(e) => setLluvia(Number(e.target.value))} /></label>
        <label className="check"><input type="checkbox" checked={lloviendo} onChange={(e) => setLloviendo(e.target.checked)} /> Está lloviendo ahora</label>
        <div className="acciones">
          <button className="primario" type="submit">Fijar clima manual</button>
          <button type="button" onClick={() => { dispatch({ type: "climaAuto" }); aviso("Clima automático"); }}>Automático</button>
        </div>
      </form>
      <p className="nota">Lluvia ≥ 60 %, helada (≤ 3 °C) o calor extremo (≥ 42 °C) suspenden el riego. Lluvia ≥ 30 % omite el riego programado. Con ≥ 32 °C se riega antes.</p>
    </section>
  );
}

/* ----------------------------- prueba de fallas -------------------------- */
export function Fallas({ s, dispatch, aviso }) {
  const [zonaId, setZonaId] = useState(null);
  const [tipo, setTipo] = useState("");
  const zonaSel = s.zonas.some((z) => z.id === zonaId) ? zonaId : s.zonas[0]?.id ?? null;
  return (
    <section className="panel">
      <h2>Prueba de fallas <small>(simulación)</small></h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (zonaSel === null) return aviso("Seleccione una zona");
        dispatch({ type: "falla", zonaId: zonaSel, tipo });
        aviso(tipo ? "Falla aplicada" : "Falla reparada");
      }}>
        <label><span className="lbl">Zona</span>
          <select value={zonaSel ?? ""} onChange={(e) => setZonaId(Number(e.target.value))}>
            {s.zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
          </select></label>
        <label><span className="lbl">Falla</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Ninguna (reparar)</option>
            <option value="fuga">Fuga (flujo con válvula cerrada)</option>
            <option value="atascada_abierta">Válvula atascada abierta</option>
            <option value="atascada_cerrada">Válvula atascada cerrada</option>
          </select></label>
        <div className="acciones"><button className="primario" type="submit">Aplicar</button></div>
      </form>
      <p className="nota">El sistema compara la orden de la válvula con el flujo medido. Al confirmar la anomalía levanta una alarma y bloquea la zona hasta que se reconozca.</p>
    </section>
  );
}

/* ---------------------------------- reporte ------------------------------ */
export function Reporte({ s }) {
  const max = Math.max(1, ...s.zonas.map((z) => z.tot.litros));
  const total = s.zonas.reduce((t, z) => t + z.tot.litros, 0);
  const descargar = () => {
    const url = URL.createObjectURL(new Blob([consumoCsv(s)], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "consumo_riego.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="panel">
      <div className="cabecera-panel"><h2>Consumo de agua</h2><button onClick={descargar}>Descargar CSV</button></div>
      <div className="barras">
        {s.zonas.map((z) => (
          <div className="barra-fila" key={z.id}>
            <span className="corto">{z.nombre}</span>
            <div className="pista"><div style={{ width: `${(z.tot.litros / max) * 100}%` }} /></div>
            <span className="num">{Math.round(z.tot.litros)} L</span>
          </div>
        ))}
      </div>
      <div className="scroll">
        <table className="tabla">
          <thead><tr><th>Zona</th><th className="num">Litros</th><th className="num">Min. de riego</th><th className="num">Ciclos</th><th className="num">Alarmas</th></tr></thead>
          <tbody>
            {s.zonas.map((z) => (
              <tr key={z.id}><td>{z.nombre}</td><td className="num">{Math.round(z.tot.litros)}</td><td className="num">{z.tot.minutos}</td><td className="num">{z.tot.ciclos}</td><td className="num">{z.tot.alarmas}</td></tr>
            ))}
            <tr><td><b>Total</b></td><td className="num"><b>{Math.round(total)}</b></td><td colSpan={3} /></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* --------------------------------- bitácora ------------------------------ */
export function Bitacora({ s }) {
  return (
    <section className="panel">
      <h2>Bitácora de eventos</h2>
      <div className="scroll bitacora">
        <table className="tabla">
          <thead><tr><th>Hora</th><th>Zona</th><th>Evento</th><th>Detalle</th></tr></thead>
          <tbody>
            {s.eventos.slice(0, 60).map((e) => (
              <tr key={e.id} className={"nivel-" + e.nivel}>
                <td className="nowrap">{fmt(e.ts)}</td><td>{e.zona}</td><td>{e.tipo.replaceAll("_", " ")}</td><td>{e.detalle}</td>
              </tr>
            ))}
            {s.eventos.length === 0 && <tr><td colSpan={4} className="nota">Sin eventos</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ----------------------------------- aviso ------------------------------- */
export function Aviso({ texto }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!texto.msg) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, [texto]);
  return <div className={"toast" + (visible ? " visible" : "")} role="status">{texto.msg}</div>;
}
