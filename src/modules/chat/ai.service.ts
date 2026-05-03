import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    // Aqui obtenemos la key de OpenRouter del .env
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', // Opcional: URL de la pagina para identificarse ante OpenRouter
        'X-Title': 'Tico-Autos-II', // Opcional: Nombre de la aplicacion
      },
    });
  }

  async validateMessage(content: string): Promise<boolean> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'openai/gpt-4o-mini', // Modelo a usar a traves de OpenRouter
        messages: [
          {
            role: 'system',
            content: `Eres un moderador de una plataforma de venta de autos. 
            Debes detectar si un usuario intenta pasar datos de contacto (telefonos, emails, links a WhatsApp).
            Responde UNICAMENTE con la palabra "SAFE" si es seguro, o "BLOCKED" si contiene datos de contacto.`,
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
      console.error('Error con OpenRouter:', error);
      return true; // Devuelve true para que el chat no se bloquee totalmente si no hay saldo
    }
  }
}
