import { Controller, Get, Render, UseGuards, Req } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ArtistsService } from '../artists/artists.service';
import { ConcertsService } from '../concerts/concerts.service';
import { BookingsService } from '../bookings/bookings.service';
import { AdminGuard } from '../auth/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private artistsService: ArtistsService,
    private concertsService: ConcertsService,
    private bookingsService: BookingsService,
  ) {}

  @Get()
  @Render('admin/admin-dashboard')
  async dashboard(@Req() req) {
    const userSession = req.session?.user;
    const user = await this.usersService.findOne(userSession.id);

    const stats = {
      users: await this.usersService.countUsers(),
      concerts: await this.concertsService.countConcerts(),
      artists: await this.artistsService.countArtists(),
      bookings: await this.bookingsService.countBookings(),
    };

    return {
      currentAdmin: user,
      stats,
    };
  }
}
