'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Link from 'next/link';

interface Recipe {
  id: number;
  title: string;
  ingredients: string;
  instructions: string;
  imageUrl: string;
  ratings: Array<{ score: number }>;
  photos: Array<{ id: number; url: string }>;
}

export default function MyRecipesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!authLoading && !user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.replace('/auth/login');
      return;
    }
    if (user) {
      fetchMyRecipes();
    }
  }, [user, authLoading, router]);

  const fetchMyRecipes = async () => {
    try {
      const { data } = await api.get('/recipes/my');
      setRecipes(data);
    } catch (error) {
      console.error('Помилка завантаження рецептів:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/recipes/${id}`);
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Помилка видалення:', error);
      alert('Не вдалося видалити рецепт');
    }
  };

  // Pagination
  const totalPages = Math.ceil(recipes.length / itemsPerPage);
  const paginatedRecipes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return recipes.slice(startIndex, startIndex + itemsPerPage);
  }, [recipes, currentPage, itemsPerPage]);

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Завантаження...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Мої рецепти</h1>
            <p className="mt-2 text-gray-600">Керуй своїми рецептами</p>
          </div>

          {recipes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Поки що немає рецептів</h2>
              <p className="text-gray-600 mb-6">Створи свій перший рецепт і поділись ним зі спільнотою</p>
              <Link
                href="/recipes/create"
                className="inline-block px-8 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Створити рецепт
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {paginatedRecipes.map((recipe) => {
                  const avgRating = recipe.ratings.length > 0
                    ? (recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length).toFixed(1)
                    : '0.0';
                  
                  // Перевірка URL фото
                  const imageUrl = recipe.imageUrl.startsWith('http') 
                    ? recipe.imageUrl 
                    : `http://localhost:4000${recipe.imageUrl}`;
                  
                  return (
                    <div 
                      key={recipe.id} 
                      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <Link href={`/recipes/${recipe.id}`} className="block">
                        <div className="aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center shadow-lg"
                        title="Видалити рецепт"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <Link href={`/recipes/${recipe.id}`} className="block p-3">
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="font-semibold text-gray-900 text-sm">{avgRating}</span>
                          <span className="text-gray-500 text-xs">({recipe.ratings.length})</span>
                        </div>
                        
                        <h2 className="font-bold text-gray-900 line-clamp-1 mb-1">{recipe.title}</h2>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {recipe.ingredients.split('\n').slice(0, 3).join(' • ')}
                        </p>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Попередня
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Наступна →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}