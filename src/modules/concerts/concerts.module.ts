import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConcertsService } from './concerts.service';
import { ConcertsController } from './concerts.controller';
import { Concert, ConcertSchema } from './entities/concert.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Concert.name, schema: ConcertSchema }])
  ],
  controllers: [ConcertsController],
  providers: [ConcertsService],
  exports: [ConcertsService],
})
export class ConcertsModule {}
