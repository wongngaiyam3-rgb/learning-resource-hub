# 小科：Supabase 後端搬移（待安全金鑰批准）

## 準備結果

- 新服務：`https://nltqzuhubqhwtfxwuupr.supabase.co/functions/v1/xiaoke-science`
- 以 `x-region: ap-southeast-1` 在與資料庫相同的新加坡區域執行。
- `/api/health` 實測 HTTP 200，資料庫已連通，`configured:false`。
- `/api/teacher/events` 未登入實測 HTTP 401。
- `/api/config` 在缺少金鑰時實測 HTTP 503／`setup_required`，不會提供未審查或示範回答。
- 32 項自動測試通過，包含原有審查、75 組報到組合、監察、教師權限及新傳輸層的測試。
- 靜態學生及教師介面已建置，全部呼叫 Supabase；傳播路線偵探的新小科模組也已準備。

## 資料與權限

`xiaoke_private` 是獨立私人 schema。三張表均開啟 RLS，`anon` 和 `authenticated` 沒有 schema 使用或表格讀取權限。沒有對外公開的資料庫 RPC。後端透過 Supabase 預設的伺服器資料庫連線讀寫；不把資料庫憑證、Gemini 金鑰或教師驗證資料編進程式碼。

三張表不設公開讀取政策是刻意的伺服器專用設計；安全檢查的資訊提示可參考 https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy 。

Gemini 金鑰、教師密碼雜湊與工作階段簽署金鑰預定存於 Supabase Vault。自動批准審查要求擁有人明確同意這些資料送往該 Supabase 專案；目前尚未搬入任何實際驗證金鑰。設定成功後，後端只查詢三個小科專用名稱，不查詢其他應用的密鑰。

舊資料庫已確認有9筆問答／審查紀錄可搬移；紀錄尚未匯入新庫。保留原事件ID、學年、班別、學號及審查結果。任務本身在瀏覽器的學習進度不屬於本次搬移。

教師在 GitHub 的 `teacher.html` 登入，使用同一小科教師密碼；密碼本身不存入程式碼。簽署的8小時工作階段只留在目前頁面的記憶體，以 Authorization 傳送，避開第三方Cookie限制。重新整理頁面須再登入。所有讀寫仍由後端驗證；未經審查的回答不會釋出。

## 切換順序

1. 擁有人批准把現有Gemini金鑰、教師密碼雜湊、簽署金鑰及既有紀錄搬到上述Supabase專案。
2. 設定Vault、搬移紀錄、實測真正的Gemini問答與教師登入／篩選／控制。
3. 將 `prepared-release` 的靜態產物發布到 GitHub Pages；部署傳播路線偵探的新連線地址。
4. 驗證兩個學生入口及新教師網址，更新教學網站清單。香港實際網絡可用性仍須實測，不能由海外測試推定。

目前正式網站尚未切換；此分支是可審查的準備版本，不代表完整搬移已完成。舊服務及紀錄暫時保留，避免遺失資料。
