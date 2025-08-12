# Ришпашпа

Современное Telegram Web App, напоминающее о мини-тренировках в течение рабочего дня. Дизайн использует градиентный фон, стеклянные карточки и анимированного маскота.

## Структура проекта
```
/ public
  index.html       # точка входа
  styles.css       # современный стиль и анимации
  mascot.svg       # маскот приложения
/ src
  main.js          # точка запуска React
  App.js           # главный компонент
  config.js        # загрузка переменных окружения
  /components
    SetupForm.js        # форма настроек
    ExercisePlayer.js   # проигрывание упражнения
    ExerciseList.js     # последовательность упражнений
  /data
    exercises.js        # база упражнений
  /services
    storage.js          # работа с localStorage
    reminder.js         # планировщик напоминаний
    telegram.js         # обращение к Bot API
/ scripts
  inject-env.mjs   # генерация public/env.js из .env

.env.example       # пример файла переменных окружения
package.json
README.md
```

## Настройка окружения

1. Скопируйте файл `.env.example` в `.env` и впишите токен вашего Telegram‑бота.

2. Выполните `npm start`. Скрипт сгенерирует `public/env.js`, поднимет локальный сервер на `https://localhost:3000` (используется самоподписанный сертификат в `cert/`)
   и запустит бота.
3. В Telegram отправьте своему боту команду `/start` и нажмите кнопку **Открыть Ришпашпу**, чтобы протестировать мини‑приложение.
4. Для использования собственных сертификатов укажите переменные окружения `SSL_KEY_PATH` и `SSL_CERT_PATH`.
   Запуск по HTTP возможен с `USE_HTTPS=false`, однако Telegram требует HTTPS для открытия Web App.


## Примеры данных
Настройки пользователя:
```json
{
  "reminderFrequency": "every 60 minutes",
  "workSchedule": { "start": "09:00", "end": "18:00" }
}
```
Упражнение:
```json
{
  "id": "stretch_neck",
  "title": "Потяни шею",
  "duration": 45,
  "mediaUrl": "https://media.giphy.com/media/example.gif",
  "instructions": "Медленно наклоняйте голову влево и вправо."
}
```

## Persistence & State
```ts
interface NotificationEntry {
  time: number;        // timestamp
  status: 'sent' | 'handled' | 'skipped';
}

interface Progress {
  completed: { id: string; time: number }[];
  skipped: { id: string; time: number }[];
}

interface NotificationQueueItem {
  time: number;
  handled: boolean;
}
```
- **История уведомлений** хранится в массиве `NotificationEntry` под ключом `rp_history`.
- **Прогресс пользователя** хранится в объекте `Progress` под ключом `rp_progress`.
- **Очередь уведомлений**: массив `NotificationQueueItem` под ключом `rp_queue`.

## API-интерфейсы
| Метод | Путь | Описание |
|------|------|----------|
| `GET` | `/api/exercises` | получить список упражнений |
| `POST` | `/api/settings` | сохранить настройки пользователя |
| `POST` | `/api/workouts` | зафиксировать выполнение тренировки |

Ошибки возвращаются в формате:
```json
{ "error": "details" }
```

## Потоки пользовательских сценариев
1. **Старт** – пользователь открывает мини-приложение, загружаются сохранённые настройки.
2. **Настройка** – при необходимости изменяет частоту и рабочий диапазон.
3. **Получение уведомления** – в рабочее время ReminderService инициирует тренировку.
4. **Выполнение тренировки** – пользователь последовательно выполняет до трёх упражнений.
5. **Подтверждение завершения** – после последнего упражнения состояние сбрасывается и ожидание следующего напоминания.
