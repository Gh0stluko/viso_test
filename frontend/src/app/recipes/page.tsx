'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import RecipeCard from '@/components/ui/RecipeCard';
import api from '@/lib/api';
import type { Recipe } from '@/types/recipe';
import { getAverageRating } from '@/types/recipe';

type SortOption = 'popular' | 'newest' | 'alphabet';

function RecipesContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
	const [searchType, setSearchType] = useState<'title' | 'ingredients'>('title');
	const [sortBy, setSortBy] = useState<SortOption>('popular');
	const [minRating, setMinRating] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

	const fetchRecipes = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const { data } = await api.get('/recipes');
			setRecipes(data);
		} catch (requestError) {
			console.error('Помилка завантаження рецептів:', requestError);
			setError('Не вдалося завантажити рецепти. Спробуй повторити пізніше.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const initialSearch = searchParams.get('search') ?? '';
	const initialType = (searchParams.get('type') as 'title' | 'ingredients') ?? 'title';

	useEffect(() => {
		setSearchQuery(initialSearch);
		setDebouncedSearchQuery(initialSearch);
		setSearchType(initialType);
		fetchRecipes();
	}, [initialSearch, initialType, fetchRecipes]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
			setCurrentPage(1);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = searchQuery.trim();
		if (trimmed) {
			router.replace(`/recipes?search=${encodeURIComponent(trimmed)}&type=${searchType}`, { scroll: false });
		} else {
			router.replace('/recipes', { scroll: false });
		}
	};

	const filteredRecipes = useMemo(() => {
		let filtered = recipes;
		
		if (debouncedSearchQuery.trim()) {
			const query = debouncedSearchQuery.toLowerCase();
			filtered = recipes.filter((recipe) => {
				if (searchType === 'ingredients') {
					return recipe.ingredients.toLowerCase().includes(query);
				}
				return recipe.title.toLowerCase().includes(query);
			});
		}
		
		const byRating = filtered.filter((recipe) => getAverageRating(recipe.ratings) >= minRating);

		const sorted = [...byRating];
		switch (sortBy) {
			case 'newest':
				sorted.sort((a, b) => b.id - a.id);
				break;
			case 'alphabet':
				sorted.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
				break;
			default:
				sorted.sort((a, b) => getAverageRating(b.ratings) - getAverageRating(a.ratings));
		}
		return sorted;
	}, [recipes, minRating, sortBy, debouncedSearchQuery, searchType]);

	const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
	const paginatedRecipes = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredRecipes.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredRecipes, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [sortBy, minRating]);

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-gray-50">
				<section className="bg-white border-b border-gray-200">
					<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
						<div className="max-w-2xl">
							<h1 className="text-4xl font-bold text-gray-900">Всі рецепти</h1>
							<p className="mt-3 text-gray-600">
								Знайди ідеальний рецепт для будь-якого настрою
							</p>
						</div>

						<form onSubmit={handleSearchSubmit} className="mt-8">
							<div className="flex flex-col gap-3">
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => setSearchType('title')}
										className={`px-4 py-2 rounded-lg font-medium transition-all ${
											searchType === 'title'
												? 'bg-gray-900 text-white'
												: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
										}`}
									>
										По назві
									</button>
									<button
										type="button"
										onClick={() => setSearchType('ingredients')}
										className={`px-4 py-2 rounded-lg font-medium transition-all ${
											searchType === 'ingredients'
												? 'bg-gray-900 text-white'
												: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
										}`}
									>
										По інгредієнтах
									</button>
								</div>
								
								<div className="flex gap-3">
									<input
										type="search"
										value={searchQuery}
										onChange={(event) => setSearchQuery(event.target.value)}
										placeholder={
											searchType === 'title'
												? 'Назва рецепту...'
												: 'Інгредієнт (картопля, морква...)'
										}
										className="flex-1 px-6 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
									/>
									<button
										type="submit"
										className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
									>
										Шукати
									</button>
								</div>
							</div>
						</form>
					</div>
				</section>

				<section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
					<div className="flex flex-col lg:flex-row gap-8">
						<aside className="lg:w-64 flex-shrink-0">
							<div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20">
								<h3 className="font-bold text-gray-900 mb-4">Фільтри</h3>
								
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-3">Сортування</label>
									<div className="space-y-2">
										{[
											{ value: 'popular' as SortOption, label: 'За популярністю' },
											{ value: 'newest' as SortOption, label: 'Найновіші' },
											{ value: 'alphabet' as SortOption, label: 'За алфавітом' },
										].map((option) => (
											<label key={option.value} className="flex items-center gap-2 cursor-pointer">
												<input
													type="radio"
													name="sort"
													value={option.value}
													checked={sortBy === option.value}
													onChange={() => setSortBy(option.value)}
													className="w-4 h-4 text-gray-900 focus:ring-gray-900"
												/>
												<span className="text-sm text-gray-700">{option.label}</span>
											</label>
										))}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-3">Мінімальна оцінка</label>
									<div className="space-y-2">
										{[
											{ value: 0, label: 'Будь-яка' },
											{ value: 3, label: '3+ зірки' },
											{ value: 4, label: '4+ зірки' },
											{ value: 4.5, label: '4.5+ зірки' },
										].map((filter) => (
											<button
												key={filter.value}
												type="button"
												onClick={() => setMinRating(filter.value)}
												className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
													minRating === filter.value
														? 'bg-gray-900 text-white'
														: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
												}`}
											>
												{filter.label}
											</button>
										))}
									</div>
								</div>

								<div className="mt-6 pt-6 border-t border-gray-200">
									<div className="text-center">
										<div className="text-2xl font-bold text-gray-900">{filteredRecipes.length}</div>
										<div className="text-sm text-gray-600">Знайдено</div>
									</div>
								</div>
							</div>
						</aside>

						<div className="flex-1">
							{error && (
								<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
									{error}
								</div>
							)}

							{isLoading ? (
								<div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
									{Array.from({ length: 6 }).map((_, index) => (
										<div key={`skeleton-${index}`} className="h-64 animate-pulse rounded-2xl bg-gray-200" />
									))}
								</div>
							) : filteredRecipes.length === 0 ? (
								<div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
									<div className="text-5xl mb-4">🔍</div>
									<p className="text-lg font-semibold text-gray-900 mb-2">Нічого не знайдено</p>
									<p className="text-gray-600">Спробуй змінити фільтри або пошуковий запит</p>
								</div>
							) : (
								<>
									<div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
										{paginatedRecipes.map((recipe) => (
											<RecipeCard key={recipe.id} recipe={recipe} />
										))}
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
												{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
													if (
														page === 1 ||
														page === totalPages ||
														(page >= currentPage - 1 && page <= currentPage + 1)
													) {
														return (
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
														);
													} else if (
														page === currentPage - 2 ||
														page === currentPage + 2
													) {
														return <span key={page} className="px-2">...</span>;
													}
													return null;
												})}
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
					</div>
				</section>
			</main>
		</>
	);
}

export default function RecipesPage() {
	return (
		<Suspense fallback={
			<>
				<Navbar />
				<main className="min-h-screen bg-gray-50">
					<section className="bg-white border-b border-gray-200">
						<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
							<div className="max-w-2xl">
								<h1 className="text-4xl font-bold text-gray-900">Всі рецепти</h1>
								<p className="mt-3 text-gray-600">Завантаження...</p>
							</div>
						</div>
					</section>
					<section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
						<div className="text-center py-16">
							<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
						</div>
					</section>
				</main>
			</>
		}>
			<RecipesContent />
		</Suspense>
	);
}
