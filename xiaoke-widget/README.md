# 小科共用問答視窗

在教學頁加入帶有data-xiaoke-site（網站名稱）與data-xiaoke-topic（主題）的外部script，指向本目錄v1.js。視窗使用Shadow DOM隔離版面；先選4A–4C及1–25號才提問，若原頁面可讀到當前班號會預填。關閉後可繼續原活動；切換學生或原頁面登出會清除聊天並取消等待中的請求。對話不寫入瀏覽器儲存。

所有提問直接交給Supabase；輸入／輸出審查、教師監察與速率限制仍由後端處理。提問加上來源網站標記，但此標記與自選班號並非驗證身分。腳本不讀取其他網站的登入憑證、學生答案或教師資料。教師路徑不顯示學生問答入口。

支援主題：general、earth、microbes、health、lever、ecology、number、geometry、fraction。GitHub Pages發布後，各網站共用同一版本。
