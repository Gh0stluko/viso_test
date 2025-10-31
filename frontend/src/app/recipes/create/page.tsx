'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { z } from 'zod';
import { useEffect } from 'react';

const recipeSchema = z.object({
  title: z.string().min(1, 'Назва обов\'язкова'),
  ingredients: z.array(z.string().min(1)).min(1, 'Додайте хоча б один інгредієнт'),
  instructions: z.array(z.string().min(1)).min(1, 'Додайте хоча б один крок'),
  imageUrl: z.string().min(1, 'Фото обов\'язкове'),
});

export default function CreateRecipePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [ingredientsList, setIngredientsList] = useState<string[]>(['']);
  const [instructionsList, setInstructionsList] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + additionalFiles.length > 3) {
      setErrors({ ...errors, additionalPhotos: 'Максимум 3 додаткові фото' });
      return;
    }
    
    setAdditionalFiles([...additionalFiles, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalFiles(additionalFiles.filter((_, i) => i !== index));
    setAdditionalPreviews(additionalPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    // Check if image is uploaded
    if (!imageFile) {
      setErrors({ imageUrl: 'Фото обов\'язкове' });
      return;
    }

    const result = recipeSchema.safeParse({ 
      title, 
      ingredients: ingredientsList.filter(i => i.trim()), 
      instructions: instructionsList.filter(i => i.trim()), 
      imageUrl: imageFile ? 'temp' : '' 
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const formatted = result.error.flatten().fieldErrors;
      Object.keys(formatted).forEach((key) => {
        const messages = formatted[key as keyof typeof formatted];
        if (messages && messages.length > 0) {
          fieldErrors[key] = messages[0];
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Upload main image
      const formData = new FormData();
      formData.append('file', imageFile);
      const uploadResponse = await api.post('/recipes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = uploadResponse.data.url;

      // Upload additional photos
      const additionalPhotos: string[] = [];
      for (const file of additionalFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/recipes/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        additionalPhotos.push(response.data.url);
      }

      const { data } = await api.post('/recipes', { 
        title, 
        ingredients: ingredientsList.filter(i => i.trim()).join('\n'), 
        instructions: instructionsList.filter(i => i.trim()).join('\n'),
        imageUrl,
      });
      
      // Upload additional photos after recipe creation
      if (additionalPhotos.length > 0) {
        for (const photoUrl of additionalPhotos) {
          await api.post(`/recipes/${data.id}/photos`, { url: photoUrl });
        }
      }
      
      router.push(`/recipes/${data.id}`);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Помилка створення рецепту');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-recipe', { prompt: aiPrompt });
      
      setTitle(data.title);
      setIngredientsList(data.ingredients.length > 0 ? data.ingredients : ['']);
      setInstructionsList(data.instructions.length > 0 ? data.instructions : ['']);
      setShowAiModal(false);
      setAiPrompt('');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Помилка генерації рецепту');
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
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
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Новий рецепт</h1>
            <p className="mt-2 text-gray-600">Поділися своїм кулінарним шедевром</p>
            
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Згенерувати рецепт
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {apiError}
              </div>
            )}

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Фото страви <span className="text-red-500">*</span>
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">Підтримуються JPG, PNG, GIF, WEBP (макс. 5MB)</p>
                  {errors.imageUrl && <p className="mt-2 text-sm text-red-600">{errors.imageUrl}</p>}
                </div>
                {imagePreview && (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="additionalPhotos" className="block text-sm font-medium text-gray-700 mb-2">
                Додаткові фото (до 3)
              </label>
              <input
                id="additionalPhotos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalPhotosChange}
                disabled={additionalFiles.length >= 3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm disabled:opacity-50"
              />
              {errors.additionalPhotos && <p className="mt-2 text-sm text-red-600">{errors.additionalPhotos}</p>}
              {additionalPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {additionalPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={preview} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalPhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Назва рецепту
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Наприклад: Домашній борщ"
              />
              {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Інгредієнти
              </label>
              <div className="space-y-3">
                {ingredientsList.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => {
                        const newList = [...ingredientsList];
                        newList[index] = e.target.value;
                        setIngredientsList(newList);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Наприклад: Буряк - 2 шт"
                    />
                    {ingredientsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newList = ingredientsList.filter((_, i) => i !== index);
                          setIngredientsList(newList);
                        }}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setIngredientsList([...ingredientsList, ''])}
                  className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  + Додати інгредієнт
                </button>
              </div>
              {errors.ingredients && <p className="mt-2 text-sm text-red-600">{errors.ingredients}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Інструкції приготування
              </label>
              <div className="space-y-3">
                {instructionsList.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-12 flex items-center justify-center text-gray-500 font-medium">
                      {index + 1}.
                    </div>
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => {
                        const newList = [...instructionsList];
                        newList[index] = e.target.value;
                        setInstructionsList(newList);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Опишіть крок приготування"
                    />
                    {instructionsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newList = instructionsList.filter((_, i) => i !== index);
                          setInstructionsList(newList);
                        }}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setInstructionsList([...instructionsList, ''])}
                  className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  + Додати крок
                </button>
              </div>
              {errors.instructions && <p className="mt-2 text-sm text-red-600">{errors.instructions}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Створення...' : 'Опублікувати рецепт'}
            </button>
          </form>
        </div>
      </main>

      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAiModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Генератор рецептів</h2>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Опиши що хочеш приготувати і отримай готовий рецепт!
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Наприклад: Хочу щось солодке з шоколадом та горіхами..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              rows={4}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAiModal(false)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? 'Генерую...' : 'Згенерувати'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}