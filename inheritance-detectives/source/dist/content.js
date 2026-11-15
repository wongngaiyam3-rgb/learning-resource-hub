export const levels = [
 {id:'leaves',name:'葉子觀察站',icon:'🌿',color:'#d9edcb',goal:'觀察葉形，比較親代和子代。',code:'4LC4'},
 {id:'flowers',name:'花朵小花園',icon:'🌸',color:'#f8dcdf',goal:'比較花瓣的顏色和數量。',code:'4LC4、4LC5'},
 {id:'animals',name:'動物育幼園',icon:'🐈',color:'#f7e4ba',goal:'找出動物親代和子代相似的特徵。',code:'4LC4'},
 {id:'people',name:'人物觀察室',icon:'👂',color:'#dbe8f2',goal:'留意眼睛顏色和耳垂形狀。',code:'4LC5'},
 {id:'changes',name:'髮型小迷宮',icon:'✂️',color:'#e5dcf0',goal:'分辨遺傳特徵和後天改變的外貌。',code:'4LC5'},
 {id:'final',name:'小偵探終極站',icon:'🔎',color:'#d9ebe5',goal:'用觀察紀錄找出子代，整理學習重點。',code:'4LC4–4LC6'}
];
const leaf=(shape)=>({type:'leaf',shape});
const flower=(color,petals)=>({type:'flower',color,petals});
const cat=(color)=>({type:'cat',color});
const person=(ear='free',eye='#633e27',hair='short')=>({type:'person',ear,eye,hair});
const o=(label,art)=>({label,art});
export const questions=[
{id:'l1',level:0,title:'哪一株是這株植物的子代？',clue:'種植紀錄：子代的葉形與親代相似。請比較葉子的形狀。',parent:leaf('oval'),parentLabel:'親代：橢圓形葉',options:[o('幼株 A',leaf('needle')),o('幼株 B',leaf('oval')),o('幼株 C',leaf('fan'))],answer:1,why:'幼株 B 的葉子和親代一樣呈橢圓形。植物的子代具有與親代相似的特徵。'},
{id:'l2',level:0,title:'找到扇形葉植物的子代。',clue:'種植紀錄：這株親代的子代有相似的扇形葉。',parent:leaf('fan'),parentLabel:'親代：扇形葉',options:[o('幼株 A',leaf('fan')),o('幼株 B',leaf('oval')),o('幼株 C',leaf('needle'))],answer:0,why:'幼株 A 和親代都有扇形葉。這裏比較的是葉形，不是植株的大小。'},
{id:'l3',level:0,title:'哪株幼苗的葉形與親代相似？',clue:'種植紀錄：子代有細長的針形葉。',parent:leaf('needle'),parentLabel:'親代：針形葉',options:[o('幼株 A',leaf('oval')),o('幼株 B',leaf('fan')),o('幼株 C',leaf('needle'))],answer:2,why:'幼株 C 具有與親代相似的針形葉。這是根據已提供的種植紀錄作配對。'},
{id:'f1',level:1,title:'哪一株是這朵花的子代？',clue:'種植紀錄：這株子代與親代都有五片粉紅色花瓣。',parent:flower('#e992ac',5),parentLabel:'親代：粉紅色，五片花瓣',options:[o('幼株 A',flower('#e992ac',5)),o('幼株 B',flower('#ecc353',5)),o('幼株 C',flower('#e992ac',4))],answer:0,why:'幼株 A 的花瓣顏色和數量都與紀錄相符。花瓣顏色和數量是可從親代繼承的特徵。'},
{id:'f2',level:1,title:'找出黃花的子代。',clue:'種植紀錄：子代有六片黃色花瓣。數一數再選。',parent:flower('#ecc353',6),parentLabel:'親代：黃色，六片花瓣',options:[o('幼株 A',flower('#ecc353',4)),o('幼株 B',flower('#a99bcf',6)),o('幼株 C',flower('#ecc353',6))],answer:2,why:'幼株 C 具有六片黃色花瓣，和親代及紀錄相符。'},
{id:'f3',level:1,title:'紫花的子代在哪裏？',clue:'種植紀錄：這株子代與親代都有四片紫色花瓣。',parent:flower('#a99bcf',4),parentLabel:'親代：紫色，四片花瓣',options:[o('幼株 A',flower('#a99bcf',6)),o('幼株 B',flower('#a99bcf',4)),o('幼株 C',flower('#e992ac',4))],answer:1,why:'幼株 B 的紫色花瓣共有四片。要同時比較顏色和數量。'},
{id:'a1',level:2,title:'根據紀錄，哪隻小貓是子代？',clue:'照顧紀錄：這隻親代的小貓有相似的橙色毛。',parent:cat('#d79d59'),parentLabel:'親代：橙色毛',options:[o('小貓 A',cat('#8e929b')),o('小貓 B',cat('#d79d59')),o('小貓 C',cat('#eee7da'))],answer:1,why:'小貓 B 的橙色毛與紀錄相符。動物的子代具有與親代相似的特徵，但不會每個特徵都完全一樣。'},
{id:'a2',level:2,title:'找到這隻親代的小貓。',clue:'照顧紀錄：這隻小貓和親代都有灰色毛。',parent:cat('#8e929b'),parentLabel:'親代：灰色毛',options:[o('小貓 A',cat('#eee7da')),o('小貓 B',cat('#d79d59')),o('小貓 C',cat('#8e929b'))],answer:2,why:'小貓 C 有相似的灰色毛。這是配合照顧紀錄比較特徵。'},
{id:'a3',level:2,title:'哪個說法最合適？',clue:'這隻小貓已知是圖中親代的子代。比較牠們的特徵。',parent:cat('#eee7da'),parentLabel:'親代與子代都有淺色毛',options:[o('子代可有與親代相似的特徵',cat('#eee7da')),o('子代所有特徵都必定完全一樣',cat('#eee7da')),o('子代不會有親代的特徵',cat('#eee7da'))],answer:0,why:'子代具有與親代相似的特徵。「相似」並不表示所有特徵都完全相同。'},
{id:'p1',level:3,title:'依人物紀錄，哪位是這家庭的子代？',clue:'虛構家庭紀錄：子代的耳垂與圖中的親代相似，耳垂下端離開面頰。',parent:person('free'),parentLabel:'親代：耳垂下端離開面頰',options:[o('人物 A：耳垂下端貼近面頰',person('attached')),o('人物 B：耳垂下端離開面頰',person('free')),o('人物 C：戴耳罩，無法觀察', {type:'person',ear:'covered'})],answer:1,why:'人物 B 的耳垂形狀與這份家庭紀錄相符。耳垂形狀可從親代繼承；現實中不能單憑外貌確定親子關係。'},
{id:'p2',level:3,title:'哪位人物符合子代的觀察紀錄？',clue:'虛構家庭紀錄：子代有與圖中親代相似的棕色眼睛。請看眼睛特寫。',parent:{type:'eyes',color:'#633e27'},parentLabel:'親代：棕色眼睛（特寫）',options:[o('人物 A：棕色眼睛',{type:'eyes',color:'#633e27'}),o('人物 B：藍色眼睛',{type:'eyes',color:'#4e8eb0'}),o('人物 C：綠色眼睛',{type:'eyes',color:'#6e9258'})],answer:0,why:'人物 A 的眼睛顏色符合紀錄。眼睛顏色是可從親代繼承的特徵；這個遊戲不預測真實家庭的子代外貌。'},
{id:'p3',level:3,title:'找子代時，哪個線索屬於遺傳特徵？',clue:'觀察虛構家庭的親代與子代。選出可從親代繼承的特徵。',parent:person('free'),parentLabel:'比較人物的特徵',options:[o('頭髮剪得一樣短',person('free','#633e27','short')),o('穿一樣的衣服',{type:'shirt'}),o('相似的耳垂形狀',{type:'ear',ear:'free'})],answer:2,why:'耳垂形狀可從親代繼承。頭髮長度可以剪短，衣服可以更換，不能用來判斷遺傳。'},
{id:'c1',level:4,title:'子代剪了頭髮，你還認得嗎？',clue:'虛構家庭紀錄：子代耳垂下端離開面頰；今天剪了短髮。',parent:person('free','#633e27','long'),parentLabel:'親代：長髮，耳垂下端離開面頰',options:[o('人物 A：短髮，耳垂相似',person('free','#633e27','short')),o('人物 B：長髮，耳垂不同',person('attached','#633e27','long')),o('人物 C：長髮，耳朵被遮蓋',person('covered','#633e27','long'))],answer:0,why:'人物 A 符合紀錄。頭髮長度不是從親代繼承的特徵；子代不用和親代有相同髮型。'},
{id:'c2',level:4,title:'親代短髮，子代一定要短髮嗎？',clue:'虛構家庭紀錄：子代有棕色眼睛，留長髮。請找出符合紀錄的人物。',parent:person('free','#633e27','short'),parentLabel:'親代：短髮，棕色眼睛',options:[o('人物 A：短髮，藍色眼睛',person('free','#4e8eb0','short')),o('人物 B：長髮，棕色眼睛',person('free','#633e27','long')),o('人物 C：長髮，綠色眼睛',person('free','#6e9258','long'))],answer:1,why:'人物 B 符合紀錄。子代的頭髮長度不必與親代相同，頭髮長度並非遺傳特徵。'},
{id:'c3',level:4,title:'哪個線索不能用作遺傳特徵配對？',clue:'小偵探正整理親代與子代的紀錄。找出不是從親代繼承的特徵。',parent:person('free','#633e27','long'),parentLabel:'仔細分辨觀察線索',options:[o('眼睛顏色',{type:'eyes',color:'#633e27'}),o('耳垂形狀',{type:'ear',ear:'free'}),o('頭髮長度',person('free','#633e27','long'))],answer:2,why:'頭髮長度並非從親代繼承，可以透過理髮改變。'},
{id:'z1',level:5,title:'用捲舌紀錄找出子代。',clue:'虛構家庭紀錄：這位子代和圖中的親代都能捲舌。選出符合紀錄的人物。',parent:{type:'tongue',rolled:true},parentLabel:'親代：能捲舌（示意圖）',options:[o('人物 A：不能捲舌',{type:'tongue',rolled:false}),o('人物 B：能捲舌',{type:'tongue',rolled:true}),o('人物 C：未有觀察紀錄',{type:'unknown'})],answer:1,why:'人物 B 符合紀錄。本課程以能否捲舌作遺傳特徵的例子，不把它當作後天練習的目標。'},
{id:'z2',level:5,title:'用拇指紀錄找出子代。',clue:'虛構家庭紀錄：這位子代的拇指和親代一樣能向後彎曲。只觀察圖像，不要用力扳手指。',parent:{type:'thumb',bent:true},parentLabel:'親代：拇指能向後彎曲（示意圖）',options:[o('人物 A：拇指能向後彎曲',{type:'thumb',bent:true}),o('人物 B：拇指不能向後彎曲',{type:'thumb',bent:false}),o('人物 C：未有觀察紀錄',{type:'unknown'})],answer:0,why:'人物 A 符合紀錄。本課程以拇指能否向後彎曲作遺傳特徵的例子，只需觀察，不需強行模仿。'},
{id:'z3',level:5,title:'找到了子代，哪個總結正確？',clue:'回想葉子、花朵、動物和人物關卡的親代與子代。',parent:{type:'collection'},parentLabel:'我們都是特徵小偵探',options:[o('子代必定與親代完全相同',{type:'unknown'}),o('相同髮型便能確定親子關係',{type:'shirt'}),o('子代有與親代相似的特徵',{type:'collection'})],answer:2,why:'動物和植物的子代具有與親代相似的特徵。有些特徵可從親代繼承，有些外貌特徵則可以在後天改變。'}
];
export function summarize(events){
 const done=new Set(events.filter(e=>e.correct).map(e=>e.question_id));
 const first=new Map();for(const e of events)if(!first.has(e.question_id))first.set(e.question_id,e);
 return {solved:[...done],firstCorrect:[...first.values()].filter(e=>e.correct).length,attempts:events.length,levels:levels.map((_,i)=>questions.filter(q=>q.level===i).every(q=>done.has(q.id)))};
}
export function csvCell(value){return '"'+String(value??'').replace(/"/g,'""')+'"';}
