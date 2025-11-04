import { Get, Controller, Render, Req } from '@nestjs/common';
import { ArtistsService } from './modules/artists/artists.service';
import { ConcertsService } from './modules/concerts/concerts.service';
import { FavoritesService } from './modules/favorites/favorites.service';
import type { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly concertsService: ConcertsService,
    private readonly favoritesService: FavoritesService
  ) {}

  @Get('/')
  @Render('index')
  async home(@Req() req: Request) {
    const recupArtists = await this.artistsService.findAll();
    const featuredArtists = recupArtists.slice(0, 3);

    let concerts = await this.concertsService.findAll();
    concerts = concerts.slice(0, 3);

    const currentUserId = req.session?.user ? req.session.user.id : null;

    if (currentUserId) {
      const favorites = await this.favoritesService.findByUser(currentUserId);
      const favoriteArtistIds = (favorites as any[])
      .filter(f => f.artist_id) // élimine les entrées null
      .map(f => (f.artist_id as any)._id.toString());


      (featuredArtists as any[]).forEach((artist: any) => {
        artist.isFavorite = favoriteArtistIds.includes(artist._id.toString());
      });
    } else {
      (featuredArtists as any[]).forEach((artist: any) => {
        artist.isFavorite = false;
      });
    }

    return { 
      featuredArtists,
      concerts,
      currentUserId,
    };
  }
}
