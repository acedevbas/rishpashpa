# Квадратное дыхание

Современное React-приложение для практики квадратного дыхания 4-4-4-4. Интерфейс построен с учётом Telegram Mini App и включает:

- плавную визуализацию движения точки по квадрату для каждого шага;
- автоматический таймер с паузой, сбросом и подсчётом циклов;
- панель настроек для изменения длительности шагов, ограничения количества циклов, автозапуска и haptic-обратной связи;
- поддержку цветовых тем Telegram через `Telegram.WebApp`.

## Запуск локально

```bash
npm install
npm run dev
```

Приложение доступно по адресу [http://localhost:5173](http://localhost:5173).

### Сборка production-версии

```bash
npm run build
npm run preview
```

## Интеграция в Telegram Mini App

- Хук `useTelegramTheme` вызывает `Telegram.WebApp.ready()` / `expand()` и обновляет цветовые переменные при смене темы.
- Компонент поддерживает haptic feedback через `Telegram.WebApp.HapticFeedback` (при недоступности используется `navigator.vibrate`).
- UI адаптирован под мобильные размеры и стеклянный стиль Telegram. Для встраивания достаточно разместить бандл Vite и подключить мини-приложение к URL.

## Структура проекта

```
.
├── src
│   ├── App.jsx              # Главный экран практики
│   ├── components
│   │   ├── BreathingVisualizer.jsx
│   │   └── SettingsDrawer.jsx
│   ├── constants.js         # Описание фаз и настройки по умолчанию
│   ├── hooks
│   │   └── useTelegramTheme.js
│   ├── main.jsx
│   └── styles
│       └── global.css
├── index.html               # Точка входа Vite
├── package.json
└── vite.config.js
```

## Лицензия

Проект создан для демонстрации и может быть использован свободно.
