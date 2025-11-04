import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectModel(Concert.name) private concertModel: Model<Concert>,
  ) {}

  async create(createConcertDto: CreateConcertDto): Promise<Concert> {
    const concert = new this.concertModel(createConcertDto);
    return concert.save();
  }

  async findAll(filter: any = {}): Promise<Concert[]> {
    const today = new Date();
    
    if (!filter.date) {
      filter.date = { $gte: today };
    }

    return this.concertModel
      .find(filter)
      .sort({ date: 1 })
      .exec();
  }

  // Obtenir tous les concerts côté admin
  async findAllNoFilter(): Promise<Concert[]> {
    return this.concertModel.find().sort({ date: 1 }).exec();
  }

  // Compter les concerts
  async countConcerts(): Promise<number> {
    return this.concertModel.countDocuments().exec();
  }


  async findOne(id: string): Promise<Concert> {
    const concert = await this.concertModel.findById(id).exec();
    if (!concert) throw new NotFoundException('Concert not found');
    return concert;
  }

  async update(
    id: string,
    updateConcertDto: UpdateConcertDto,
  ): Promise<Concert> {
    const concert = await this.concertModel
      .findByIdAndUpdate(id, updateConcertDto, { new: true })
      .exec();
    if (!concert) throw new NotFoundException('Concert not found');
    return concert;
  }

  async remove(id: string): Promise<void> {
    const result = await this.concertModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Concert not found');
  }
}
