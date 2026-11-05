export const CFG = {
  caudal: 12,            
  fuga: 4,               
  evap: 0.08,           
  gananciaRiego: 0.8,   
  gananciaLluvia: 0.3,   
  lluviaSusp: 60,        
  lluviaOmitir: 30,      
  tCalor: 32,          
  ajusteCalor: 5,        
  tHelada: 3,          
  tExtrema: 42,         
  flujoFuga: 0.5,       
  flujoMinRatio: 0.2,   
  confirmaciones: 2,     
  difMinUmbral: 5,
  duracionMinHorario: 5,
};

export const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const TEXTOS = {
  humedad_baja: "humedad bajo el umbral mínimo",
  programado: "riego programado",
  humedad_objetivo: "humedad objetivo alcanzada",
  fin_horario: "fin del horario programado",
  continuar: "regando hasta alcanzar la humedad objetivo",
  sin_necesidad: "humedad suficiente",
  espera: "en espera",
  programado_omitido_lluvia: "riego programado omitido por pronóstico de lluvia",
  bloqueada_por_alarma: "zona bloqueada por alarma",
  zona_desactivada: "zona desactivada",
  lluvia: "lluvia o pronóstico de lluvia",
  helada: "riesgo de helada",
  calor_extremo: "calor extremo",
};

