import {
  IsOptional,
  IsEmail,
  MinLength,
  Matches,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9 _-]+$/, {
    message: 'The name contains unauthorized characters',
  })
  name?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  current_password?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'The new password must be at least 8 characters long' })
  new_password?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'The confirmation password must be at least 8 characters long' })
  confirm_password?: string;

  @IsOptional()
  @MinLength(8)
  password?: string;
}
