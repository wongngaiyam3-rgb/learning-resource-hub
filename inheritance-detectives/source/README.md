# 特徵小偵探
香港小四科學六關遊戲，每關三題，適合 iPad 觸控及桌面瀏覽器。

學生以 4A、4B、4C 及學號 1–25 進入。每次確認答案均由 Supabase Edge Function 判定及儲存；答錯可重試。完成上一關後解鎖下一關。學生只用班別學號自選身份，不作本人驗證；不收集姓名、照片或真實家庭特徵。

教師入口：遊戲網址加 `#teacher`，或按右上「教師平台」。密碼由後端 PBKDF2 驗證，公開前端不含教師密碼。教師 token 四小時有效，登出後後端撤銷。可篩選班別、完成狀態，匯出含 UTF-8 BOM 的學生進度及歷次逐題明細 CSV。

## 紀錄定義
- 一輪：每次選擇班別學號按開始，建立一個 session。相同分頁可重新整理繼續。
- 更換學生或重新挑戰建立新一輪，舊輪保留。
- 教師表格顯示最新一輪；明細含各輪，另顯示歷次最佳首次答對題數。
- 首次答對：該輪每題第一次選擇答對才計分。
- 完成關卡：該關三題均已答對（包括重試後答對）。
- 顯示已儲存才代表伺服器成功接收。連線失敗留在原題可重試，相同 event_id 不會重複記錄。
- 學生 token 只保存在 sessionStorage，同一分頁重新整理可續玩。關閉分頁後需重新選身份，歷次紀錄仍保留。

## 課程依據
教育局《科學（小一至小六）課程指引》（2025），第 27 頁，4LC4、4LC5、4LC6。
https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/science-edu/pri-sci/PSCG%282025%29.pdf

葉形用作 4LC4 觀察親代子代相似特徵；花瓣顏色和數量、眼睛顏色及耳垂形狀對應 4LC5；髮長作非遺傳特徵；捲舌及拇指後彎只按 4LC6 作觀察例子。所有人物及配對紀錄均為虛構；不教授遺傳機制、顯隱性、比例或生物學外推，也不以單一特徵預測真實家庭外貌或確定親子關係。插圖為可縮放 SVG，不使用真實學生影像。

## 架構與部署
- 前端：dist/ 內的無建置 HTML、CSS、ES modules。GitHub Pages 直接服務。
- 後端：supabase/functions/inheritance-api/，使用已部署的 Supabase 專案。
- schema.sql：初始結構備份，已於資料庫套用，不能在現有庫重複執行。
- 所有 inheritance_ 表開啟 RLS，撤銷 anon/authenticated 直接存取，僅 Edge Function 的 service role 讀寫。無公開政策屬預期，資料不供 Data API 公開讀取。
- Edge Function 使用自身學生 token 或教師 session 驗證，verify_jwt=false。service-role key 只讀取 Supabase 託管環境。
- 所有新增檔案獨立存於 learning-resource-hub/inheritance-detectives/，原網站檔案不變。

## 驗證
`npm test` 檢查進度、重試計分、75 人 roster、歷次紀錄、CSV 及題目完整性。
`node tests/api-check.mjs` 會在 4C/25 建立 QA session 並完整走題，輸出其 ID；僅開發者使用，測後以輸出的精確 session ID 移除這筆測試資料。

瀏覽器 QA 為雲端瀏覽器，已檢查 768px 及 390px iframe 視窗下的響應式排版，並非實體 iPad Safari。教師儀表板瀏覽器檢查使用獨立的合成資料 fixture；真實後端的密碼驗證、讀取和登出撤銷另以 API 測試。
