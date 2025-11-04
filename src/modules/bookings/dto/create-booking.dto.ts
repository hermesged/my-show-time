import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsMongoId()
  @IsNotEmpty()
  concertId: string;

  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  ticketsCount: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsEnum(['confirmed', 'cancelled'])
  status?: string;
}
