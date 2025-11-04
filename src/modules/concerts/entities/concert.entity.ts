import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Concert extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  band_id: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  available_seats: number;

  @Prop()
  genre: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  guest_artists: string; 
}

export const ConcertSchema = SchemaFactory.createForClass(Concert);
