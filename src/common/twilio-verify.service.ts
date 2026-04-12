import { Injectable, InternalServerErrorException } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class TwilioVerifyService {
  private readonly client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  private readonly verifyServiceSid =
    process.env.TWILIO_VERIFY_SERVICE_SID || '';

  async sendCode(phoneNumber: string) {
    try {
      return await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({ to: phoneNumber, channel: 'sms' });
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new InternalServerErrorException(
        'Failed to send verification code',
      );
    }
  }

  async verifyCode(phoneNumber: string, code: string) {
    try {
      return await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({ to: phoneNumber, code });
    } catch (error) {
      console.error('Error verifying code:', error);
      throw new InternalServerErrorException('Failed to verify code');
    }
  }
}
