import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida que el usuario exista y que la contraseña sea correcta
   */
  async validateUser(email: string, password: string) {
    const user = await this.usuariosService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Contraseña incorrecta');

    return user;
  }

  /**
   * Login con email y contraseña
   * Devuelve un token JWT seguro
   */
  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.validateUser(email, password);

    // Payload seguro para el token
    const payload = {
      email: user.email,
      rol: user.rol,
      primerNombre: user.primerNombre,
      primerApellido: user.primerApellido,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
