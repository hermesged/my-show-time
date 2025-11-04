import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Render,
  Redirect,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import axios from 'axios';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) { }

  @Get()
  @Render('all-concerts')
  async findAll(
    @Query('search') search?: string,
    @Query('genre') genre?: string,
    @Query('artist') artist?: string,
    @Query('year') year?: string,
  ) {
    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' }; // non strict, insensible à la casse
    }

    if (artist) {
      filter.band_id = artist;
    }

    if (year) {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
      filter.date = { $gte: start, $lt: end };
    }

    const concerts = await this.concertsService.findAll(filter);

    const artistsRes = await axios.get(`${process.env.APP_URL}/artists/all`);
    const artists = artistsRes.data;


    const allConcerts = await this.concertsService.findAll();
    const yearsSet = new Set<number>();
    allConcerts.forEach(c => {
      if (c.date) yearsSet.add(c.date.getFullYear());
    });
    const years = Array.from(yearsSet).sort((a, b) => a - b);

    return { concerts, search, genre, artist, year, artists, years };
  }

@Get('admin')
  @UseGuards(AdminGuard)
  @Render('admin/all-concerts') // ton template HBS
  async findAllAdmin() {
    const concerts = await this.concertsService.findAll(); // retourne tout
    return { concerts };
  }


 @Get('new')
@UseGuards(AdminGuard)
@Render('admin/add-concert')
async newConcertForm() {
  const artistsRes = await axios.get(`${process.env.APP_URL}/artists/all`);
  const artists = artistsRes.data;

  return { artists };
}

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body() createConcertDto: CreateConcertDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const dto = plainToInstance(CreateConcertDto, createConcertDto);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors.flatMap((err) => Object.values(err.constraints || {}));

      return res.render('admin/add-concert', {
      errorMessages,
      data: createConcertDto,
    });
    }

    if (createConcertDto.dateTime) {
      createConcertDto.date = new Date(createConcertDto.dateTime);
      delete createConcertDto.dateTime;
    }

    if (file) {
      createConcertDto.image = `/images/${file.filename}`;
    }

    await this.concertsService.create(createConcertDto);

    return res.redirect('/admin/concerts');
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Render('show-detail-concert')
  async findOne(@Param('id') id: string) {
    const concert = await this.concertsService.findOne(id);
    return { concert };
  }

  @Get(':id/edit')
  @UseGuards(AdminGuard)
  @Render('edit-concert')
  async editForm(@Param('id') id: string) {
    const concert = await this.concertsService.findOne(id);
    return { concert };
  }

  @Post(':id/update')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateConcertDto: UpdateConcertDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const dto = plainToInstance(UpdateConcertDto, updateConcertDto);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors.flatMap((err) => Object.values(err.constraints || {}));

      return res.render('auth/register', {
        error: errorMessages,
        data: updateConcertDto,
      });
    }

    if (updateConcertDto.dateTime) {
      updateConcertDto.date = new Date(updateConcertDto.dateTime);
      delete updateConcertDto.dateTime;
    }

    if (file) {
      updateConcertDto.image = `/images/${file.filename}`;
    }

    await this.concertsService.update(id, updateConcertDto);

    return res.redirect('/concerts');
  }

  @Post(':id/delete')
  @UseGuards(AdminGuard)
  @Redirect('/concerts')
  async remove(@Param('id') id: string) {
    await this.concertsService.remove(id);
  }
}
