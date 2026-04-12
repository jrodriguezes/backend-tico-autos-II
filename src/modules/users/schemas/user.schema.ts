import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // Importamos @prop que es un decorador para definir propiedades de esquema.
// Schema que es la plantilla de mongo y SchemaFactory que es un helper de nestjs/mongo para crear el schema en base a decoradores
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>; // Simplemente nos aseguramos que el tipo de documento que se va a
// crear a partir de este esquema sea del tipo UserDocument, que es un documento hidratado de Mongoose basado en la clase User.
//  Lo cual hace que estemos seguros que es parte de la bd y aparte de tener sus propiedades tenga sus metodos como save(), update(), etc.
// que son propios de los documentos de Mongoose. Es una forma de tipar correctamente el documento que se va a crear a partir de este esquema.

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  // =========================================
  // DATOS GENERALES DEL USUARIO
  // =========================================
  @Prop({ required: false, unique: true, sparse: true })
  numberId: number;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  fLastName: string;

  @Prop({ required: false })
  sLastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false })
  phoneNumber: string;

  // =========================================
  // REGISTRO NORMAL / LOGIN CON CREDENCIALES
  // =========================================

  @Prop({ select: false })
  passwordHash: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  verificationToken?: string;

  // =========================================
  // AUTENTICACION CON GOOGLE
  // =========================================

  @Prop({ default: 'local' })
  authProvider: 'local' | 'google';

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ default: false })
  numberIdValidated: boolean;

  // =========================================
  // 2FA POR SMS
  // =========================================

  @Prop({ default: false })
  twoFactorPending: boolean;

  @Prop({ type: Date, default: null })
  twoFactorRequestedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
