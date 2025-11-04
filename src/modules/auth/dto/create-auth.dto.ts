import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
export class CreateAuthDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9 _-]+$/, {
    message: 'The name contains unauthorized characters',
  })
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
