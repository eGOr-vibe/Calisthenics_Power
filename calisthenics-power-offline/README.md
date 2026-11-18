# Calisthenics Power — Offline (автономная версия)

Полностью автономное мобильное приложение калистеники. **Без сервера, без интернета** — всё работает локально на устройстве.

## Архитектура

- **Next.js 16** с `output: "export"` → чистые статические HTML/CSS/JS файлы
- **Capacitor** → обёртка статики в нативный Android APK
- **localStorage** → все пользовательские данные (профиль, тренировки, логи)
- **fetch-interceptor** → перехватывает все `/api/` вызовы и направляет в localStorage
- **Статические данные** → 104 упражнения, 28 техник, 10 статей теории, 18 БАДов, 8 проблем, 4 элемента статики — всё вшито в код

## Быстрый старт (dev-режим для разработки)

```bash
cd calisthenics-power-offline
npm install
npm run dev    # http://localhost:3001
```

## Сборка APK (полностью офлайн)

### Шаг 1: Установить зависимости (один раз)

```bash
cd calisthenics-power-offline
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Шаг 2: Инициализировать Android-проект (один раз)

```bash
npx cap add android
```

Если Android-проект уже добавлен — пропусти этот шаг.

### Шаг 3: Собрать статику и синхронизировать с Android

```bash
npm run cap:sync
```

Эта команда:
1. Запускает `next build` → генерирует статические файлы в папку `out/`
2. Копирует `out/` в `android/app/src/main/assets/public/`
3. Синхронизирует нативные плагины Capacitor

### Шаг 4: Собрать APK

**Вариант A — через Android Studio (рекомендуется):**

```bash
npm run cap:open    # открывает Android Studio
```

В Android Studio:
- `Build → Build Bundle(s) / APK(s) → Build APK(s)`
- Готовый APK: `android/app/build/outputs/apk/debug/app-debug.apk`

**Вариант B — через командную строку:**

```bash
npm run apk:debug
```

Готовый APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Шаг 5: Установить на телефон

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Или скопируй `app-debug.apk` на телефон и открой файл — Android сам предложит установку.

## Запуск на эмуляторе

В Android Studio:
1. Открой проект: `npm run cap:open`
2. Выбери эмулятор в выпадающем списке
3. Нажми ▶ (Run)

Приложение работает **полностью офлайн** — никакой сервер не нужен!

## Структура проекта

```
calisthenics-power-offline/
├── android/                    # нативный Android-проект (создаётся через cap add)
├── out/                        # статическая сборка (создаётся через next build)
├── public/                     # иконки, manifest, шаблоны CSV
├── src/
│   ├── app/                    # страницы Next.js
│   │   ├── exercises/[slug]/
│   │   │   ├── page.tsx        # server: generateStaticParams
│   │   │   └── page-client.tsx # client: UI + localStorage
│   │   ├── knowledge/
│   │   │   ├── techniques/[slug]/   # server + client split
│   │   │   ├── theory/[slug]/       # server + client split
│   │   │   └── static/[slug]/       # server + client split
│   │   ├── supplements/[slug]/      # server + client split
│   │   ├── problems/[slug]/         # server + client split
│   │   └── ... (остальные страницы)
│   ├── components/ui/          # shadcn/ui компоненты
│   ├── lib/
│   │   ├── data/               # статические данные (TS-файлы)
│   │   ├── local-storage.ts    # CRUD через localStorage
│   │   ├── fetch-interceptor.ts# перехват /api/ → localStorage
│   │   ├── biomech.ts          # биомеханические формулы
│   │   ├── i18n.ts             # переводы RU/EN
│   │   └── ...
│   └── hooks/                  # React hooks (таймер, голос, beep)
├── capacitor.config.ts         # webDir: "out"
├── next.config.ts              # output: "export", trailingSlash: true
└── package.json                # скрипты cap:sync, cap:open, apk:debug
```

## Что работает

- ✅ Все справочные данные (104 упражнения, 28 техник, 10 статей теории, 18 БАДов, 8 проблем, 4 элемента статики)
- ✅ Пользовательские данные через localStorage (профиль, тренировки, логи)
- ✅ ВИИТ-таймер с beep-сигналами и голосовым управлением
- ✅ Биомеханический калькулятор (K_lever, CNS_pulse, TDEE, stress index)
- ✅ Путь к статическим элементам (skills tree)
- ✅ Трекеры (сон, боль, календарь, площадки, цели)
- ✅ Compound-программы (5 готовых)
- ✅ i18n RU/EN
- ✅ Тёмная/светлая тема
- ✅ Полная автономность — без сервера и интернета

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер на :3001 (для разработки) |
| `npm run build` | Статическая сборка в `out/` |
| `npm run cap:sync` | Сборка + синхронизация с Android |
| `npm run cap:open` | Открыть Android Studio |
| `npm run apk:debug` | Полная сборка APK одной командой |
| `npm run lint` | Проверка ESLint |

## Решение проблем

### Чёрный экран на эмуляторе/телефоне
Это значит, что WebView не может загрузить страницу. Проверь:
1. Запущена ли `npm run cap:sync` после последних изменений
2. Существует ли папка `out/` со статическими файлами
3. В `capacitor.config.ts` нет `server.url` (должен грузиться из встроенных файлов)

### "Module not found" при сборке
```bash
rm -rf node_modules out .next
npm install
npm run cap:sync
```

### Android Studio: "Merging decision tree log"
Это **не ошибка** — это информационный лог объединения AndroidManifest.xml. Просто прокрути ниже — ищи `BUILD SUCCESSFUL`.

### APK не появляется
После `Build APK(s)` в Android Studio:
- Жми ссылку "locate" в уведомлении внизу справа
- Или открой вручную: `android/app/build/outputs/apk/debug/app-debug.apk`

### Изменения не отображаются в приложении
```bash
npm run cap:sync    # пересобрать и скопировать статику
# затем в Android Studio: Run ▶ (или пересобрать APK)
```
