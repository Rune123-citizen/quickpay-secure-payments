
import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  async sendSmsOtp(phoneNumber: string, otp: string): Promise<void> {
    // In development, just log the OTP
    console.log(`📱 SMS OTP for ${phoneNumber}: ${otp}`);
    
    // In production, integrate with SMS service
    // await this.smsProvider.sendSms(phoneNumber, `Your PayFlow OTP is: ${otp}`);
  }

  async sendWhatsappOtp(phoneNumber: string, otp: string): Promise<void> {
    console.log(`📲 WhatsApp OTP for ${phoneNumber}: ${otp}`);
    
    // In production, integrate with WhatsApp Business API
  }
}