/* ------------------------------- utilidades ------------------------------ */
const pad = (n) => String(n).padStart(2, "0");
export const fmt = (ms) => {
  const d = new Date(ms);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const claveDia = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const diaSemana = (ms) => (new Date(ms).getDay() + 6) % 7; // 0 = lunes
export const aMin = (hhmm) => {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm || "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ------------------------------ validaciones ----------------------------- */
export function validarZona(d, zonas, idActual) {
  const e = [];
  const nombre = d.nombre.trim();
  if (!nombre) e.push("El nombre es obligatorio.");
  else if (zonas.some((z) => z.id !== idActual && z.nombre.toLowerCase() === nombre.toLowerCase()))
    e.push("Ya existe una zona con ese nombre.");
  const min = d.min === "" ? NaN : Number(d.min);
  const max = d.max === "" ? NaN : Number(d.max);
  if (Number.isNaN(min) || min < 0 || min > 100) e.push("La humedad mínima debe estar entre 0 y 100.");
  if (Number.isNaN(max) || max < 0 || max > 100) e.push("La humedad máxima debe estar entre 0 y 100.");
  if (!e.length && max - min < CFG.difMinUmbral)
    e.push(`El máximo debe superar al mínimo en al menos ${CFG.difMinUmbral} puntos.`);
  return { e, valor: { nombre, cultivo: d.cultivo.trim(), min, max, activa: d.activa } };
}

export function validarHorario(d, zonas, horarios) {
  const e = [];
  if (!zonas.some((z) => z.id === d.zonaId)) e.push("Seleccione una zona.");
  if (!d.dias.length) e.push("Seleccione al menos un día.");
  const ini = aMin(d.ini), fin = aMin(d.fin);
  if (ini === null || fin === null) e.push("Indique hora de inicio y de fin (HH:MM).");
  else if (fin <= ini) e.push("La hora de fin debe ser posterior a la de inicio.");
  else if (fin - ini < CFG.duracionMinHorario) e.push(`La duración mínima es de ${CFG.duracionMinHorario} minutos.`);
  if (!e.length) {
    const choque = horarios.find(
      (h) => h.zonaId === d.zonaId && h.dias.some((x) => d.dias.includes(x)) && ini < aMin(h.fin) && aMin(h.ini) < fin
    );
    if (choque) e.push(`Se superpone con el horario ${choque.ini}–${choque.fin} de la misma zona.`);
  }
  return e;
}

/* ------------------------------ reglas de riego -------------------------- */
export const estadoHumedad = (h, min, max) => (h < min ? "INSUFICIENTE" : h > max ? "SOBRE_RIEGO" : "OPTIMO");

export function motivoSuspension(clima) {
  if (clima.lloviendo || clima.lluvia >= CFG.lluviaSusp) return "lluvia";
  if (clima.temp <= CFG.tHelada) return "helada";
  if (clima.temp >= CFG.tExtrema) return "calor_extremo";
  return null;
}

export function enHorario(s, z) {
  const d = new Date(s.reloj);
  const m = d.getHours() * 60 + d.getMinutes();
  const dia = diaSemana(s.reloj);
  return s.horarios.some((h) => h.zonaId === z.id && h.dias.includes(dia) && aMin(h.ini) <= m && m < aMin(h.fin));
}

export function proximoRiego(s, z) {
  let mejor = null;
  for (const h of s.horarios.filter((x) => x.zonaId === z.id)) {
    for (let k = 0; k < 8; k++) {
      const d = new Date(s.reloj);
      d.setDate(d.getDate() + k);
      const m = aMin(h.ini);
      d.setHours(Math.floor(m / 60), m % 60, 0, 0);
      if (h.dias.includes(diaSemana(+d)) && +d > s.reloj) {
        if (mejor === null || +d < mejor) mejor = +d;
        break;
      }
    }
  }
  if (mejor === null) return "—";
  const d = new Date(mejor);
  return `${DIAS[diaSemana(mejor)]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function decidir(s, z, abierta, motivoAp) {
  const c = s.clima;
  const susp = motivoSuspension(c);
  if (susp) return [false, susp];
  const umin = c.temp >= CFG.tCalor ? Math.min(z.min + CFG.ajusteCalor, z.max - 1) : z.min;
  // Anticipación: si el próximo intervalo llevaría el suelo al máximo, se cierra ya (evita el sobre-riego).
  if (z.h >= z.max || z.h + CFG.gananciaRiego * s.minTick >= z.max)
    return [false, abierta ? "humedad_objetivo" : "sin_necesidad"];
  const prog = enHorario(s, z);
  if (abierta) return motivoAp === "programado" && !prog && z.h >= umin ? [false, "fin_horario"] : [true, "continuar"];
  if (z.h < umin) return [true, "humedad_baja"];
  if (prog) return c.lluvia >= CFG.lluviaOmitir ? [false, "programado_omitido_lluvia"] : [true, "programado"];
  return [false, "espera"];
}

/* -------------------------------- simulación ----------------------------- */
export function evento(s, zona, tipo, detalle, nivel = "info") {
  s.sig.evento = (s.sig.evento || 0) + 1;
  s.eventos.unshift({ id: s.sig.evento, ts: s.reloj, zona: zona ? zona.nombre : "—", tipo, detalle, nivel });
  if (s.eventos.length > 200) s.eventos.pop();
}

export function nuevaZona(s, d) {
  const z = {
    id: s.sig.zona++, ...d,
    h: clamp((d.min + d.max) / 2 + rnd(-6, 6), 0, 100),   // humedad actual
    fisica: false,                                        // estado físico de la válvula
    falla: null,                                          // fuga | atascada_abierta | atascada_cerrada
    tot: { litros: 0, minutos: 0, ciclos: 0, alarmas: 0 },
    c: { abierta: false, motivo: "espera", motivoAp: null, litros: 0, min: 0, est: null, susp: null, fallas: 0, alarma: null, flujo: 0 },
  };
  s.zonas.push(z);
  return z;
}

function ordenar(z, abrir) {
  z.fisica = z.falla === "atascada_abierta" ? true : z.falla === "atascada_cerrada" ? false : abrir;
}

function avanzar(s, z) {
  const m = s.minTick, c = s.clima;
  const flujo = z.fisica ? CFG.caudal : z.falla === "fuga" ? CFG.fuga : 0;
  const evap = CFG.evap * (1 + Math.max(0, c.temp - 20) / 20) * m;
  const riego = CFG.gananciaRiego * (flujo / CFG.caudal) * m;
  const lluvia = c.lloviendo ? CFG.gananciaLluvia * m : 0;
  z.h = clamp(z.h - evap + riego + lluvia, 0, 100);
  return flujo;
}

function climaAuto(s) {
  const c = s.clima;
  if (c.modo === "manual") return;
  const d = new Date(s.reloj);
  const hora = d.getHours() + d.getMinutes() / 60;
  c.temp = Math.round((24 + 8 * Math.sin((2 * Math.PI * (hora - 9)) / 24) + rnd(-0.5, 0.5)) * 10) / 10;
  c.lluvia = Math.round(clamp(c.lluvia + (12 - c.lluvia) * 0.03 + rnd(-5, 5), 0, 100) * 10) / 10;
  c.lloviendo = c.lluvia >= 85 && Math.random() < 0.5;
}

function cerrarCiclo(s, z, motivo) {
  evento(s, z, "RIEGO_FIN", `Cierre de válvula: ${TEXTOS[motivo] || motivo}; ${z.c.min} min, ${z.c.litros.toFixed(0)} L`);
  z.c.abierta = false;
  z.c.motivoAp = null;
}
function procesarZona(s, z) {
  const c = z.c, m = s.minTick, dia = claveDia(s.reloj);

  if (!z.activa) {
    if (c.abierta) cerrarCiclo(s, z, "zona_desactivada");
    ordenar(z, false);
    c.flujo = avanzar(s, z);
    c.motivo = "zona_desactivada";
    c.susp = null;
    return;
  }

  // 1) Sobre-riego / riego insuficiente
  const est = estadoHumedad(z.h, z.min, z.max);
  if (est !== c.est) {
    if (est === "INSUFICIENTE") evento(s, z, "RIEGO_INSUFICIENTE", `Humedad ${z.h.toFixed(1)}% bajo el mínimo (${z.min}%)`, "aviso");
    else if (est === "SOBRE_RIEGO") evento(s, z, "SOBRE_RIEGO", `Humedad ${z.h.toFixed(1)}% sobre el máximo (${z.max}%)`, "aviso");
    else if (c.est) evento(s, z, "HUMEDAD_NORMALIZADA", `Humedad ${z.h.toFixed(1)}% dentro del rango`);
    c.est = est;
  }

  // 2) Suspensión por clima adverso
  const susp = motivoSuspension(s.clima);
  if (susp !== c.susp) {
    if (susp) evento(s, z, "RIEGO_SUSPENDIDO", `Suspensión automática por ${TEXTOS[susp]}`, "aviso");
    else if (c.susp) evento(s, z, "RIEGO_REANUDADO", "Condiciones climáticas normalizadas");
    c.susp = susp;
  }

  // 3) Decisión
  const [abrir, motivo] = c.alarma ? [false, "bloqueada_por_alarma"] : decidir(s, z, c.abierta, c.motivoAp);

  // 4) Actuación y registro del ciclo
  if (abrir && !c.abierta) {
    c.abierta = true; c.motivoAp = motivo; c.litros = 0; c.min = 0; z.tot.ciclos++;
    evento(s, z, "RIEGO_INICIO", `Apertura de válvula: ${TEXTOS[motivo]} (humedad ${z.h.toFixed(1)}%)`);
  } else if (!abrir && c.abierta) {
    cerrarCiclo(s, z, motivo);
  }
  ordenar(z, abrir);
  const flujo = avanzar(s, z);
  const litros = flujo * m;
  if (abrir) { c.litros += litros; c.min += m; }
  if (litros > 0) {
    s.consumo[dia] = s.consumo[dia] || {};
    const r = (s.consumo[dia][z.id] = s.consumo[dia][z.id] || { litros: 0, minutos: 0 });
    r.litros += litros; r.minutos += m;
    z.tot.litros += litros; z.tot.minutos += m;
  }

  // 5) Monitoreo de flujo: fugas y válvulas atascadas
  let falla = false;
  if (!abrir && flujo > CFG.flujoFuga) falla = true;
  else if (abrir && flujo < CFG.flujoMinRatio * CFG.caudal) falla = true;
  c.fallas = falla ? c.fallas + 1 : 0;
  if (falla && c.fallas >= CFG.confirmaciones && !c.alarma) {
    const msg = `Flujo de ${flujo.toFixed(1)} l/min con la válvula ${
      abrir ? "abierta: posible válvula atascada cerrada u obstrucción" : "cerrada: posible fuga o válvula atascada abierta"}`;
    c.alarma = { msg };
    z.tot.alarmas++;
    evento(s, z, "ALARMA_FALLA", msg, "alarma");
  }
  c.abierta = abrir; c.motivo = motivo; c.flujo = flujo;
}

/** Avanza el tiempo simulado un intervalo y procesa todas las zonas. */
export function tick(prev) {
  if (prev.pausa) return prev;
  const s = structuredClone(prev);
  s.reloj += s.minTick * 60000;
  climaAuto(s);
  s.zonas.forEach((z) => procesarZona(s, z));
  return s;
}

/* ------------------------------- estado inicial -------------------------- */
export function estadoInicial() {
  const reloj = new Date();
  reloj.setSeconds(0, 0);
  const s = {
    reloj: +reloj, zonas: [], horarios: [], eventos: [], consumo: {},
    sig: { zona: 1, horario: 1 }, pausa: false, minTick: 5,
    clima: { modo: "auto", temp: 24, lluvia: 10, lloviendo: false },
  };
  const demo = [
    ["Zona Norte", "Maíz", 40, 70, [0, 1, 2, 3, 4], "06:00", "06:30"],
    ["Zona Sur", "Tomate", 55, 80, [0, 2, 4], "05:30", "06:15"],
    ["Zona Este", "Frijol", 35, 65, [1, 3, 5], "18:00", "18:40"],
  ];
  for (const [nombre, cultivo, min, max, dias, ini, fin] of demo) {
    const z = nuevaZona(s, { nombre, cultivo, min, max, activa: true });
    s.horarios.push({ id: s.sig.horario++, zonaId: z.id, dias, ini, fin });
  }
  evento(s, null, "SISTEMA", "Datos de demostración creados");
  return s;
}

/* ---------------------------------- reducer ------------------------------ */
export function reducer(state, a) {
  if (a.type === "tick") return tick(state);
  if (a.type === "reiniciar") return estadoInicial();
  const s = structuredClone(state);
  const zona = (id) => s.zonas.find((z) => z.id === id);

  switch (a.type) {
    case "guardarZona":
      if (a.id) { Object.assign(zona(a.id), a.valor); evento(s, null, "CONFIG", `Zona '${a.valor.nombre}' actualizada`); }
      else { const z = nuevaZona(s, a.valor); evento(s, z, "CONFIG", `Zona '${z.nombre}' creada`); }
      break;
    case "borrarZona": {
      const z = zona(a.id);
      s.zonas = s.zonas.filter((x) => x.id !== a.id);
      s.horarios = s.horarios.filter((h) => h.zonaId !== a.id);
      evento(s, null, "CONFIG", `Zona '${z.nombre}' eliminada`);
      break;
    }
    case "agregarHorario":
      s.horarios.push({ id: s.sig.horario++, ...a.valor });
      evento(s, zona(a.valor.zonaId), "CONFIG", `Horario ${a.valor.ini}–${a.valor.fin} creado`);
      break;
    case "borrarHorario":
      s.horarios = s.horarios.filter((h) => h.id !== a.id);
      break;
    case "fijarClima":
      s.clima = { modo: "manual", temp: a.temp, lluvia: a.lluvia, lloviendo: a.lloviendo };
      evento(s, null, "CLIMA", `Clima fijado manualmente: ${a.temp} °C, lluvia ${a.lluvia}%`);
      break;
    case "climaAuto":
      s.clima.modo = "auto";
      evento(s, null, "CLIMA", "Clima en modo automático");
      break;
    case "falla": {
      const z = zona(a.zonaId);
      if (!z) break;
      z.falla = a.tipo || null;
      evento(s, z, "SIMULACION", z.falla ? `Falla simulada: ${z.falla}` : "Falla simulada reparada");
      break;
    }
    case "resolverAlarma": {
      const z = zona(a.id);
      if (z && z.c.alarma) {
        z.c.alarma = null; z.c.fallas = 0;
        evento(s, z, "ALARMA_RESUELTA", "Alarma reconocida; la zona vuelve a operar");
      }
      break;
    }
    case "pausa": s.pausa = !s.pausa; break;
    case "velocidad": s.minTick = a.valor; break;
    case "saltar": {
      const m = aMin(a.hora);
      if (m === null) break;
      const d = new Date(s.reloj);
      d.setHours(Math.floor(m / 60), m % 60, 0, 0);
      if (+d <= s.reloj) d.setDate(d.getDate() + 1);
      s.reloj = +d;
      evento(s, null, "SIMULACION", `Reloj adelantado a ${fmt(+d)}`);
      break;
    }
    default: return state;
  }
  return s;
}

/* ----------------------------------- CSV --------------------------------- */
export function consumoCsv(s) {
  const nombre = Object.fromEntries(s.zonas.map((z) => [z.id, z.nombre]));
  const filas = ["fecha,zona,litros,minutos_con_flujo"];
  for (const [dia, zs] of Object.entries(s.consumo).sort())
    for (const [id, r] of Object.entries(zs))
      if (nombre[id]) filas.push(`${dia},"${nombre[id].replaceAll('"', '""')}",${r.litros.toFixed(1)},${r.minutos}`);
  return filas.join("\n");
}
