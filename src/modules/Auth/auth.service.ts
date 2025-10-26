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
   * Valida usuario y contraseña
   */
  async validateUser(email: string, password: string) {
    const user = await this.usuariosService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Contraseña incorrecta');

    return user;
  }

  /**
   * Login: genera access y refresh token
   */
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      primerNombre: user.primerNombre,
      primerApellido: user.primerApellido,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  /**
   * Renovar access token usando refresh token
   */
  refreshAccessToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token);
      return this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          rol: payload.rol,
          primerNombre: payload.primerNombre,
          primerApellido: payload.primerApellido,
        },
        { expiresIn: '15m' },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
