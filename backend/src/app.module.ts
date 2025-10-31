import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';
import { RatingsModule } from './ratings/ratings.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, RecipesModule, RatingsModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
