import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ArtistsService } from '../artists/artists.service';
import { ConcertsService } from '../concerts/concerts.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly artistsService: ArtistsService,
    private readonly concertsService: ConcertsService,
  ) {}

  async getDashboardStats() {
    const [usersCount, artistsCount, concertsCount] = await Promise.all([
      this.usersService.countUsers(),
      this.artistsService.countArtists(),
      this.concertsService.countConcerts(),
    ]);

    return {
      users: usersCount,
      artists: artistsCount,
      concerts: concertsCount,
      other: 0, // ajouter une autre statistique si nécessaire
    };
  }
}
