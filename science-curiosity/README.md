# 科學好奇研究所

學生入口：https://wongngaiyam3-rgb.github.io/learning-resource-hub/science-curiosity/

教師監察站：https://wongngaiyam3-rgb.github.io/learning-resource-hub/science-curiosity/teacher.html

GitHub Pages提供介面；Gemini問答、雙向內容審查、速率限制及私人監察資料由Supabase後端處理。金鑰只存於Supabase Vault，不存於GitHub。見[MIGRATION.md](MIGRATION.md)。

在此目錄安裝package.json的固定版本依賴後執行npm run check、npm test及npm run build；把prepared-release的產物發布到本目錄。後端部署入口為backend/index.ts，資料庫結構為backend/schema.sql。
