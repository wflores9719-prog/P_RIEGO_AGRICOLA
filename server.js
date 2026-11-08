require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const zonasRoutes = require('./routes/zonasRoutes');
const umbralesRoutes = require('./routes/umbralesRoutes');
const horariosRoutes = require('./routes/horariosRoutes');
const sensoresRoutes = require('./routes/sensoresRoutes');
const valvulasRoutes = require('./routes/valvulasRoutes');
const climaRoutes = require('./routes/climaRoutes');
const simulacionRoutes = require('./routes/simulacionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/zonas', zonasRoutes);
app.use('/api/umbrales', umbralesRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/sensores', sensoresRoutes);
app.use('/api/valvulas', valvulasRoutes);
app.use('/api/clima', climaRoutes);
app.use('/api/simulacion', simulacionRoutes);

// Main
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API del Sistema de Riego funcionando'
    });
});

// MySQL
app.get('/api/health/db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS conexion');

        res.json({
            mensaje: 'Conexión con MySQL exitosa',
            resultado: rows[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al conectar con MySQL',
            error: error.message
        });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});