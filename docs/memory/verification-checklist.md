# Чекліст підтримки достовірності Memory Bank

Цей файл відповідає на вимогу **підтримувати актуальність** тверджень у `projectbrief.md` та `progress.md`, які посилаються на структуру репозиторію, версії пакетів і наявність артефактів.

## Автоматичні перевірки (об’єктивні факти)

- З кореня репозиторію виконай:

  ```bash
  yarn verify:memory-facts
  ```

- Скрипт `scripts/verify-memory-facts.js` перевіряє:
  - `name` і `workspaces` у кореневому `package.json`;
  - наявність ключових скриптів (`build`, `test:all`, `test:typecheck`, …);
  - версії `0.18.0` у `packages/common`, `element`, `excalidraw`, `math` і `0.1.2` у `packages/utils`;
  - опис і `peerDependencies` пакета `excalidraw`;
  - `LICENSE` (MIT);
  - існування `examples/with-nextjs/README.md`, `excalidraw-app/collab/Collab.tsx`;
  - імпорт `Excalidraw` у `excalidraw-app/App.tsx`.

- Після зміни скрипта або списку перевірок онови цей чекліст і при потребі пункти в `projectbrief.md` / `progress.md`.

## Повна перевірка якості коду (не входить у скрипт вище)

- Перед оновленням таблиці «Журнал перевірок» у `progress.md`:

  ```bash
  yarn test:all
  ```

- Детальніше: [docs/technical/dev-setup.md](../technical/dev-setup.md) (розділ про тести та PR).

## Коли що оновлювати

### `projectbrief.md`

- Після зміни **мети** репозиторію, **workspaces**, **головних продуктів** (app vs пакет).
- Після зміни шляхів або імен ключових точок входу (`excalidraw-app/App.tsx`, опису пакета в `packages/excalidraw/package.json`).
- Прогін: `yarn verify:memory-facts` + ручна перевірка розділу «Що явно не описано в коді».

### `progress.md`

- Після **bump версій** у `packages/*/package.json`.
- Після появи / зникнення **кореневого README**, **CONTRIBUTING**, великих артефактів (згаданих у файлі).
- Додай рядок у **Журнал перевірок** після успішного `yarn test:all` (дата, гілка, результат).

## Відповідність тверджень і перевірок

| Джерело в Memory Bank | Як підтвердити |
|------------------------|----------------|
| `projectbrief`: назва workspace | `yarn verify:memory-facts` → `package.json` `name` |
| `projectbrief`: workspaces / продукти | скрипт + наявність каталогів |
| `projectbrief`: MIT, опис пакета, peer React | скрипт |
| `projectbrief`: імпорт у `App.tsx`, Collab | скрипт |
| `progress`: версії пакетів | скрипт |
| `progress`: скрипти збірки/тестів | скрипт |
| `progress`: приклад `with-nextjs` | скрипт |
| Якість коду / регресії | `yarn test:all` (вручну) |

## Інтеграція в CI

- У цьому репозиторії після `yarn install` у workflow **Lint** (`.github/workflows/lint.yml`) виконується `yarn verify:memory-facts`.

- Для інших форків: додай той самий крок після `yarn install`.

- Повний gate (довше): `yarn verify:memory-facts && yarn test:all` — на merge / перед оновленням журналу в `progress.md`.

## Посилання

- [projectbrief.md](./projectbrief.md)
- [progress.md](./progress.md)
- [dev-setup.md](../technical/dev-setup.md)
