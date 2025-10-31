import { IsOptional, IsString } from 'class-validator';

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}