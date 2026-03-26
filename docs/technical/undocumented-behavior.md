# Undocumented behavior (збірка з коду)

Приклади неявної поведінки, побічних ефектів, порядку ініціалізації та маркерів `HACK` / `FIXME` / `TODO` / `WORKAROUND` у репозиторії. Формат узгоджений із запитом на документацію для людей і AI.

---

## Undocumented Behavior #1

- **Файл**: `packages/excalidraw/components/canvases/StaticCanvas.tsx`
- **Що відбувається**: `useEffect` без масиву залежностей викликається **після кожного** re-render батька. Усередині викликається `renderStaticScene(...)` — повне перемальовування статичного canvas (сітка, видимі елементи через `renderElement`, тощо), а не лише при зміні конкретних пропсів.
- **Де задокументовано**: ніде в user-facing docs; логіка «чому без `[]`» у файлі не пояснена.
- **Ризик**: AI може додати залежності до effect «для оптимізації» і зламати синхронізацію кадру з React, або прибрати виклик, очікуючи memo — фактична частота малювання зміниться.

---

## Undocumented Behavior #2

- **Файл**: `packages/excalidraw/components/canvases/NewElementCanvas.tsx`
- **Що відбувається**: той самий патерн — `useEffect(() => { ... renderNewElementScene(...) });` **без** списку залежностей, тобто `renderNewElementScene` викликається після кожного re-render батька, поки змонтований компонент.
- **Де задокументовано**: ніде.
- **Ризик**: рефакторинг на `useLayoutEffect` або додавання залежностей без розуміння може змінити момент рендеру «нового елемента» відносно статичного шару.

---

## Undocumented Behavior #3

- **Файл**: `packages/excalidraw/components/App.tsx` (конструктор класу `App`)
- **Що відбувається**: `new ActionManager(..., () => this.scene.getElementsIncludingDeleted(), ...)` викликається **до** рядка `this.scene = new Scene()`. Коректність залежить від того, що колбек **не** виконується синхронно під час конструктора `ActionManager`. Додатково `this.history = new History(this.store)` присвоюється **двічі** (два послідовних однакових присвоєння).
- **Де задокументовано**: частково — коментар у конструкторі стосується лише `this.api` і StrictMode (`componentWillUnmount`), не порядку `scene` vs `actionManager`.
- **Ризик**: зміна `ActionManager` так, щоб він викликав `getElementsIncludingDeleted` у конструкторі, дасть звернення до `scene` до ініціалізації; дубль `history` може маскувати майбутні зміни, якщо між рядками з’явиться інша логіка.

---

## Undocumented Behavior #4

- **Файл**: `packages/excalidraw/components/App.tsx`
- **Що відбувається**: гілка з коментарем `// HACK: Disable transform handles for linear elements on mobile until a better way...` — для лінійних елементів на мобільному (або з двома точками) **не** показуються transform handles при визначенні курсора/resize, навіть якщо для десктопу вони були б доступні.
- **Де задокументовано**: лише inline-коментар у коді (~рядки 7126–7131).
- **Ризик**: AI може «виправити» умову для паритету mobile/desktop і порушити навмисне UX-обмеження або торкнутися пов’язаного шляху hit-testing.

---

## Undocumented Behavior #5

- **Файл**: `packages/excalidraw/components/App.tsx` (`componentDidUpdate`)
- **Що відбувається**: після оновлення стейту викликається `this.store.commit(elementsMap, this.state)`, потім — за умови `!this.state.isLoading` — `this.props.onChange?.(elements, this.state, this.files)` і `onChangeEmitter`. Порядок **commit → onChange** не описаний у публічному API як контракт.
- **Де задокументовано**: ніде в README пакета; лише імперативний код.
- **Ризик**: хост очікує `onChange` до внутрішнього commit історії (або навпаки) — зміна порядку в одному PR зламає синхронізацію з бекендом або дубль записів.

---

## Undocumented Behavior #6

- **Файл**: `packages/excalidraw/index.tsx`
- **Що відбувається**: коментар `// FIXME normalize/set defaults in parent component so that the memo resolver compares the same values` — об’єкт `UIOptions` збирається з `DEFAULT_UI_OPTIONS` і `props.UIOptions` на кожному рендері функціонального батька. Якщо вище мемоізація порівнює «старі» і «нові» пропси поверхно, можливі **пропуски** оновлення дочірнього `App` або зайві рендери — залежить від того, як мемо порівнює посилання.
- **Де задокументовано**: ніде окрім FIXME.
- **Ризик**: оптимізація батька через `React.memo` з неповним порівнянням ламає синхронізацію `canvasActions` / `export.saveFileToDisk`.

---

## Undocumented Behavior #7

