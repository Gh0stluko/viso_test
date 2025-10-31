'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';

interface Recipe {
  id: number;
  title: string;
  ingredients: string;
  instructions: string;
  imageUrl: string;
  photos?: Array<{
    id: number;
    url: string;
    createdAt: string;
  }>;
  author: {
    id: number;
    name: string;
    email: string;
  };
  ratings: Array<{
    id: number;
    score: number;
    user: {
      id: number;
      name: string;
    };
  }>;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [params.id]);

  const fetchRecipe = async () => {
    try {
      const { data } = await api.get(`/recipes/${params.id}`);
      setRecipe(data);
      
      if (user) {
        const myRating = data.ratings.find((r: any) => r.user.id === user.id);
        if (myRating) setRating(myRating.score);
      }
    } catch (error) {
      console.error('Помилка завантаження рецепту:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (score: number) => {
    if (!user) {
      alert('Увійдіть щоб оцінити рецепт');
      return;
    }

    setIsSubmittingRating(true);
    try {
      await api.post(`/ratings/${params.id}`, { score });
      setRating(score);
      await fetchRecipe();
    } catch (error) {
      console.error('Помилка оцінювання:', error);
      alert('Не вдалося оцінити рецепт');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getAverageRating = () => {
    if (!recipe || recipe.ratings.length === 0) return 0;
    const sum = recipe.ratings.reduce((acc, r) => acc + r.score, 0);
    return (sum / recipe.ratings.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Завантаження...</div>
        </div>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-xl text-gray-900 font-bold">Рецепт не знайдено</p>
          </div>
        </div>
      </>
    );
  }

  const ingredientsList = recipe.ingredients.split(/[,\n]/).map(i => i.trim()).filter(Boolean);
  const instructionsList = recipe.instructions.split(/\n/).map(i => i.trim()).filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img 
                src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `http://localhost:4000${recipe.imageUrl}`}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>

            {recipe.photos && recipe.photos.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Додаткові фото</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recipe.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={photo.url.startsWith('http') ? photo.url : `http://localhost:4000${photo.url}`}
                        alt={`${recipe.title} - додаткове фото`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>від <span className="font-medium text-gray-900">{recipe.author.name}</span></span>
              </div>
            </div>

            {/* Rating Section */}
            <div className="p-8 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl text-yellow-500">★</div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{getAverageRating()}</div>
                    <div className="text-sm text-gray-600">{recipe.ratings.length} оцінок</div>
                  </div>
                </div>
                
                {user && (
                  <div className="w-full sm:w-auto">
                    <p className="text-sm text-gray-700 font-medium mb-3">Твоя оцінка:</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(star)}
                          disabled={isSubmittingRating}
                          className={`text-3xl transition-all ${
                            star <= rating ? 'text-yellow-500 scale-110' : 'text-gray-300 hover:text-yellow-400'
                          } disabled:opacity-50`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Інгредієнти</h2>
              <ul className="space-y-3">
                {ingredientsList.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Приготування</h2>
              <ol className="space-y-4">
                {instructionsList.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 pt-1">{instruction.replace(/^\d+\.\s*/, '')}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}