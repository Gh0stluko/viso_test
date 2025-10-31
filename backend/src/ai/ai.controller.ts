import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-recipe')
  async generateRecipe(@Body() body: { prompt: string }) {
    return this.aiService.generateRecipe(body.prompt);
  }
}
