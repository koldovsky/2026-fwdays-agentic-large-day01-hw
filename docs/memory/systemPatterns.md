# System patterns — Excalidraw core

## Загальна модель

Редактор — **React-застосунок**, де головний стан — це **список елементів сцени** (`ExcalidrawElement[]`) та **`AppState`** (UI, інструменти, видимість, експорт, колаборатори тощо). Зміни користувача проходять через **дії (Actions)** і оновлюють елементи/стан узгоджено.

## Елементи (Element system)

- Типи елементів і дискримінанти: `packages/element/src/types.ts`
- **`ExcalidrawElement`**: об’єднання типів фігур, ліній, тексту, зображень, фреймів тощо; орієнтований на **JSON-серіалізацію** сцени
- **Linear / bound elements**: стрілки та прив’язки до інших елементів (binding) — логіка в `packages/element` та взаємодія з редактором

## Стан додатку (`AppState`)

- Інтерфейс **`AppState`**: `packages/excalidraw/types.ts`
- Дефолти та ініціалізація: `packages/excalidraw/appState.ts` (`getDefaultAppState`)
- Поля охоплюють: активний інструмент, виділення, редагування тексту, прив’язки стрілок, фрейми, сітка, експорт, колаборатори тощо

## Система дій (Action system)

- **`ActionManager`**: `packages/excalidraw/actions/manager.tsx`
- Централізує реєстрацію дій, виклики та **оновлення** через `updater`, який отримує `ActionResult` (new `elements` / `appState`)
- Дії можуть логувати аналітику через `trackEvent`

## Рендеринг (Canvas / React)

- Головний контейнер редактора — **`App`** у `packages/excalidraw/components/App.tsx` (великий компонент: події, інтервали, рендер сцени)
- Відмальовка на **canvas** (Rough.js для «ескізного» вигляду) узгоджена з поточним списком елементів і `AppState`; деталі пайплайну — у `docs/technical/architecture.md`

## Стан у бібліотеці та в застосунку

- У пакеті `@excalidraw/excalidraw` використовується **Jotai** (атоми/області видимості) для частини стану
- У **`excalidraw-app`** — окремі Jotai-атоми (`excalidraw-app/app-jotai.ts` та пов’язані файли) для обгортки продуктового застосунку

## Залежності між пакетами

```
@excalidraw/excalidraw  →  @excalidraw/element, @excalidraw/common, @excalidraw/math, utils
@excalidraw/element     →  @excalidraw/common, @excalidraw/math
```

## Патерн «одне джерело правди для сцени»

Список елементів і `AppState` оновлюються **атомарно** в рамках обробки дії/події, щоб canvas і React-UI не розходились; історія (undo/redo) прив’язана до змін сцени (`actions/actionHistory.tsx` та пов’язаний код).

## Індекс Memory Bank

Повний перелік файлів пам’яті та їх ролі — у **`docs/memory/projectbrief.md`** (секція «Memory Bank»). Детальна архітектура — не дублювати тут: **`docs/technical/architecture.md`**.
