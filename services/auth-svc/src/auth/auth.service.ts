
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { OtpService } from '../otp/otp.service';
import { LoginResponseDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly otpService: OtpService,
  ) {}

  async sendOtp(phoneNumber: string): Promise<void> {
    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Check rate limiting
    const rateLimitKey = `otp_rate_limit:${phoneNumber}`;
    const attempts = await this.redisService.get(rateLimitKey);
    
    if (attempts && parseInt(attempts) >= 3) {
      throw new BadRequestException('Too many OTP requests. Please try after 1 hour.');
    }

    // Generate and send OTP
    const otp = this.generateOtp();
    const otpKey = `otp:${phoneNumber}`;
    
    // Store OTP in Redis with 5 minutes expiry
    await this.redisService.setEx(otpKey, 300, otp);
    
    // Increment rate limit counter
    const currentAttempts = attempts ? parseInt(attempts) + 1 : 1;
    await this.redisService.setEx(rateLimitKey, 3600, currentAttempts.toString()); // 1 hour expiry

    // Send OTP via notification service
    await this.otpService.sendSmsOtp(phoneNumber, otp);
  }

  async verifyOtpAndLogin(phoneNumber: string, otp: string): Promise<LoginResponseDto> {
    const otpKey = `otp:${phoneNumber}`;
    const storedOtp = await this.redisService.get(otpKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Delete OTP after successful verification
    await this.redisService.del(otpKey);
    
    // Clear rate limit
    await this.redisService.del(`otp_rate_limit:${phoneNumber}`);

    // Generate tokens
    const userId = uuidv4(); // In real app, get from user service
    const sessionId = uuidv4();
    
    const payload = { 
      sub: userId, 
      phone: phoneNumber, 
      sessionId,
      type: 'access'
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' }, 
      { expiresIn: '7d' }
    );

    // Store session in Redis
    const sessionKey = `session:${userId}:${sessionId}`;
    await this.redisService.setEx(sessionKey, 604800, JSON.stringify({
      userId,
      phoneNumber,
      refreshToken,
      createdAt: new Date().toISOString(),
      deviceInfo: 'web', // Get from request headers
    }));

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      tokenType: 'Bearer',
      user: {
        id: userId,
        phoneNumber,
        isNewUser: true, // Check from user service
      }
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify session exists
      const sessionKey = `session:${decoded.sub}:${decoded.sessionId}`;
      const session = await this.redisService.get(sessionKey);
      
      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      // Generate new access token
      const payload = { 
        sub: decoded.sub, 
        phone: decoded.phone, 
        sessionId: decoded.sessionId,
        type: 'access'
      };

      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

      return {
        accessToken: newAccessToken,
        expiresIn: 900,
        tokenType: 'Bearer',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Get all sessions for user and delete them
    const pattern = `session:${userId}:*`;
    const keys = await this.redisService.keys(pattern);
    
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }

  async getProfile(userId: string) {
    // In real app, fetch from user service
    return {
      id: userId,
      phoneNumber: '+91xxxxxxxxxx',
      isVerified: true,
      kycStatus: 'pending',
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
