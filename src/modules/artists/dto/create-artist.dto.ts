import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

export class CreateArtistDto {
@IsString()
name: string;

@IsOptional()
@IsString()
genre?: string;

@IsOptional()
@IsString()
description?: string;

@IsOptional()
@IsString()
image?: string;
}
