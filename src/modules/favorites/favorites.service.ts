import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<Favorite>,
  ) {}

  // Ajouter un favori
  async addFavorite(dto: CreateFavoriteDto): Promise<Favorite> {
    // Vérifie si le favori existe déjà
    const existing = await this.favoriteModel.findOne({
      user_id: dto.user_id,
      artist_id: new Types.ObjectId(dto.artist_id), // Convertit en ObjectId
    });

    if (existing) {
      throw new Error('Artist already in favorites');
    }

    const favorite = new this.favoriteModel({
      user_id: dto.user_id,
      artist_id: new Types.ObjectId(dto.artist_id), // Convertit en ObjectId
    });

    return favorite.save();
  }

  // Récupérer les favoris d'un utilisateur
  async findByUser(userId: string): Promise<Favorite[]> {
    return this.favoriteModel
      .find({ user_id: userId })
      .populate('artist_id') // Popule les infos de l'artiste
      .exec();
  }

  // Supprimer un favori
  async removeFavorite(userId: string, artistId: string): Promise<{ deleted: boolean }> {
    const result = await this.favoriteModel.findOneAndDelete({
      user_id: userId,
      artist_id: new Types.ObjectId(artistId), // Convertit en ObjectId
    });

    if (!result) throw new NotFoundException('Favorite not found');
    return { deleted: true };
  }
}
