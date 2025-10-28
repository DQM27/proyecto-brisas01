import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
config();

// 🔹 Importar entidades
import { Usuario } from './modules/usuarios/entities/usuario.entity';
import { Empresa } from './modules/empresas/entities/empresa.entity';
import { Contratista } from './modules/contratistas/entities/contratista.entity';
import { Vehiculo } from './modules/vehiculos/entities/vehiculo.entity';
import { Gafete } from './modules/gafetes/entities/gafete.entity';
import { HistorialGafete } from './modules/gafetes/entities/historial-gafete.entity';
import { Ingreso } from './modules/ingresos/entities/ingreso.entity';
import { ListaNegra } from './modules/lista-negra/entities/lista-negra.entity';
import { PuntoAcceso } from './modules/puntos-acceso/entities/punto-acceso.entity';

import { RolUsuario } from './common/enums/rol-usuario.enum';
import { TipoVehiculo } from './common/enums/tipo-vehiculo.enum';
import { TipoGafete } from './common/enums/gafete-tipo.enum';
import { EstadoGafete } from './common/enums/gafete-estado.enum';
import { GrupoRiesgo, NivelRiesgo, CausaListaNegra } from './common/enums/lista-negra.enums';
import { TipoAutorizacion } from './common/enums/tipo-autorizacion.enum';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
      Usuario,
      Empresa,
      Contratista,
      Vehiculo,
      Gafete,
      HistorialGafete,
      Ingreso,
      ListaNegra,
      PuntoAcceso,
    ],
  });

  await dataSource.initialize();

  // ⚠️ Eliminar y recrear todas las tablas
  await dataSource.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  await dataSource.synchronize();

  console.log('📦 Base de datos sincronizada y limpia');

  // ===============================
  // 🔹 Crear empresas
  // ===============================
  const empresaRepo = dataSource.getRepository(Empresa);
  const empresa1 = empresaRepo.create({ nombre: 'Empresa Alpha' });
  const empresa2 = empresaRepo.create({ nombre: 'Empresa Beta' });
  await empresaRepo.save([empresa1, empresa2]);

  // ===============================
  // 🔹 Crear contratistas
  // ===============================
  const contratistaRepo = dataSource.getRepository(Contratista);
  const contratistas: Contratista[] = [];
  for (let i = 1; i <= 5; i++) {
    const c = contratistaRepo.create({
      primerNombre: `Contratista${i}`,
      primerApellido: `Apellido${i}`,
      cedula: `10000000${i}`,
      telefono: `8888000${i}`,
      empresa: i % 2 === 0 ? empresa2 : empresa1,
      fechaVencimientoPraind: new Date(Date.now() + (i % 2 === 0 ? -10 : 10) * 24 * 3600 * 1000),
      activo: true,
    });
    contratistas.push(c);
  }
  await contratistaRepo.save(contratistas);

  // ===============================
  // 🔹 Crear vehículos
  // ===============================
  const vehiculoRepo = dataSource.getRepository(Vehiculo);
  const vehiculos: Vehiculo[] = [];
  contratistas.forEach((c, idx) => {
    const v = vehiculoRepo.create({
      contratista: c,
      tipo: idx % 2 === 0 ? TipoVehiculo.CAMIONETA : TipoVehiculo.AUTOMOVIL,
      marca: idx % 2 === 0 ? 'Toyota' : 'Honda',
      color: idx % 2 === 0 ? 'Rojo' : 'Azul',
      numeroPlaca: `ABC-${1000 + idx}`,
      tieneLicencia: idx % 2 === 0,
      dekraAlDia: idx % 2 === 0,
      marchamoAlDia: idx % 3 !== 0,
      activo: true,
    });
    vehiculos.push(v);
  });
  await vehiculoRepo.save(vehiculos);

  // ===============================
  // 🔹 Crear puntos de acceso
  // ===============================
  const puntoRepo = dataSource.getRepository(PuntoAcceso);
  const punto1 = puntoRepo.create({
    nombre: 'Entrada Principal',
    codigo: 'EP01',
    ubicacion: 'Frente',
    activo: true,
  });
  const punto2 = puntoRepo.create({
    nombre: 'Salida Principal',
    codigo: 'SP01',
    ubicacion: 'Frente',
    activo: true,
  });
  await puntoRepo.save([punto1, punto2]);

  // ===============================
  // 🔹 Crear usuarios
  // ===============================
  const usuarioRepo = dataSource.getRepository(Usuario);
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  const usuarios = [
    usuarioRepo.create({
      primerNombre: 'Admin',
      primerApellido: 'Principal',
      cedula: '1111111111',
      email: 'admin@test.com',
      password: passwordHash,
      rol: RolUsuario.ADMIN,
      activo: true,
    }),
    usuarioRepo.create({
      primerNombre: 'Operador',
      primerApellido: 'Principal',
      cedula: '2222222222',
      email: 'operador@test.com',
      password: passwordHash,
      rol: RolUsuario.OPERADOR,
      activo: true,
    }),
  ];
  await usuarioRepo.save(usuarios);

  // ===============================
  // 🔹 Crear gafetes
  // ===============================
  const gafeteRepo = dataSource.getRepository(Gafete);
  const gafetes: Gafete[] = [];
  contratistas.forEach((c, idx) => {
    const g = gafeteRepo.create({
      contratista: c,
      tipo: idx % 2 === 0 ? TipoGafete.PERSONAL : TipoGafete.VISITANTE,
      estado: idx % 3 === 0 ? EstadoGafete.INACTIVO : EstadoGafete.ACTIVO,
      codigo: `GAF-${idx + 100}`,
      descripcion: `Gafete de ${c.primerNombre}`,
    });
    gafetes.push(g);
  });
  await gafeteRepo.save(gafetes);

  // ===============================
  // 🔹 Crear ingresos (ejemplo)
  // ===============================
  const ingresoRepo = dataSource.getRepository(Ingreso);
  const ingresos: Ingreso[] = [];
  contratistas.forEach((c, idx) => {
    const i = ingresoRepo.create({
      contratista: c,
      gafete: gafetes[idx],
      fechaIngreso: new Date(),
      ingresadoPor: usuarios[0],
      dentroFuera: true,
      tipoAutorizacion: TipoAutorizacion.AUTOMATICA,
    });
    ingresos.push(i);
  });
  await ingresoRepo.save(ingresos);

  // ===============================
  // 🔹 Crear historial de gafetes
  // ===============================
  const historialRepo = dataSource.getRepository(HistorialGafete);
  const historial: HistorialGafete[] = [];
  ingresos.forEach((i, idx) => {
    const h = historialRepo.create({
      gafete: gafetes[idx],
      contratista: contratistas[idx],
      ingreso: i,
      fechaAsignacion: new Date(),
    });
    historial.push(h);
  });
  await historialRepo.save(historial);

  // ===============================
  // 🔹 Crear lista negra
  // ===============================
  const lnRepo = dataSource.getRepository(ListaNegra);
  const listaNegra: ListaNegra[] = [];
  contratistas.forEach((c, idx) => {
    if (idx % 2 === 0) {
      const ln = lnRepo.create({
        contratista: c,
        grupoRiesgo: GrupoRiesgo.ALTO,
        causa: CausaListaNegra.COMPORTAMIENTO_INADECUADO,
        nivelRiesgo: NivelRiesgo.ROJO,
        entradaActiva: idx % 4 !== 0,
        observaciones: 'Test lista negra',
      });
      listaNegra.push(ln);
    }
  });
  await lnRepo.save(listaNegra);

  console.log('✅ Seed completado con éxito');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Error ejecutando seed:', err);
});
