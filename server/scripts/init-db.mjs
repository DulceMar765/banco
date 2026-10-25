import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');

// Cargar variables de entorno
dotenv.config({ path: path.join(serverDir, '.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ Error: No se encontró DATABASE_URL en el archivo .env');
  process.exit(1);
}

// Parsear URL de MySQL: mysql://user:password@host:port/database
const regex = /^mysql:\/\/([^:]+)(?::([^@]*)?)?@([^:/]+)(?::(\d+))?\/([^?]+)?/;
const match = dbUrl.match(regex);

if (!match) {
  console.error('❌ Error: Formato de DATABASE_URL inválido en .env');
  process.exit(1);
}

const [, user, password, host, port = '3306', database] = match;
const sqlFilePath = path.join(serverDir, 'cooperativa_financiera_mysql.sql');

if (!fs.existsSync(sqlFilePath)) {
  console.error(`❌ Error: No se encontró el archivo SQL en: ${sqlFilePath}`);
  process.exit(1);
}

console.log('🚀 Iniciando configuración de base de datos local...');
console.log(`📡 Servidor: ${host}:${port} | Usuario: ${user} | BD: ${database || 'cooperativa_financiera'}`);

// Localizar mysql.exe
const possiblePaths = [
  'mysql',
  'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe',
  'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe'
];

let mysqlBin = null;
for (const p of possiblePaths) {
  try {
    if (p === 'mysql') {
      execSync('mysql --version', { stdio: 'ignore' });
      mysqlBin = 'mysql';
      break;
    } else if (fs.existsSync(p)) {
      mysqlBin = `"${p}"`;
      break;
    }
  } catch (e) {
    // Continuar buscando
  }
}

if (!mysqlBin) {
  console.error('⚠️ No se encontró el cliente mysql.exe en las rutas habituales.');
  console.log('Puedes ejecutar el archivo cooperativa_financiera_mysql.sql directamente en MySQL Workbench.');
  console.log('Luego de ejecutarlo en Workbench, corre: npx prisma db pull && npx prisma generate');
  process.exit(1);
}

try {
  console.log('⏳ Ejecutando cooperativa_financiera_mysql.sql (tablas, catálogos, triggers y procedimientos)...');
  
  // Construir comando para ejecutar el SQL
  // Se usa --default-character-set=utf8mb4 para preservar tildes y caracteres especiales
  const passArg = password ? `-p"${password}"` : '';
  const cmd = `${mysqlBin} -h ${host} -P ${port} -u ${user} ${passArg} --default-character-set=utf8mb4 < "${sqlFilePath}"`;

  execSync(cmd, { stdio: 'inherit', shell: true });
  console.log('✅ Archivo SQL ejecutado con éxito en MySQL.');

  console.log('🔄 Sincronizando modelos con Prisma (db pull)...');
  execSync('npx prisma db pull', { cwd: serverDir, stdio: 'inherit', shell: true });

  console.log('⚙️ Generando cliente de TypeScript (prisma generate)...');
  execSync('npx prisma generate', { cwd: serverDir, stdio: 'inherit', shell: true });

  console.log('\n🎉 ¡Base de datos inicializada y migrada al 100%!');
  console.log('Todos tus compañeros de equipo solo necesitan ejecutar: npm run db:init');
} catch (error) {
  console.error('❌ Error durante la inicialización:', error.message);
  process.exit(1);
}
