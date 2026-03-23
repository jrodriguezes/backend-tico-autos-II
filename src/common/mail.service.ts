import sgMail from '@sendgrid/mail';

export class MailService {
  constructor() {
    console.log('API KEY:', process.env.SENDGRID_API_KEY);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3001/verify?token=${token}`;

    const msg = {
      to: email,
      from: 'rodriguezjeremyinfj@gmail.com',
      subject: 'Verifica tu cuenta',
      html: `
        <h2>Bienvenido</h2>
        <p>Haz click para activar tu cuenta:</p>
        <a href="${url}">Verificar cuenta</a>
      `,
    };

    try {
      const response = await sgMail.send(msg);
      console.log('EMAIL ENVIADO:', response);
    } catch (error) {
      console.error('ERROR AL ENVIAR EMAIL:', error.response?.body || error);
    }
  }
}
