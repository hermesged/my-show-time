import * as QRCode from 'qrcode';

import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema';

import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // async create(data: Partial<Booking>): Promise<Booking> {
    // Génération d'un QR code unique
    const qrData = `booking:${Date.now()}:${createBookingDto.userId}:${createBookingDto.concertId}`;
    const qrCode = await QRCode.toDataURL(qrData); // renvoie une image base64

    // const booking = new this.bookingModel(createBookingDto);
    const booking = new this.bookingModel({
      ...createBookingDto,
      qrCode,
    });
    return booking.save();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().select('').exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  /* update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  } */

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const updated = await this.bookingModel
      .findByIdAndUpdate(
        id,
        { $set: updateBookingDto },
        { new: true, runValidators: true },
      )
      .populate('userId concertId')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Booking with id ${id} not found`);
    return { deleted: true };
  }
}
