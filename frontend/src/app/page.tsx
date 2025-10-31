'use client';

import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import RecipeCard from '@/components/ui/RecipeCard';
import api from '@/lib/api';
import type { Recipe } from '@/types/recipe';
import { getAverageRating } from '@/types/recipe';

export default function HomePage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]); 
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'ingredients'>('title');
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    'Борщ з пампушками...',
    'Вареники з вишнями...',
    'Салат Цезар...',
    'Паста Карбонара...',
    'Млинці з м\'ясом...',
    'Шарлотка з яблуками...',
  ];

  const videos = [
    '/4686844-uhd_4096_2160_25fps.mp4',
    '/5738512-hd_1920_1080_30fps.mp4',
    '/6288300-hd_1920_1080_25fps.mp4',
    '/12678033-hd_1920_1080_24fps.mp4',
  ];

  const video0Ref = React.useRef<HTMLVideoElement>(null);
  const video1Ref = React.useRef<HTMLVideoElement>(null);
  const video2Ref = React.useRef<HTMLVideoElement>(null);
  const video3Ref = React.useRef<HTMLVideoElement>(null);
  const videoRefs = [video0Ref, video1Ref, video2Ref, video3Ref];

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/recipes');
        setRecipes(data);
      } catch (error) {
        console.error('Помилка завантаження рецептів:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Auto-switch videos every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => {
        const nextIndex = (prev + 1) % videos.length;
        if (videoRefs[nextIndex].current) {
          videoRefs[nextIndex].current.currentTime = 0;
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [videos.length]);

  useEffect(() => {
    const currentPlaceholder = placeholders[placeholderIndex];
    let charIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (charIndex <= currentPlaceholder.length) {
        setPlaceholderText(currentPlaceholder.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [placeholderIndex]);

  const trendingRecipes = useMemo(() => {
    return [...recipes]
      .sort((a, b) => getAverageRating(b.ratings) - getAverageRating(a.ratings))
      .slice(0, 6);
  }, [recipes]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) {
      router.push('/recipes');
      return;
    }
    router.push(`/recipes?search=${encodeURIComponent(query)}&type=${searchType}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden border-b border-gray-100">
          <div className="absolute inset-0 w-full h-full bg-gray-900">
            {videos.map((videoSrc, index) => (
              <video
                key={videoSrc}
                ref={videoRefs[index]}
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 z-20"></div>
          </div>

          <div className="relative z-30 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight drop-shadow-2xl">
                Знайди свій<br />улюблений рецепт
              </h1>
              <p className="mt-6 text-lg text-white drop-shadow-lg">
                Тисячі рецептів від спільноти. Прості інструкції. Смачні результати.
              </p>

              <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setSearchType('title')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        searchType === 'title'
                          ? 'bg-white text-gray-900'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      По назві
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType('ingredients')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        searchType === 'ingredients'
                          ? 'bg-white text-gray-900'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      По інгредієнтах
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={
                        searchType === 'title' 
                          ? placeholderText 
                          : 'Введіть інгредієнт (наприклад: картопля, морква...)'
                      }
                      className="flex-1 px-6 py-4 rounded-xl bg-white border-0 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                    >
                      Шукати
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">{recipes.length}</div>
                  <div className="text-xs sm:text-sm text-white/70 mt-2 uppercase tracking-wider">Рецептів</div>
                </div>
                <div className="text-center border-l border-r border-white/30">
                  <div className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                    {recipes.reduce((sum, r) => sum + r.ratings.length, 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-white/70 mt-2 uppercase tracking-wider">Відгуків</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                    {new Set(recipes.map(r => r.author?.id)).size}
                  </div>
                  <div className="text-xs sm:text-sm text-white/70 mt-2 uppercase tracking-wider">Кухарів</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Популярні рецепти</h2>
                <p className="mt-2 text-gray-600">Найвищі оцінки від спільноти</p>
              </div>
              <Link href="/recipes" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors hidden sm:block">
                Всі рецепти →
              </Link>
            </div>

            {isLoading ? (
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="h-64 animate-pulse rounded-2xl bg-gray-200" />
                ))}
              </div>
            ) : trendingRecipes.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                <div className="text-5xl mb-4">🍽️</div>
                <p className="text-gray-600">Поки що немає рецептів</p>
                <Link
                  href="/recipes/create"
                  className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Додати перший рецепт
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {trendingRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 border-t border-gray-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="bg-gray-900 rounded-2xl px-8 py-16 text-center text-white">
              <h2 className="text-3xl font-bold">Готовий поділитися своїм рецептом?</h2>
              <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
                Створи акаунт та додай свої улюблені рецепти. Отримуй відгуки та знаходь нових друзів серед любителів кулінарії.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  Почати безкоштовно
                </Link>
                <Link
                  href="/recipes"
                  className="px-8 py-4 border border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Переглянути рецепти
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
