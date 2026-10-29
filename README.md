# 學習探索站

科學與數學資源總站：18個學生資源及6個教師入口。

## 功能
- 科目、單元、關鍵字篩選及精選排序
- 游標停留封面650ms顯示即時小型預覽；點擊開啟浮動視窗
- 平板／手機點擊預覽，完整網站以新分頁開啟
- 收藏與最近使用（目前瀏覽器 localStorage）
- 教師入口集中導覽，原網站負責登入與學生資料
- 關閉預覽會移除 iframe，避免活動持續執行

## 更新資源
編輯 `resources.json`。每筆使用唯一 id，包含 title、url（https）、subject、unit、description、icon、type、minutes、audience（student/teacher）、featured、status、embed。

所有資源連結於2026-10-29檢查，24個均回應HTTP 200。此檢查不代表原網站全部遊戲功能或身份驗證均已通過。

## GitHub Pages
純靜態網站，無套件、無伺服器。將 Pages 設為 Deploy from a branch → main → /(root)。首次公開發布尚待擁有人確認公開可見度。

## 本機預覽
`python -m http.server 8000`，然後瀏覽 http://localhost:8000 。請勿直接以file://開啟，資源清單需要HTTP載入。

收藏不跨裝置同步。本站不合併各網站的學習紀錄。即時預覽受原網站嵌入政策和裝置效能影響；每個視窗均提供完整網站連結。
