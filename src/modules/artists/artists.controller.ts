import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import type { Response } from 'express';
import { ArtistsService } from './artists.service';
import { FavoritesService } from '../favorites/favorites.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('artists')
export class ArtistsController {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly favoritesService: FavoritesService
  ) {}

  @Get()
  @Render('artists')
  async artists(@Req() req: Request) {
    const artists = await this.artistsService.findAll();
    const currentUserId = req.session.user ? req.session.user.id : null;

    if (currentUserId) {
      const favorites = await this.favoritesService.findByUser(currentUserId);

      // Sécurisation : éliminer les favorites sans artist_id
      const favoriteArtistIds = (favorites as any[])
        .filter(f => f.artist_id && f.artist_id._id)
        .map(f => f.artist_id._id.toString());


      (artists as any[]).forEach((artist: any) => {
        artist.isFavorite = favoriteArtistIds.includes(artist._id?.toString() || '');
      });
    } else {
      (artists as any[]).forEach((artist: any) => {
        artist.isFavorite = false;
      });
    }

    return { artists, currentUserId };
  }

  @Get('new')
  @UseGuards(AuthGuard, RolesGuard, AdminGuard)
  @Render('admin/addArtist')
  showForm() {
    return {};
  }

  @Post('add')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads',
      }),
    }),
  )
  async saveArtist(@UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      return { message: 'Please choose one image' };
    }
    const newArtist = {
      name: body.name,
      genre: body.genre,
      description: body.description,
      image: `/uploads/${file.filename}`,
    };
    await this.artistsService.create(newArtist);
    return { message: 'Artist added successfully' };
  }

  @Post()
  create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistsService.create(createArtistDto);
  }

  @Get('api/')
  @UseGuards(AuthGuard, RolesGuard)
  findAll() {
    return this.artistsService.findAll();
  }

  @Get('all')
  async getAllArtists() {
    return this.artistsService.findAll();
  }

  @Get('admin')
  @UseGuards(AuthGuard, AdminGuard)
  @Render('admin-artists')
  async showArtistsForAdmin() {
    const artists = await this.artistsService.findAll();
    return { artists };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArtistDto: UpdateArtistDto) {
    return this.artistsService.update(id, updateArtistDto);
  }

@Post(':id/delete')
@UseGuards(AdminGuard)
async remove(@Param('id') id: string, @Res() res: Response) {
  await this.artistsService.remove(id);
  return res.redirect('/artists/admin');
}

}
