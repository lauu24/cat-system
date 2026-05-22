require('dotenv').config();
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const activosRoutes = require('./routes/activos.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const asignacionesRoutes = require('./routes/asignaciones.routes');
const mantenimientosRoutes = require('./routes/mantenimientos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const reportesRoutes = require('./routes/reportes.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/activos', activosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/mantenimientos', mantenimientosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
const PORT = process.env.PORT || 3001;

// eliminar activos dados de baja hace más de 30 días
cron.schedule('0 0 * * *', async () => {
  try {
    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)

    const eliminados = await prisma.activo.deleteMany({
      where: {
        estado: 'DADO_DE_BAJA',
        fechaBaja: { lte: hace30Dias },
      },
    })

    if (eliminados.count > 0) {
      console.log(`Cron: ${eliminados.count} activo(s) dados de baja eliminados automáticamente`)
    }
  } catch (error) {
    console.error('Error en cron de limpieza:', error)
  }
})

app.listen(PORT, () => {
  console.log(`Servidor CAT corriendo en puerto ${PORT}`);
});