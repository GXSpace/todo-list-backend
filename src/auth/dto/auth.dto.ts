import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class NewUserDto extends AuthDto {
  @IsNotEmpty()
  username: string;
}
