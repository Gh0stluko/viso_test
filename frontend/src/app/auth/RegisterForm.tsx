'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Ім\'я обов\'язкове'),
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль має бути мінімум 6 символів'),
});

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    const result = registerSchema.safeParse({ name, email, password });
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
      await register(email, password, name);
      router.push('/');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Помилка реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Ім'я
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Ваше ім'я"
        />
        {errors.name && <p className="text-red-600 text-sm mt-2">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-red-600 text-sm mt-2">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-600 text-sm mt-2">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Завантаження...' : 'Зареєструватися'}
      </button>
    </form>
  );
}