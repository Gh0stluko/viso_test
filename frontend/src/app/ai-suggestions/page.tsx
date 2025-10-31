'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import api from '@/lib/api';

export default function AiSuggestionsPage() {
	const router = useRouter();
	const [prompt, setPrompt] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!prompt.trim()) return;

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const { data } = await api.post('/ai/generate-recipe', { prompt: prompt.trim() });
			setResult(data.recipe || data.message || JSON.stringify(data));
		} catch (requestError: unknown) {
			console.error('Помилка генерації рецепту:', requestError);
			setError('Не вдалося згенерувати рецепт. Спробуй повторити пізніше.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-gray-50">
				<section className="bg-white border-b border-gray-200">
					<div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-900">🤖 AI підказки</h1>
							<p className="mt-3 text-gray-600">
								Опиши що ти хочеш приготувати, і AI допоможе створити рецепт
							</p>
						</div>

						<form onSubmit={handleSubmit} className="mt-8">
							<div className="flex flex-col gap-4">
								<textarea
									value={prompt}
									onChange={(event) => setPrompt(event.target.value)}
									placeholder="Наприклад: Швидкий сніданок з яєць та овочів..."
									className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
									rows={4}
									disabled={isLoading}
								/>
								
								<button
									type="submit"
									disabled={isLoading || !prompt.trim()}
									className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? 'Генерую...' : 'Створити рецепт'}
								</button>
							</div>
						</form>
					</div>
				</section>

				<section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
							{error}
						</div>
					)}

					{isLoading && (
						<div className="text-center py-16">
							<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
							<p className="mt-4 text-gray-600">Генерую рецепт...</p>
						</div>
					)}

					{result && !isLoading && (
						<div className="bg-white rounded-2xl border border-gray-200 p-8">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Згенерований рецепт</h2>
							<div className="prose prose-gray max-w-none">
								<pre className="whitespace-pre-wrap text-gray-700 font-sans">{result}</pre>
							</div>
						</div>
					)}

					{!result && !isLoading && !error && (
						<div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
							<div className="text-5xl mb-4">✨</div>
							<p className="text-lg font-semibold text-gray-900 mb-2">Готовий до творчості?</p>
							<p className="text-gray-600">Введи свою ідею вгорі, і AI створить для тебе рецепт</p>
						</div>
					)}
				</section>
			</main>
		</>
	);
}
