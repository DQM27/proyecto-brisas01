// src/common/enums/rol-usuario.enum.ts

export enum RolUsuario {
  ADMIN = 'ADMIN', // Acceso total al sistema (gestiona usuarios, lista negra, configuración, etc.)
  SUPERVISOR = 'SUPERVISOR', // Puede ver reportes y autorizar ingresos especiales
  OPERADOR = 'OPERADOR', // Operación diaria: registrar ingresos/salidas
  SEGURIDAD = 'SEGURIDAD', // Solo controla accesos, sin modificar registros
}
