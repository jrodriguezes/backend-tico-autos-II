import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // Importamos @prop que es un decorador para definir propiedades de esquema.
// Schema que es la plantilla de mongo y SchemaFactory que es un helper de nestjs/mongo para crear el schema en base a decoradores
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>; // Simplemente nos aseguramos que el tipo de documento que se va a
// crear a partir de este esquema sea del tipo UserDocument, que es un documento hidratado de Mongoose basado en la clase User.
//  Lo cual hace que estemos seguros que es parte de la bd y aparte de tener sus propiedades tenga sus metodos como save(), update(), etc.
// que son propios de los documentos de Mongoose. Es una forma de tipar correctamente el documento que se va a crear a partir de este esquema.

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ required: true, unique: true })
  numberId: number;

  @Prop({ required: true })
  name: string;

  // Importante: que NO salga en respuestas por defecto
  @Prop({ required: true, select: false })
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
