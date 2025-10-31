import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  ingredients: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}