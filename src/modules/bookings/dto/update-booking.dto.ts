import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}

/* import { Min } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @Type(() => Number)
  @Min(0)
  ticketsCount?: number;
} */
