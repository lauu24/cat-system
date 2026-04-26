require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const activosRoutes = require('./routes/activos.routes');
const categoriasRoutes = require('./routes/categorias.routes')

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/activos', activosRoutes);
app.use('/api/categorias', categoriasRoutes)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor CAT corriendo en puerto ${PORT}`);
});