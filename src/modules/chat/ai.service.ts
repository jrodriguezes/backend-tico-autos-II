import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    // Aqui obtenemos la key del .env automaticamente
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async validateMessage(content: string): Promise<boolean> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Es el mas barato y rapido para esto
        messages: [
          {
            role: 'system',
            content: `Eres un moderador de una plataforma de venta de autos. 
            Debes detectar si un usuario intenta pasar datos de contacto (telefonos, emails, links a WhatsApp).
            Responde UNICAMENTE con la palabra "SAFE" si es seguro, o "BLOCKED" si contiene datos de contacto.`
          },
          {
            role: 'user',
            content: content,
          },
        ],
      });

      const result = response.choices[0].message.content;
      if (!result) {
        return false;
      }

      return result.trim().toUpperCase() === 'SAFE';
    } catch (error) {
      console.error('Error con OpenAI:', error);
      return true; // Devuelve true para que el chat no se bloquee totalmente si no hay saldo / Cosa que va a pasar siempre ya que hay que recargar 5$
    }
  }
}