- **Файл**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- **Що відбувається**: коментар `// FIXME after we start emitting updates from Store for appState.theme` — підписка на `app.onChangeEmitter` використовується, щоб при зміні теми викликати `updateWysiwygStyle()`, порівнюючи з `LAST_THEME`. Тобто оновлення стилю WYSIWYG **зав’язане на onChange**, а не на офіційний потік Store для `appState.theme`.
- **Де задокументовано**: ніде в API; лише FIXME.
- **Ризик**: зміна частоти/умов `onChange` або теми без проходження через `onChange` залишить текстовий редактор з некоректними кольорами.

---

## Undocumented Behavior #8

- **Файл**: `packages/excalidraw/data/library.ts` (`Library.destroy`)
- **Що відбувається**: викликається `editorJotaiStore.set(libraryItemSvgsCache, new Map())` на глобальному `editorJotaiStore` з `editor-jotai.ts`. Поруч закоментований блок `// TODO uncomment after/if we make jotai store scoped to each excal instance` — тобто **нескладені** сценарії з кількома екземплярами редактора на сторінці можуть ділити один і той самий store і взаємно очищати кеш.
- **Де задокументовано**: ніде в публічній документації; лише TODO в коді (~253–257).
- **Ризик**: AI пропонує «правильне» очищення при unmount без розуміння глобального store — інший екземпляр втрачає кеш бібліотеки.

---

## Undocumented Behavior #9

- **Файл**: `packages/excalidraw/reactUtils.ts` (`isRenderThrottlingEnabled`)
- **Що відбувається**: троттлінг `renderStaticScene` увімкнений лише якщо `window.EXCALIDRAW_THROTTLE_RENDER === true` **і** React ≥ 18; інакше троттлінг вимкнений. Це **глобальний прапорець** і перевірка major-версії React під час виконання, не конфіг пропсів `Excalidraw`.
- **Де задокументовано**: ніде в `ExcalidrawProps`; лише код і `console.warn` для React < 18.
- **Ризик**: очікування «за замовчуванням троттлиться на React 19» — хибне; зміна прапорця змінює навантаження без видимого API.

---

## Undocumented Behavior #10

- **Файл**: `packages/excalidraw/renderer/staticSvgScene.ts`
- **Що відбувається**: коментар `// Doing this separately is a quick hack to to work around compositing` — масштабування для `<use>` винесено окремо від групи `<g>`, щоб обійти некоректне застосування `transform-origin` при композитингу SVG.
- **Де задокументовано**: ніде окрім inline-коментаря (~509–511).
- **Ризик**: «спрощення» до одного transform на експорті SVG дає візуальні зсуви для масштабованих зображень.

---

## Undocumented Behavior #11

- **Файл**: `packages/excalidraw/actions/actionFinalize.tsx`
- **Що відбувається**: кілька коментарів `// TODO: #7348` про те, що **невидимі** елементи теоретично потрапляють у запис Store / undo, або що повна фіксація capture веде до **неконсистентностей** — неявний компроміс між історією та цілісністю сцени.
- **Де задокументовано**: ніде в user docs; лише TODO в коді.
- **Ризик**: зміна логіки `finalize` або Store без урахування #7348 ламає undo/redo або відновлення «невидимих» елементів.

---

## Undocumented Behavior #12

- **Файл**: `packages/common/src/colors.ts`
- **Що відбувається**: `// FIXME can't put to utils.ts rn because of circular dependency` — утиліти кольорів залишаються в `common`, а не в `utils`, через **циклічні імпорти** між пакетами.
- **Де задокументовано**: ніде в архітектурних діаграмах залежностей пакетів як обов’язкове обмеження.
- **Ризик**: AI пропонує «перенести в utils для чистоти» і створює цикл збірки або runtime import.

---

## Undocumented Behavior #13

- **Файл**: `packages/excalidraw/components/App.tsx` (`handleCanvasDoubleClick` / text tool path)
- **Що відбувається**: поруч з логікою подвійного кліку для тексту стоїть порожній маркер `// FIXME` перед `getTextBindableContainerAtPosition` (~8758) — поведінка вибору контейнера для тексту **не пояснена** коментарем; читач коду не має явного «контракту», чому спочатку обчислюється `container`, потім перезаписується при `hasBoundTextElement(element)`.
- **Де задокументовано**: ніде; FIXME без тексту.
- **Ризик**: рефакторинг гілок без тестів може зламати прив’язку тексту до контейнера.

---

## Як шукати далі

Корисні запити по репозиторію:

```bash
rg '\b(HACK|FIXME|TODO|WORKAROUND)\b' --glob '*.ts' --glob '*.tsx'
```

Частина `TODO` стосується тестів або майбутніх фіч і не завжди є «небезпечною» неявною поведінкою — кожен кейс варто перевіряти в контексті виклику.
