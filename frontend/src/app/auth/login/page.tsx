import Link from 'next/link';
import LoginForm from '@/app/auth/LoginForm';
import Navbar from '@/components/ui/Navbar';

export default function LoginPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 bg-gray-50 flex items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Вітаємо знову!</h1>
            <p className="mt-2 text-gray-600">Увійди в свій акаунт</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-gray-600">
            Ще немає акаунту?{" "}
            <Link href="/auth/register" className="font-medium text-gray-900 hover:underline">
              Зареєструватися
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}