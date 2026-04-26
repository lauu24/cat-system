const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordCifrada = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      email: 'admin@gmail.com',
      password: passwordCifrada,
      rol: 'ADMINISTRADOR',
    },
  });

  console.log('Usuario administrador creado:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());