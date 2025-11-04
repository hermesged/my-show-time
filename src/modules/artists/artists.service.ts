import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist } from './entities/artist.entity';
import { Model } from 'mongoose';

@Injectable()
export class ArtistsService {
  constructor(@InjectModel(Artist.name) private artistModel: Model<Artist>) {}

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    const artist = new this.artistModel(createArtistDto);
    return artist.save();
  }

  async findAll(): Promise<Artist[]> {
    return this.artistModel.find().exec();
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.artistModel.findById(id).exec();
    if (artist) {
      return artist;
    } else {
      throw new NotFoundException('Artist not found');
    }
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    const updated = await this.artistModel
      .findByIdAndUpdate(id, updateArtistDto, { new: true })
      .exec();
    if (updated) {
      return updated;
    } else {
      throw new NotFoundException('Artist not found');
    }
  }

  async remove(id: string): Promise<Artist> {
    const deleted = await this.artistModel.findByIdAndDelete(id).exec();
    if (deleted) {
      return deleted;
    } else {
      throw new NotFoundException('ARtist not found');
    }
  }
   async countArtists(): Promise<number> {
    return this.artistModel.countDocuments();
  }
}
