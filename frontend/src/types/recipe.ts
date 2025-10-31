export interface RecipeAuthor {
  id: number;
  name: string;
}

export interface RecipeRating {
  score: number;
}

export interface RecipePhoto {
  id: number;
  url: string;
  createdAt: string;
}

export interface Recipe {
  id: number;
  title: string;
  ingredients: string;
  instructions: string;
  imageUrl: string;
  photos?: RecipePhoto[];
  author: RecipeAuthor;
  ratings: RecipeRating[];
}

export const getAverageRating = (ratings: RecipeRating[]) => {
  if (!ratings || ratings.length === 0) {
    return 0;
  }
  const total = ratings.reduce((sum, rating) => sum + rating.score, 0);
  return Number((total / ratings.length).toFixed(1));
};
