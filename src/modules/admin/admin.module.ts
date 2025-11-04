import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { ArtistsModule } from '../artists/artists.module';
import { ConcertsModule } from '../concerts/concerts.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [UsersModule, ArtistsModule, ConcertsModule, BookingsModule],
  controllers: [AdminController],
})
export class AdminModule {}
