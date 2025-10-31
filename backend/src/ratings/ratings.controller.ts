import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':recipeId')
  rateRecipe(
    @Param('recipeId') recipeId: string,
    @Body('score') score: number,
    @Request() req,
  ) {
    return this.ratingsService.rateRecipe(req.user.sub, +recipeId, score);
  }

  @Get('recipe/:recipeId')
  getRecipeRatings(@Param('recipeId') recipeId: string) {
    return this.ratingsService.getRecipeRatings(+recipeId);
  }
}