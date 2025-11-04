import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Artist } from '../../artists/entities/artist.entity';

@Schema({ timestamps: true })
export class Favorite extends Document {
  @Prop({ required: true, ref: 'User' })
  user_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Artist', required: true })
  artist_id: Artist;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);