import * as QRCode from 'qrcode';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Types } from 'mongoose'; // Import pour la gestion des ObjectId

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async countBookings(): Promise<number> {
    return this.bookingModel.countDocuments();
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // const qrData = `booking:${Date.now()}:${createBookingDto.userId}:${createBookingDto.concertId}`;
    /* const qrData = `booking:${Date.now()}:${createBookingDto.userId}:${createBookingDto.concertId}`;

    let qrCode;
    try {
      qrCode = await QRCode.toDataURL(qrData); // Génération du QR code
    } catch (err) {
      throw new Error('QR code generation failed');
    } */

    const booking = new this.bookingModel({
      ...createBookingDto,
      /* qrCode, */
    });
    return booking.save();  
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().exec();
  }

  async findOne(id: string): Promise<Booking> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    // const qrData = `booking:${Date.now()}:${createBookingDto.userId}:${createBookingDto.concertId}`;
    const qrData = `${process.env.APP_URL || 'http://localhost'}:${process.env.PORT || 3000}/bookings/${booking._id}`;

    let qrCode;
    try {
      qrCode = await QRCode.toDataURL(qrData); // Génération du QR code
      booking.qrCode = qrCode;
    } catch (err) {
      throw new Error('QR code generation failed');
    }

    return booking;
  }

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
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    const result = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Booking with id ${id} not found`);
    return { deleted: true };
  }
}
