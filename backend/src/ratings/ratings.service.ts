import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async rateRecipe(userId: number, recipeId: number, score: number) {
    // Перевірка чи рецепт існує
    const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    // Створити або оновити рейтинг
    const rating = await this.prisma.rating.upsert({
      where: {
        userId_recipeId: { userId, recipeId },
      },
      update: { score },
      create: { userId, recipeId, score },
    });

    return rating;
  }

  async getRecipeRatings(recipeId: number) {
    const ratings = await this.prisma.rating.findMany({
      where: { recipeId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;

    return {
      ratings,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length,
    };
  }
}