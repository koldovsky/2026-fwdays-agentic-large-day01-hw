# Встановлення і запуск
npx repomix

# Дерево файлів з кількістю токенів (поріг — 1000 токенів)
npx repomix --token-count-tree 1000

# Компресія — лише структура (класи, функції, інтерфейси)
npx repomix --compress --output repomix-compressed.txt

# Тільки потрібні файли
npx repomix --include "packages/excalidraw/src/**/*.ts" --output repomix-core.txt

# Комбінація: компресія + без коментарів + фільтр
npx repomix --compress --remove-comments --include "src/**" --output repomix-minimal.txt
