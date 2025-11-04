import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
//le bro mongoose gère auto le created et le updated Att..
export class Artist extends Document {
@Prop({ required: true})
name: string;

@Prop()
genre : string;

@Prop()
description: string;

@Prop()
image: string;

}

export const ArtistSchema = SchemaFactory.createForClass(Artist);