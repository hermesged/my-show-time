import { IsString, IsOptional, IsNumber, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  band_id: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsString()
  dateTime?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  available_seats: number;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  guest_artists?: string;
}
