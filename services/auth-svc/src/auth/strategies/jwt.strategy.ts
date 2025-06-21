
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: any) {
    // Verify session exists in Redis
    const sessionKey = `session:${payload.sub}:${payload.sessionId}`;
    const session = await this.redisService.get(sessionKey);
    
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }

    return {
      userId: payload.sub,
      phone: payload.phone,
      sessionId: payload.sessionId,
    };
  }
}
