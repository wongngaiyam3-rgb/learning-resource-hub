# 小科：獨立 Supabase 後端

GitHub學生入口與「傳播路線偵探」的小科視窗改為直接呼叫Supabase，教師介面亦以GitHub靜態頁面提供。問答及監察不依賴chatgpt.site。

## 服務與權限

API：https://nltqzuhubqhwtfxwuupr.supabase.co/functions/v1/xiaoke-science 。前端以 x-region: ap-southeast-1 在與資料庫相同的新加坡區域呼叫。

xiaoke_private是獨立私人schema。三張表均開啟RLS，anon和authenticated沒有schema使用或表格讀取權限。沒有公開資料庫RPC；後端透過Supabase伺服器資料庫連線讀寫。無公開RLS政策是伺服器專用設計，資訊提示見 https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy 。

擁有人已明確批准把Gemini金鑰、教師密碼雜湊及工作階段簽署資料移至Supabase Vault。程式碼、GitHub和靜態產物均不包含這些值。後端只讀取三個小科專用Vault名稱。搬移時建立新的工作階段簽署金鑰；既有教師密碼不變，教師需重新登入。

已保留9筆原有問答／審查紀錄，沿用事件ID、學年、班別、學號與審查結果。原本保存在瀏覽器的五個任務進度不受此搬移影響。

教師在GitHub的teacher.html登入。8小時簽署工作階段只留在目前頁面記憶體，以Authorization傳送，避免第三方Cookie限制；重新整理後須再登入。每次讀寫均由後端驗證，回覆不快取。學生的4A–4C／1–25號是自選辨識，並非已驗證登入。

## 已完成驗證

- 32項自動測試通過，包含審查、75組入口、監察、教師權限、來源限制與傳輸層。
- TypeScript檢查與靜態建置通過。
- 新服務健康檢查200；未登入監察API回覆401；缺少設定時停止回答。
- 真實Gemini科學問答回覆200／live；自殘提問回覆422並建立紀錄。
- 教師登入、舊紀錄讀取、班別／學號篩選、跟進標記、暫停／恢復及暫停時禁止回答均通過實測。
- 靜態產物掃描未包含憑證或舊後端網址。

自動過濾不能保證零漏網或科學內容完全正確，仍須老師核對。監察不是即時求助服務；紀錄顯示最近30天，逾期資料在後續請求中清除。香港實際網絡可用性須以當地測試確認，不能由其他地區測試推定。
