
import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number with country code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+91)?[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  user: {
    id: string;
    phoneNumber: string;
    isNewUser: boolean;
  };
}
