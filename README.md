# FlavorAI - Платформа для рецептів

Fullstack веб-застосунок для пошуку, створення та управління рецептами зі штучним інтелектом.

## Функціонал

### Обов'язкові вимоги
- Реєстрація та авторизація користувачів (JWT)
- CRUD операції для рецептів
- Пошук рецептів за назвою або інгредієнтами
- Оцінювання рецептів (1-5 зірок)
- Перегляд власних рецептів
- Адаптивний дизайн

### Додаткові можливості
- AI генерація рецептів через Groq API
- Завантаження зображень (головне фото + до 3 додаткових)
- Розширений пошук з фільтрацією та сортуванням
- Пагінація результатів
- Відео фон на головній сторінці

## Технології

### Frontend
- **Фреймворк**: Next.js 16 (App Router)
- **Мова**: TypeScript
- **Стилі**: Tailwind CSS 4
- **State**: React Hooks + Context API
- **HTTP**: Axios
- **Валідація**: Zod

### Backend
- **Фреймворк**: NestJS 11
- **Мова**: TypeScript
- **База даних**: PostgreSQL
- **ORM**: Prisma
- **Автентифікація**: JWT
- **Файли**: Multer
- **Валідація**: class-validator

### Інфраструктура
- **Контейнеризація**: Docker + Docker Compose
- **Розробка**: Volume mapping для hot reload

## Запуск проєкту

### Вимоги
- Docker
- Docker Compose
- Git

### Крок 1: Клонування репозиторію
```bash
git clone https://github.com/Gh0stluko/viso_test.git
cd viso_test
```

### Крок 2: Налаштування змінних середовища
```bash
cp .env.example .env
```

Відредагувати `.env` та додати свій Groq API ключ:
```env
GROQ_API_KEY=API_KEY
```

Інші змінні можна залишити за замовчуванням.

### Крок 3: Запуск через Docker
```bash
docker compose up --build
```

Додаток буде доступний за адресами:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- PostgreSQL: localhost:5432

## API Endpoints

<details>
<summary>Переглянути API документацію</summary>

### Авторизація
- `POST /auth/register` - Реєстрація
- `POST /auth/login` - Вхід

### Рецепти
- `GET /recipes` - Всі рецепти (публічно)
- `GET /recipes/my` - Мої рецепти (auth)
- `GET /recipes/:id` - Один рецепт (публічно)
- `POST /recipes` - Створити рецепт (auth)
- `PATCH /recipes/:id` - Оновити рецепт (auth)
- `DELETE /recipes/:id` - Видалити рецепт (auth)
- `POST /recipes/upload` - Завантажити фото (auth)
- `POST /recipes/:id/photos` - Додати фото (auth)

### Рейтинги
- `POST /ratings` - Оцінити рецепт (auth)
- `GET /ratings/recipe/:id` - Отримати рейтинги (публічно)

### AI
- `POST /ai/generate-recipe` - Згенерувати рецепт (auth)

</details>

## Технічна сторона

### 1. **Monorepo структура**
Frontend та backend в одному репозиторії з Docker Compose для зручної розробки.

### 2. **Prisma ORM**
Вибрав Prisma для type-safe запитів до БД та легкого управління міграціями.

### 3. **JWT авторизація**
JWT з localStorage для збереження токену та автоматичною валідацією.

### 4. **Завантаження файлів**
Multer для обробки файлів з локальним зберіганням та статичною роздачею через NestJS.

### 5. **AI інтеграція**
Groq для швидкої генерації рецептів зі структурованим JSON виводом.

### 6. **Відео фон**
Crossfade ефект на головній сторінці з 4 відео про готування.

## Змінні середовища

Створити `.env` в корені проєкту:

```env
# База даних
POSTGRES_USER=flavorai
POSTGRES_PASSWORD=flavorai123
POSTGRES_DB=flavorai
DATABASE_URL=postgresql://flavorai:flavorai123@db:5432/flavorai

# Backend
JWT_SECRET=SECRET_KEY
PORT=4000
BACKEND_URL=http://localhost:4000

# AI (опційно)
GROQ_API_KEY=API_KEY

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

- **Час розробки**: ~8 годин
- **AI асистенти**: Код написаний вручну трішки з AI, адже для мене тема Node нова, та я буквально ще вчусь в ній.
- **Mobile Friendly**: Повністю адаптивний дизайн
- **Зберігання фото**: Локально в `backend/uploads/`
- **База даних**: PostgreSQL з Prisma міграціями
