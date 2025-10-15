import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEmail,
  IsIn,
  IsString,
  MinLength,
} from 'class-validator';

export class AddTeamMemberDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsString()
  @IsIn(['USER', 'ADMIN'])
  role: string;

  @IsDefined()
  @IsString()
  @MinLength(8)
  password: string;

  @IsDefined()
  @IsString()
  @MinLength(8)
  passwordConfirm: string;

  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  integrations: string[];
}
