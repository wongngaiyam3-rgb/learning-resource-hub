# 小科跨網站發布清單

更新日期：2026-11-02（香港）。

已發布 15 個 GitHub 專案及 15 個既有 Sites 版本。GitHub 的 39 個學生／共用入口 HTML 頁均載入一份共用小科元件；原有獨立問答網站保留完整介面。教師管理頁隱藏學生元件。

## 學生使用方式

按右上角「召喚小科」，選 4A–4C 及 1–25 號後提問。若網站已有有效班別學號，會先預填供確認。科學與數學各有主題建議；數學回答先引導思考。關閉可回到原活動，換學生會清除本次問答並取消未完成請求。班別、學號及網站標籤由用戶端提供，並非已驗證身分。

## 已發布的 GitHub 頁面

| 專案 | 學生頁面 |
|---|---|
| day-night-detective | [index.html](https://wongngaiyam3-rgb.github.io/day-night-detective/)、[candy-factory/index.html](https://wongngaiyam3-rgb.github.io/day-night-detective/candy-factory/) |
| microbial-postcards | [index.html](https://wongngaiyam3-rgb.github.io/microbial-postcards/) |
| seasons-classroom | [index.html](https://wongngaiyam3-rgb.github.io/seasons-classroom/) |
| lever-explorer | [catapult.html](https://wongngaiyam3-rgb.github.io/lever-explorer/catapult.html)、[index.html](https://wongngaiyam3-rgb.github.io/lever-explorer/)、[practice.html](https://wongngaiyam3-rgb.github.io/lever-explorer/practice.html)、[rescue.html](https://wongngaiyam3-rgb.github.io/lever-explorer/rescue.html) |
| multiply-step-classroom | [division-original/index.html](https://wongngaiyam3-rgb.github.io/multiply-step-classroom/division-original/)、[index.html](https://wongngaiyam3-rgb.github.io/multiply-step-classroom/)、[step-multiply/index.html](https://wongngaiyam3-rgb.github.io/multiply-step-classroom/step-multiply/) |
| number-card-divisibility | [docs/index.html](https://wongngaiyam3-rgb.github.io/number-card-divisibility/) |
| divisibility-small-steps | [index.html](https://wongngaiyam3-rgb.github.io/divisibility-small-steps/) |
| rhombus-detective | [classroom/index.html](https://wongngaiyam3-rgb.github.io/rhombus-detective/classroom/)、[index.html](https://wongngaiyam3-rgb.github.io/rhombus-detective/) |
| panda-quadrilateral-rescue | [site/404.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/404.html)、[site/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/)、[site/journal/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/journal/)、[site/map/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/map/)、[site/quest/1/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/quest/1/)、[site/quest/2/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/quest/2/)、[site/quest/3/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/quest/3/)、[site/quest/4/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/quest/4/)、[site/quest/5/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/quest/5/)、[site/quest/6/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/quest/6/)、[site/quest/7/index.html](https://wongngaiyam3-rgb.github.io/panda-quadrilateral-rescue/quest/7/) |
| transmission-route-detective | [index.html](https://wongngaiyam3-rgb.github.io/transmission-route-detective/) |
| food-chain-detectives | [expedition/index.html](https://wongngaiyam3-rgb.github.io/food-chain-detectives/expedition/)、[expedition/island/index.html](https://wongngaiyam3-rgb.github.io/food-chain-detectives/expedition/island/)、[forest-foodweb-explorer/index.html](https://wongngaiyam3-rgb.github.io/food-chain-detectives/forest-foodweb-explorer/)、[forest-simulator/index.html](https://wongngaiyam3-rgb.github.io/food-chain-detectives/forest-simulator/)、[index.html](https://wongngaiyam3-rgb.github.io/food-chain-detectives/) |
| fraction-cake-lab | [index.html](https://wongngaiyam3-rgb.github.io/fraction-cake-lab/) |
| rainforest-food-chain-quest | [docs/index.html](https://wongngaiyam3-rgb.github.io/rainforest-food-chain-quest/)、[docs/maps/index.html](https://wongngaiyam3-rgb.github.io/rainforest-food-chain-quest/maps/)、[docs/materials.html](https://wongngaiyam3-rgb.github.io/rainforest-food-chain-quest/materials.html)、[docs/notebook/index.html](https://wongngaiyam3-rgb.github.io/rainforest-food-chain-quest/notebook/) |
| tangram-island | [index.html](https://wongngaiyam3-rgb.github.io/tangram-island/) |
| learning-resource-hub | [index.html](https://wongngaiyam3-rgb.github.io/learning-resource-hub/) |

## 服務與安全

問答及內容審查使用原有 Supabase 後端與 Gemini，並非 chatgpt.site 問答服務。金鑰只在伺服器 Vault；學生網頁不包含金鑰。輸入與輸出均經本地及語意審查，安全檢查或監察寫入失效時不放行回答。維持配額、教師暫停控制及最近 30 天監察；科學／數學教學內容仍須老師核對。

[教師監察站](https://wongngaiyam3-rgb.github.io/learning-resource-hub/science-curiosity/teacher.html)統一接收各站問答，來源標籤寫在提問開頭。教師 API 僅接受專用 GitHub 教師頁來源，其他已登記 Sites 僅可使用學生服務。

## 驗證

34 項後端安全及權限測試通過；真實科學及數學問答成功，暴力測試被攔截。15 個 GitHub 專案的 Pages 建置／部署成功；39 個 HTML 公開網址檢查通過。15 個 Sites 部署全部成功，維持既有公開或私人設定。瀏覽器確認資源總站真實回答、七巧板身分預填與換人重置、3D 活動入口、舊版熊貓連線及教師路由隱藏。沒有讀取私人學生問答紀錄作驗證。香港實際校網仍需當地確認。

## 尚未更新

Perplexity 舊站目前沒有可用的來源編輯連線，未更動其網站。取得原始碼或可編輯連線後，才能完成這部分；不能以已更新的 GitHub 版本代稱原網站已修改。

共用元件的載入方式見 [README](README.md)。
