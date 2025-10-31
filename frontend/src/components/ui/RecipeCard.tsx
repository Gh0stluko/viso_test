'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Recipe } from '@/types/recipe';
import { getAverageRating } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'default' | 'highlight';
  onClick?: () => void;
}

export default function RecipeCard({ recipe, variant = 'default', onClick }: RecipeCardProps) {
  const rating = getAverageRating(recipe.ratings);
  const formattedRating = rating.toFixed(1);
  const ratingCount = recipe.ratings?.length ?? 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const allImages = useMemo(() => {
    const images = [recipe.imageUrl];
    if (recipe.photos && recipe.photos.length > 0) {
      images.push(...recipe.photos.map(p => p.url));
    }
    // Перетворюємо відносні URL в повні
    return images.map(url => 
      url.startsWith('http') ? url : `http://localhost:4000${url}`
    );
  }, [recipe.imageUrl, recipe.photos]);

  const ingredients = useMemo(() => {
    return recipe.ingredients
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [recipe.ingredients]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const openLightbox = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLightboxOpen(true);
  };

  return (
    <>
      <Link 
        href={`/recipes/${recipe.id}`} 
        onClick={onClick} 
        className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img 
            src={allImages[currentImageIndex]}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {allImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <button
            onClick={openLightbox}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-xs">★</span>
              <span className="font-semibold text-gray-900 text-xs">{formattedRating}</span>
              <span className="text-gray-500 text-xs">({ratingCount})</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[100px]">
              {recipe.author?.name ?? 'Автор'}
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-gray-700 transition-colors line-clamp-1">
            {recipe.title}
          </h3>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {ingredients.map((ingredient, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[80px]"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center text-xs font-medium text-gray-900 group-hover:text-gray-700">
            Переглянути
            <svg className="w-3 h-3 ml-0.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>

      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
          
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            <img 
              src={allImages[currentImageIndex]}
              alt={recipe.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                  }}
                  className="absolute left-4 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
                  }}
                  className="absolute right-4 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-colors"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

