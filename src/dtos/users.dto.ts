import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  public username: string;

  @IsString()
  public password: string;
}

export class CreateUserDto {
  @IsString()
  public username: string;

  @IsString()
  public password: string;

  @IsString()
  public role: string;
}


