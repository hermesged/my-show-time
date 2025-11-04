import { Controller, Post, Get, Render, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ConcertsService } from '../concerts/concerts.service';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly concertsService: ConcertsService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('favorites')
  async listFavorites(@Req() req: Request) {
    const userId = req.session.user.id;

    const favorites = await this.favoritesService.findByUser(userId);

    const favoriteArtistIds = (favorites as any[])
      .filter(f => f.artist_id)
      .map(f => (f.artist_id as any)._id.toString());

    const favoriteArtists = (favorites as any[])
      .filter(f => f.artist_id)
      .map(f => {
        const artist = f.artist_id as any;
        artist.isFavorite = true;
        return artist;
      });

    const allConcerts = await this.concertsService.findAll();

    const favoriteConcerts = allConcerts.filter(c =>
      favoriteArtistIds.includes(c.band_id.toString())
    );

    return {
      currentUserId: userId,
      favoriteArtists,
      favoriteConcerts,
    };
  }

  @Post('add')
  @UseGuards(AuthGuard)
  async addFavorite(@Req() req: Request, @Body() body: { artist_id: string }) {
    const userId = req.session.user.id;
    try {
      const favorite = await this.favoritesService.addFavorite({
        user_id: userId,
        artist_id: body.artist_id,
      });
      return { success: true, favorite };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to add favorite' };
    }
  }

  @Delete(':artistId')
  @UseGuards(AuthGuard)
  async removeFavorite(@Req() req: Request, @Param('artistId') artistId: string) {
    const userId = req.session.user.id;
    try {
      await this.favoritesService.removeFavorite(userId, artistId.trim());
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Favorite not found' };
    }
  }
}
