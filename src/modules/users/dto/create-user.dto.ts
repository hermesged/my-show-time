import { IsEmail, IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9 _-]+$/, {
    message: 'The name contains unauthorized characters',
  })
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

   @IsOptional()
  isVerified?: boolean;
}
