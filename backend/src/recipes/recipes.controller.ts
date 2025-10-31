import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private recipesService: RecipesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file' , {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `recipe-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return {
      url: `${baseUrl}/uploads/${file.filename}`,
    };
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.recipesService.findAll(search);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Request() req) {
    return this.recipesService.findUserRecipes(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(req.user.sub, createRecipeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(+id, req.user.sub, updateRecipeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.recipesService.remove(+id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/photos')
  addPhoto(@Param('id') id: string, @Request() req, @Body() body: { url: string }) {
    return this.recipesService.addPhoto(+id, req.user.sub, body.url);
  }
}