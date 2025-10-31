import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async generateRecipe(prompt: string): Promise<{ title: string; ingredients: string[]; instructions: string[] }> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Ти професійний кулінарний асистент. Генеруй детальні рецепти українською мовою у форматі JSON. Інгредієнтів має бути достатньо для страви (8-12 позицій) з точною кількістю. Інструкції мають бути детальними та зрозумілими, кількість кроків залежить від складності страви - для простих страв 5-7 кроків, для складних 10-15 кроків. Формат: {"title": "назва страви", "ingredients": ["інгредієнт 1 - кількість", "інгредієнт 2 - кількість"], "instructions": ["Крок 1: детальний опис", "Крок 2: детальний опис"]}. Відповідай ТІЛЬКИ JSON без додаткового тексту.',
            },
            {
              role: 'user',
              content: `Створи детальний рецепт на основі: ${prompt}. 

ОБОВ'ЯЗКОВІ ВИМОГИ:
- title: смачна та приваблива назва страви українською
- ingredients: достатня кількість інгредієнтів з точними пропорціями (наприклад: "Борошно пшеничне - 500г", "Яйця курячі - 3 шт")
- instructions: детальні кроки приготування з часом та температурою де потрібно. Кількість кроків залежить від складності страви - прості страви мають 5-8 кроків, складні 10-15 кроків. Кожен крок має бути зрозумілим та інформативним (наприклад: "Розігрійте духовку до 180°C, змастіть форму олією")

Поверни JSON з цими полями.`,
            },
          ],
          temperature: 0.9,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const cleanedJson = jsonMatch[0]
        .replace(/[\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ');

      const recipe = JSON.parse(cleanedJson);

      return {
        title: recipe.title || 'Згенерований рецепт',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      };
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error('Не вдалося згенерувати рецепт');
    }
  }
}
