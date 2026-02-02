import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      const newAccessToken = this.jwtService.sign(
        { email: payload.email, sub: payload.sub, role: payload.role },
        {
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      );
      
      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new Error('Token de refresco inválido');
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}