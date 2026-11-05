import { useState } from 'react';

export default function App() {
  // Estados básicos para mantener la estructura funcionando
  const [activeTab, setActiveTab] = useState('Norte');

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 text-sm">
        <div className="font-bold text-lg">Riego Agrícola</div>
        <div className="flex gap-4 text-gray-600">
          <span>Mié 04/11 20:58</span>
          <span>24.2 °C</span>
          <span>Lluvia 4 %</span>
          <span className="bg-gray-100 px-2 rounded border">Clima automático</span>
          <span>Hoy <strong>0 L</strong></span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* CONTROLES DE SIMULACIÓN */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50">Pausar</button>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Velocidad (min simulados por segundo)</label>
              <select className="border border-gray-300 rounded p-1.5 w-24 bg-white">
                <option>5</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Saltar a la hora</label>
              <div className="flex items-center gap-1">
                <input type="time" defaultValue="05:50" className="border border-gray-300 rounded p-1.5 bg-white" />
                <button className="px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50">Ir</button>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 max-w-xs ml-auto">
            El tiempo es simulado. Salte a una hora cercana a un horario de riego para verlo en acción.
          </p>
        </section>

        {/* ZONAS DE CULTIVO */}
        <section>
          <h2 className="text-lg font-bold mb-4">Zonas de cultivo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta Zona Norte */}
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Zona Norte</h3>
                <span className="text-gray-400 text-sm">Maíz</span>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold">51.0<span className="text-lg">%</span></span>
                <span className="text-xs text-gray-500 mb-1">Humedad óptima</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-auto">Válvula cerrada</span>
              </div>
              {/* Barra de progreso */}
              <div className="relative h-2 bg-gray-200 rounded-full mb-6">
                <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: '51%', left: '0%' }}></div>
                <div className="absolute top-3 left-[40%] text-xs text-gray-500">mín 40 %</div>
                <div className="absolute top-3 right-[30%] text-xs text-gray-500">máx 70 %</div>
                <div className="absolute h-4 w-0.5 bg-gray-400 top-[-4px] left-[40%]"></div>
                <div className="absolute h-4 w-0.5 bg-gray-400 top-[-4px] right-[30%]"></div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm mt-8">
                <span className="text-gray-500">Estado</span> <span className="text-right">en espera</span>
                <span className="text-gray-500">Flujo</span> <span className="text-right">0.0 l/min</span>
                <span className="text-gray-500">Consumo hoy</span> <span className="text-right">0 L</span>
                <span className="text-gray-500">Próximo riego</span> <span className="text-right">Jue 06:00</span>
              </div>
            </div>

            {/* Tarjeta Zona Sur */}
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Zona Sur</h3>
                <span className="text-gray-400 text-sm">Tomate</span>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold">64.4<span className="text-lg">%</span></span>
                <span className="text-xs text-gray-500 mb-1">Humedad óptima</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-auto">Válvula cerrada</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full mb-6">
                <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: '64.4%', left: '0%' }}></div>
                <div className="absolute top-3 left-[55%] text-xs text-gray-500">mín 55 %</div>
                <div className="absolute top-3 right-[20%] text-xs text-gray-500">máx 80 %</div>
                <div className="absolute h-4 w-0.5 bg-gray-400 top-[-4px] left-[55%]"></div>
                <div className="absolute h-4 w-0.5 bg-gray-400 top-[-4px] right-[20%]"></div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm mt-8">
                <span className="text-gray-500">Estado</span> <span className="text-right">en espera</span>
                <span className="text-gray-500">Flujo</span> <span className="text-right">0.0 l/min</span>
                <span className="text-gray-500">Consumo hoy</span> <span className="text-right">0 L</span>
                <span className="text-gray-500">Próximo riego</span> <span className="text-right">Vie 05:30</span>
              </div>
            </div>

            {/* Tarjeta Zona Este */}
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Zona Este</h3>
                <span className="text-gray-400 text-sm">Frijol</span>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold">37.4<span className="text-lg">%</span></span>
                <span className="text-xs text-gray-500 mb-1">Humedad óptima</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-auto">Válvula cerrada</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full mb-6">
                <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: '37.4%', left: '0%' }}></div>
                <div className="absolute top-3 left-[35%] text-xs text-gray-500">mín 35 %</div>
                <div className="absolute top-3 right-[35%] text-xs text-gray-500">máx 65 %</div>
                <div className="absolute h-4 w-0.5 bg-gray-400 top-[-4px] left-[35%]"></div>
                <div className="absolute h-4 w-0.5 bg-gray-400 top-[-4px] right-[35%]"></div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm mt-8">
                <span className="text-gray-500">Estado</span> <span className="text-right">en espera</span>
                <span className="text-gray-500">Flujo</span> <span className="text-right">0.0 l/min</span>
                <span className="text-gray-500">Consumo hoy</span> <span className="text-right">0 L</span>
                <span className="text-gray-500">Próximo riego</span> <span className="text-right">Jue 18:00</span>
              </div>
            </div>

          </div>
        </section>

        {/* PANELES INFERIORES: GRID 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CONFIGURAR ZONA */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Configurar zona</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                <input type="text" className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cultivo</label>
                <input type="text" className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Humedad mínima (%)</label>
                <input type="number" className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Humedad máxima (%)</label>
                <input type="number" className="w-full border border-gray-300 rounded p-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              <label className="text-sm font-medium">Zona activa</label>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 mb-6">Crear zona</button>
            
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="pb-2 font-normal">Zona</th>
                  <th className="pb-2 font-normal">Umbrales</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2">Zona Norte<br/><span className="text-xs text-gray-500">Maíz</span></td>
                  <td className="py-2">40–70 %</td>
                  <td className="py-2 text-right">
                    <button className="text-xs border border-gray-300 px-2 py-1 rounded mr-2 hover:bg-gray-100">Editar</button>
                    <button className="text-xs border border-gray-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">Eliminar</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Zona Sur<br/><span className="text-xs text-gray-500">Tomate</span></td>
                  <td className="py-2">55–80 %</td>
                  <td className="py-2 text-right">
                    <button className="text-xs border border-gray-300 px-2 py-1 rounded mr-2 hover:bg-gray-100">Editar</button>
                    <button className="text-xs border border-gray-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">Eliminar</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Zona Este<br/><span className="text-xs text-gray-500">Frijol</span></td>
                  <td className="py-2">35–65 %</td>
                  <td className="py-2 text-right">
                    <button className="text-xs border border-gray-300 px-2 py-1 rounded mr-2 hover:bg-gray-100">Editar</button>
                    <button className="text-xs border border-gray-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* HORARIOS DE RIEGO */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Horarios de riego</h2>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Zona</label>
              <select className="w-full border border-gray-300 rounded p-2 bg-white">
                <option>Zona Norte</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">Días</label>
              <div className="flex flex-wrap gap-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
                  <label key={dia} className="flex items-center gap-1 border border-gray-300 px-2 py-1 rounded bg-white text-xs">
                    <input type="checkbox" defaultChecked={['Lun','Mar','Mié','Jue','Vie'].includes(dia)} className="text-blue-600 rounded" />
                    {dia}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Inicio</label>
                <input type="time" defaultValue="06:00" className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fin</label>
                <input type="time" defaultValue="06:30" className="w-full border border-gray-300 rounded p-2" />
              </div>
            </div>
            
            <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 mb-6">Agregar horario</button>

            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="pb-2 font-normal">Zona</th>
                  <th className="pb-2 font-normal">Días</th>
                  <th className="pb-2 font-normal">Hora</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2">Zona Norte</td>
                  <td className="py-2 text-xs">Lun Mar Mié Jue Vie</td>
                  <td className="py-2">06:00–06:30</td>
                  <td className="py-2 text-right">
                    <button className="text-xs border border-gray-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">Quitar</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Zona Sur</td>
                  <td className="py-2 text-xs">Lun Mié Vie</td>
                  <td className="py-2">05:30–06:15</td>
                  <td className="py-2 text-right">
                    <button className="text-xs border border-gray-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">Quitar</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Zona Este</td>
                  <td className="py-2 text-xs">Mar Jue Sáb</td>
                  <td className="py-2">18:00–18:40</td>
                  <td className="py-2 text-right">
                    <button className="text-xs border border-gray-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">Quitar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* CLIMA SIMULADO */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Clima (simulado)</h2>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Temperatura: 25 °C</span>
              </div>
              <input type="range" className="w-full accent-indigo-600" />
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Probabilidad de lluvia: 5 %</span>
              </div>
              <input type="range" className="w-full accent-indigo-600" />
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <label className="text-sm font-medium">Está lloviendo ahora</label>
            </div>

            <div className="flex gap-2 mb-4">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Fijar clima manual</button>
              <button className="bg-white border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50">Automático</button>
            </div>
            <p className="text-xs text-gray-500">
              Lluvia ≥ 60 %, helada (≤ 3 °C) o calor extremo (≥ 42 °C) suspenden el riego.
            </p>
          </section>

          {/* PRUEBA DE FALLAS */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Prueba de fallas (simulación)</h2>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Zona</label>
              <select className="w-full border border-gray-300 rounded p-2 bg-white">
                <option>Zona Norte</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-1">Falla</label>
              <select className="w-full border border-gray-300 rounded p-2 bg-white">
                <option>Ninguna (reparar)</option>
              </select>
            </div>
            
            <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 mb-4">Aplicar</button>
            
            <p className="text-xs text-gray-500">
              El sistema compara la orden de la válvula con el flujo medido. Al confirmar la
              anomalía levanta una alarma y bloquea la zona hasta que se reconozca.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}