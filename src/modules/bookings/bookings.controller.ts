import {
  Controller,
  Get,
  Req,
  Res,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
async create(@Body() createBookingDto: CreateBookingDto, @Req() req: Request, @Res() res: Response,) {

    const userSession = req.session?.user;
    createBookingDto.userId = userSession.id
    const booking = await this.bookingsService.create(createBookingDto);
    return res.redirect(`bookings/${(booking as any)._id}`);
   
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @Render('admin/bookings')
  async adminBookings() {
  const bookings = await this.bookingsService.findAll();
  return { bookings };
  }


  /* @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  } */

  @Get(':id')
  @Render('ticket')
  async findOne(@Param('id') id: string) {
    const booking = await this.bookingsService.findOne(id);
    return { booking };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}