import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  // Отримати всі рецепти
  async findAll(search?: string) {
    return this.prisma.recipe.findMany({
      where: search ? {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      } : {},
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        ratings: true,
        photos: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Отримати рецепти конкретного користувача
  async findUserRecipes(userId: number) {
    return this.prisma.recipe.findMany({
      where: { authorId: userId },
      include: {
        ratings: true,
        photos: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Отримати один рецепт
  async findOne(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
        photos: true,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  // Створити рецепт
  async create(userId: number, data: { title: string; ingredients: string; instructions: string; imageUrl: string }) {
    return this.prisma.recipe.create({
      data: {
        ...data,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        photos: true,
      },
    });
  }

  // Оновити рецепт
  async update(id: number, userId: number, data: { title?: string; ingredients?: string; instructions?: string }) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own recipes');
    }

    return this.prisma.recipe.update({
      where: { id },
      data,
    });
  }

  // Видалити рецепт
  async remove(id: number, userId: number) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own recipes');
    }

    await this.prisma.recipe.delete({ where: { id } });
    return { message: 'Recipe deleted successfully' };
  }

  // Додати фото до рецепту
  async addPhoto(recipeId: number, userId: number, url: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('You can only add photos to your own recipes');
    }

    return this.prisma.photo.create({
      data: {
        url,
        recipeId,
      },
    });
  }
}