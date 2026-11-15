const outline='#385846';
const wrap=(s,label='科學觀察插圖')=>`<svg viewBox="0 0 240 200" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><g stroke-linecap="round" stroke-linejoin="round">${s}</g></svg>`;
export function art(a={}){
let s='';
if(a.type==='leaf'){
 s='<path d="M120 174 Q111 135 122 78" fill="none" stroke="#658553" stroke-width="6"/>';
 if(a.shape==='oval')s+='<path d="M120 139 C49 134 41 55 76 29 C126 36 157 91 120 139Z" fill="#96b87b" stroke="#466b48" stroke-width="3"/><path d="M121 138 78 34 M105 110 73 92 M95 83 108 61" fill="none" stroke="#638c5b" stroke-width="3"/><path d="M122 140 C173 142 207 101 193 72 C148 69 118 99 122 140Z" fill="#b3cb91" stroke="#466b48" stroke-width="3"/><path d="m124 139 65-61" stroke="#638c5b" stroke-width="3"/>';
 if(a.shape==='fan')s+='<path d="M120 144 49 75 Q64 29 104 36 L120 54 136 36 Q177 28 194 75Z" fill="#a7c67c" stroke="#52764a" stroke-width="3"/><path d="m120 144-50-76 m50 76-26-93 m26 93 26-93 m-26 93 51-76" stroke="#7b9d5b" stroke-width="3"/>';
 if(a.shape==='needle')s+='<path d="M121 146 64 54 112 111 92 28 125 99 145 25 137 115 187 45 127 152Z" fill="#6b9970" stroke="#466b48" stroke-width="3"/>';
}
if(a.type==='flower'){
 s='<path d="M121 169V93" stroke="#6d955c" stroke-width="6"/><path d="M120 146Q68 140 76 119Q112 116 120 146 M123 151Q165 154 171 127Q134 123 123 151" fill="#a6bd7d" stroke="#709357" stroke-width="2"/>';
 for(let i=0;i<a.petals;i++)s+=`<ellipse cx="120" cy="47" rx="20" ry="30" fill="${a.color}" stroke="#735e5b" stroke-width="2" transform="rotate(${i*360/a.petals} 120 85)"/>`;
 s+='<circle cx="120" cy="85" r="15" fill="#d4a341" stroke="#927634" stroke-width="2"/>';
}
if(a.type==='cat')s=`<path d="M161 162Q211 179 204 130" fill="none" stroke="${a.color}" stroke-width="15"/><ellipse cx="120" cy="151" rx="42" ry="32" fill="${a.color}" stroke="${outline}" stroke-width="3"/><path d="M66 95 65 35 104 60 Q121 55 137 60 L176 35 175 99Z" fill="${a.color}" stroke="${outline}" stroke-width="3"/><ellipse cx="120" cy="100" rx="58" ry="44" fill="${a.color}" stroke="${outline}" stroke-width="3"/><path d="m73 50 3 24 15-9 m73-15-3 24-15-9" fill="#d9a59c"/><path d="m112 110 8 6 8-6Z" fill="#9a625e"/><path d="m120 115-7 8 m7-8 7 8 M71 109 43 103 M72 117 43 121 M169 109 196 103 M168 117 197 122" stroke="${outline}" stroke-width="2"/><ellipse cx="97" cy="97" rx="4" ry="7" fill="${outline}"/><ellipse cx="144" cy="97" rx="4" ry="7" fill="${outline}"/><path d="M94 159v20m49-20v20" stroke="${outline}" stroke-width="3"/>`;
if(a.type==='person'){
 s='<path d="M63 191Q65 147 120 147Q174 147 178 191" fill="#b3c9ba" stroke="#385846" stroke-width="3"/>';
 if(a.hair==='long')s+='<path d="M70 92Q51 25 118 23Q190 23 176 170L151 175 91 175 65 169Z" fill="#51453e"/>';
 s+='<ellipse cx="120" cy="96" rx="49" ry="58" fill="#e7be9d" stroke="#795f4c" stroke-width="2"/><path d="M72 80Q64 27 119 26Q178 25 169 80L151 59 106 57 76 88Z" fill="#51453e"/>';
 s+=`<circle cx="101" cy="95" r="6" fill="${a.eye||'#633e27'}"/><circle cx="140" cy="95" r="6" fill="${a.eye||'#633e27'}"/><path d="M107 126Q121 136 135 126" fill="none" stroke="#985f58" stroke-width="3"/>`;
 if(a.ear==='covered')s+='<path d="M70 92Q56 27 119 23Q184 24 173 93" fill="none" stroke="#8b99b1" stroke-width="10"/><rect x="55" y="80" width="25" height="49" rx="12" fill="#8b99b1"/><rect x="162" y="80" width="25" height="49" rx="12" fill="#8b99b1"/>';
 else s+=`<path d="M74 91Q54 79 59 105Q59 122 74 ${a.ear==='attached'?113:129} M166 91Q186 79 181 105Q181 122 166 ${a.ear==='attached'?113:129}" fill="#e7be9d" stroke="#795f4c" stroke-width="3"/>`;
}
if(a.type==='ear')s=`<path d="M152 25V177" stroke="#8c6e57" stroke-width="4"/><path d="M151 45C59 0 52 148 115 161Q143 172 151 ${a.ear==='attached'?140:122}" fill="#e7be9d" stroke="#8c6e57" stroke-width="4"/><path d="M129 66Q83 42 89 104Q109 82 124 102Q103 123 121 135" fill="none" stroke="#ae8464" stroke-width="4"/>`;
if(a.type==='eyes')s=`<path d="M24 98Q65 52 106 98Q65 131 24 98 M134 98Q175 52 216 98Q175 131 134 98" fill="#fffdf7" stroke="#715c4e" stroke-width="4"/><circle cx="65" cy="96" r="21" fill="${a.color}"/><circle cx="175" cy="96" r="21" fill="${a.color}"/><circle cx="65" cy="96" r="9" fill="#282e2a"/><circle cx="175" cy="96" r="9" fill="#282e2a"/><circle cx="71" cy="89" r="4" fill="white"/><circle cx="181" cy="89" r="4" fill="white"/>`;
if(a.type==='tongue')s=`<path d="M49 65Q120 29 191 65Q183 135 120 140Q57 137 49 65Z" fill="#735250" stroke="#985f58" stroke-width="4"/>${a.rolled?'<path d="M91 92Q92 67 108 84L120 117 133 84Q150 67 150 94L140 155Q120 175 101 155Z" fill="#dc949c" stroke="#a75c6b" stroke-width="4"/><path d="m108 87 12 51 13-51" fill="#9b4f60" stroke="#a75c6b" stroke-width="3"/>':'<path d="M86 93Q120 76 155 93L150 150Q121 178 92 150Z" fill="#dc949c" stroke="#a75c6b" stroke-width="4"/><path d="M121 103v41" stroke="#b66c7a" stroke-width="3"/>'}`;
if(a.type==='thumb')s=`<path d="M81 173V93Q80 72 96 75L110 101 111 67${a.bent?'Q96 35 75 38Q54 35 62 20Q92 9 116 36L136 62':'V30Q111 11 127 12Q143 12 143 30V70'}L146 91Q176 81 178 111L172 171Z" fill="#e7be9d" stroke="#8c6e57" stroke-width="4"/><path d="m113 113 29 5m-27 15 27 3" stroke="#ba9272" stroke-width="3"/>`;
if(a.type==='shirt')s='<path d="m79 42 41 13 41-13 44 48-27 25-20-20v77H82V95l-20 20-27-25Z" fill="#dca779" stroke="#875e43" stroke-width="4"/><path d="M101 49Q120 86 139 49" fill="none" stroke="#875e43" stroke-width="3"/>';
if(a.type==='collection')return wrap('<circle cx="120" cy="98" r="66" fill="#e0ebcd"/><path d="M118 144Q52 118 74 58Q139 57 118 144 M122 144Q187 121 169 80Q126 80 122 144" fill="#8eb07b" stroke="#557d54" stroke-width="3"/><path d="M120 168v-64" stroke="#557d54" stroke-width="4"/><circle cx="178" cy="48" r="20" fill="#eebfc5"/><circle cx="178" cy="48" r="7" fill="#d3ac4b"/>');
if(a.type==='unknown')s='<circle cx="120" cy="100" r="63" fill="#eee9df" stroke="#c5c2b5" stroke-width="3"/><text x="120" y="125" text-anchor="middle" font-family="serif" font-size="82" fill="#8c9484">?</text>';
return wrap(s);
}
