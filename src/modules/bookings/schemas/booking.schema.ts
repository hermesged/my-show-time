import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Concert', required: true })
  concertId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true, min: 1 })
  ticketsCount: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ type: Date, default: Date.now })
  bookingDate: Date;

  @Prop()
  qrCode: string;

  @Prop({ 
    type: String, 
    enum: ['confirmed', 'cancelled'], 
    default: 'confirmed' 
  })
  status: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
