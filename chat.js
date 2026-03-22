// @charset "UTF-8";
// chat.js — 澳洲冒險即時聊天室
// 依賴主程式：rtdb, currentUser, isAdmin, showToast, esc, uploadToCloudinary, openLightbox
(function() {

var _st = document.createElement('style');
_st.textContent = "/* \u2500\u2500 FAB button \u2500\u2500 */\n#chat-fab{position:fixed;bottom:10%;right:2.5%;z-index:200;width:60px;height:60px;border-radius:50%;background:#D4650A;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(212,101,10,.4);border:none;font-family:'Nunito',sans-serif;}\n#chat-fab:hover{background:#A84D08;transform:scale(1.06);}\n#chat-badge-dot{position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:#e74c3c;border:2px solid #fff;}\n/* \u2500\u2500 Chat window \u2500\u2500 */\n#chat-float{position:fixed;bottom:calc(10% + 72px);right:2.5%;width:340px;max-width:94vw;border-radius:16px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.22);flex-direction:column;z-index:198;overflow:hidden;display:none;}\n#chat-float.cf-open{display:flex;animation:cfIn .22s ease;}\n@keyframes cfIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}\n/* \u2500\u2500 Size variants \u2500\u2500 */\n#chat-float.cf-sm #cf-msgs{min-height:120px;max-height:200px;}\n#chat-float.cf-sm{height:280px;}\n#chat-float.cf-md{height:420px;}\n#chat-float.cf-lg{height:600px;max-height:calc(85vh - 72px);}\n#chat-float.cf-fullscreen{position:fixed;top:2%;left:2%;right:2%;bottom:2%;width:auto;height:auto;border-radius:16px;z-index:299;}\n/* \u2500\u2500 Messages area \u2500\u2500 */\n#cf-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:4px;background:#f9f8ff;min-height:180px;}\n#cf-msgs::-webkit-scrollbar{width:3px;}\n#cf-msgs::-webkit-scrollbar-thumb{background:#c8c2f5;border-radius:3px;}\n.cf-sys{text-align:center;font-size:11px;color:#888;font-weight:600;padding:4px 0;}\n.cf-date-sep{text-align:center;font-size:10px;color:#bbb;margin:6px 0;}\n/* \u2500\u2500 Message rows \u2500\u2500 */\n.cf-row{display:flex;align-items:flex-end;gap:6px;max-width:84%;}\n.cf-row.me{flex-direction:row-reverse;align-self:flex-end;max-width:88%;}\n.cf-av{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid #e0dcff;}\n.cf-bubble-wrap{display:flex;flex-direction:column;gap:2px;align-items:flex-start;min-width:0;}\n.cf-uname{font-size:10px;font-weight:700;color:#7a72cc;padding:0 4px;}\n.cf-bubble{padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.6;word-break:break-word;font-family:'Nunito',sans-serif;}\n.cf-bubble.other{background:#fff;color:#222;border:1px solid #e0dcff;border-bottom-left-radius:3px;}\n.cf-bubble.me{background:#D4650A;color:#fff;border-bottom-right-radius:3px;}\n.cf-time{font-size:10px;opacity:.55;padding:0 4px;white-space:nowrap;}\n/* \u2500\u2500 Recall / delete \u2500\u2500 */\n.cf-action-btn{background:#f5edd8;border:1.5px solid #c4844a;border-radius:20px;cursor:pointer;font-size:10px;font-weight:700;color:#a84d08;padding:1px 7px;font-family:'Nunito',sans-serif;}\n.cf-action-btn:hover{background:#a84d08;color:#fff;border-color:#a84d08;}\n.cf-row.me .cf-action-btn{background:#fff3;border-color:#fff5;color:#fff;}\n.cf-row.me .cf-action-btn:hover{background:#fff;color:#a84d08;}\n.cf-recalled{font-style:italic;opacity:.5;font-size:12px;}\n.cf-recalled-admin{font-size:12px;}\n.cf-recalled-badge{background:#e74c3c;color:#fff;font-size:9px;font-weight:800;border-radius:4px;padding:1px 4px;margin-right:4px;}\n/* \u2500\u2500 Image messages \u2500\u2500 */\n.cf-img-msg{max-width:200px;border-radius:10px;cursor:pointer;display:block;margin-top:4px;}\n.cf-img-msg:hover{opacity:.88;}\n/* \u2500\u2500 Guest bar \u2500\u2500 */\n#cf-guest-bar{padding:6px 12px;background:#f0eeff;border-bottom:1px solid #e0dcff;display:flex;align-items:center;gap:8px;flex-shrink:0;}\n.cf-gb-btn{padding:4px 10px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:'Nunito',sans-serif;}\n/* \u2500\u2500 Responsive \u2500\u2500 */\n@media(min-width:701px){#chat-float:not(.cf-sm):not(.cf-md):not(.cf-lg):not(.cf-fullscreen){height:calc(75vh - 72px);}}\n@media(max-width:700px){#chat-float{width:calc(100vw - 16px);}#chat-float:not(.cf-sm):not(.cf-md):not(.cf-lg):not(.cf-fullscreen){height:calc(70vh - 72px);}}";
document.head.appendChild(_st);

var cfChatListener = null;
var cfChatQuery    = null;
var cfUnreadCount  = 0;
var cfFullscreen   = false;
var _chatWired     = false;
var _isSendingMsg  = false;

var _wrap = document.createElement('div');
_wrap.innerHTML = "<!-- chat-fab -->\n<div id=\"chat-fab\" onclick=\"chatToggle()\">\n  <span style=\"font-size:22px;line-height:1\">\ud83d\udcac</span>\n  <span style=\"font-size:10px;font-weight:800;letter-spacing:.5px\">\u804a\u5929</span>\n  <span id=\"chat-badge-dot\" style=\"display:none;position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:#e74c3c;border:2px solid #fff\"></span>\n</div>\n\n<!-- chat-float -->\n<div id=\"chat-float\">\n  <div style=\"background:linear-gradient(90deg,#5C3317,#A84D08);padding:10px 12px;display:flex;align-items:center;gap:8px;flex-shrink:0\">\n    <img src=\"https://ui-avatars.com/api/?name=AU&background=d4650a&color=fff\" style=\"width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,.3);flex-shrink:0\">\n    <div style=\"flex:1;min-width:0\">\n      <div style=\"font-weight:800;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">\ud83e\udd98 \u6fb3\u6d32\u5192\u96aa\u5373\u6642\u804a\u5929\u5ba4</div>\n      <div style=\"font-size:10px;color:rgba(255,255,255,.8);display:flex;align-items:center;gap:4px\">\n        <span style=\"width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block\"></span>\n        LIVE \u00b7 \u820716\u4f4d\u898b\u7fd2\u6559\u5e2b\u5373\u6642\u4e92\u52d5\n      </div>\n    </div>\n    <div style=\"display:flex;gap:3px;flex-shrink:0\">\n      <button onclick=\"cfSetSize('sm')\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'Nunito',sans-serif;font-weight:700\">\u5c0f</button>\n      <button onclick=\"cfSetSize('md')\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'Nunito',sans-serif;font-weight:700\">\u4e2d</button>\n      <button onclick=\"cfSetSize('lg')\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'Nunito',sans-serif;font-weight:700\">\u5927</button>\n      <button onclick=\"cfToggleFullscreen()\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'Nunito',sans-serif;font-weight:700\">\u5168</button>\n      <button onclick=\"chatToggle()\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:14px;line-height:1\">\u00d7</button>\n    </div>\n  </div>\n  <div id=\"cf-guest-bar\" style=\"display:none\">\n    <span style=\"font-size:14px\">\ud83d\udc4b</span>\n    <span id=\"cf-name-display\" style=\"flex:1;font-size:12px;font-weight:700;color:#5c3317;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\">\u4ee5\u8a2a\u5ba2\u8eab\u5206\u804a\u5929</span>\n    <button onclick=\"cfChangeGuestName()\" class=\"cf-gb-btn\" style=\"background:#f5edd8;color:#5c3317\">\u6539\u540d</button>\n    <button onclick=\"openLoginModal()\" class=\"cf-gb-btn\" style=\"background:#2d5a27;color:#fff\">\u767b\u5165</button>\n  </div>\n  <div id=\"cf-msgs\">\n    <div class=\"cf-sys\">\ud83d\udcac \u6b61\u8fce\u4f86\u5230\u6fb3\u6d32\u5192\u96aa\u5373\u6642\u804a\u5929\u5ba4\uff01<br>\u96d6\u7136\u4f60\u6c92\u6709\u89aa\u81e8\u73fe\u5834\uff0c\u4f46\u6211\u5011\u5728\u7dda\u4e0a\u7b49\u4f60 \ud83e\udd98</div>\n  </div>\n  <div style=\"padding:9px 11px;border-top:1px solid #ede9ff;background:#fff;display:flex;align-items:flex-end;gap:6px;flex-shrink:0\">\n    <img id=\"cf-my-av\" src=\"https://ui-avatars.com/api/?name=\u8a2a&background=8b5e3c&color=fff\" style=\"width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0\">\n    <textarea id=\"cf-input\" placeholder=\"\u8f38\u5165\u8a0a\u606f\u2026 Shift+Enter \u63db\u884c\" rows=\"1\" style=\"flex:1;border:1px solid #d0c8ff;border-radius:20px;padding:7px 12px;font-family:'Nunito',sans-serif;font-size:13px;outline:none;resize:none;min-height:34px;max-height:100px;overflow-y:auto;background:#faf9ff;line-height:1.4;color:#222\"></textarea>\n    <button onclick=\"document.getElementById('cf-img-input').click()\" style=\"background:none;border:none;cursor:pointer;font-size:18px;padding:4px;color:#a09ae0;flex-shrink:0\">\ud83d\uddbc</button>\n    <input type=\"file\" id=\"cf-img-input\" accept=\"image/*\" multiple style=\"display:none\">\n    <button id=\"cf-send\" style=\"width:34px;height:34px;border-radius:50%;background:#D4650A;color:#fff;border:none;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0\">\u27a4</button>\n  </div>\n</div>";
document.body.appendChild(_wrap);

function chatToggle(){
  var win=document.getElementById('chat-float'),fab=document.getElementById('chat-fab');
  var isOpen=win.classList.contains('cf-open');
  if(isOpen){win.classList.remove('cf-open');setTimeout(function(){win.style.display='none';},250);if(fab)fab.classList.remove('cf-active');}
  else{win.style.display='flex';requestAnimationFrame(function(){win.classList.add('cf-open');});if(fab)fab.classList.add('cf-active');cfUnreadCount=0;updateChatBadge();initChat();setTimeout(function(){var m=document.getElementById('cf-msgs');if(m)m.scrollTop=m.scrollHeight;},100);}
}

function cfSetSize(sz){var win=document.getElementById('chat-float');if(!win)return;win.classList.remove('cf-sm','cf-md','cf-lg');win.classList.add('cf-'+sz);}

function cfToggleFullscreen(){var win=document.getElementById('chat-float');if(!win)return;cfFullscreen=!cfFullscreen;win.classList.toggle('cf-fullscreen',cfFullscreen);}

function updateChatBadge(){
  var dot=document.getElementById('chat-badge-dot'),nb=document.getElementById('chat-badge');
  if(dot)dot.style.display=cfUnreadCount>0?'block':'none';
  if(nb){nb.textContent=cfUnreadCount>0?cfUnreadCount:'';nb.style.display=cfUnreadCount>0?'inline':'none';}
}

function initChat(){
  if(cfChatListener&&cfChatQuery){try{cfChatQuery.off('value',cfChatListener);}catch(e){}cfChatListener=null;cfChatQuery=null;}
  if(!rtdb){return;}
  updateCfUserBar();
  cfChatQuery=rtdb.ref('chat').orderByChild('timestamp').limitToLast(80);
  var handler=function(snap){
    try{var msgs=[];if(snap&&typeof snap.forEach==='function')snap.forEach(function(c){try{var v=c.val();if(v)msgs.push(Object.assign({id:c.key},v));}catch(e){}});renderCfMessages(msgs);}
    catch(e){console.warn('Chat render:',e);}
  };
  cfChatListener=handler;
  cfChatQuery.on('value',handler,function(err){console.warn('Chat listener:',err);});
}

function renderCfMessages(msgs){
  var container=document.getElementById('cf-msgs');if(!container)return;
  var myUid=currentUser?currentUser.uid:sessionStorage.getItem('guestUid');
  var myGuestUid=sessionStorage.getItem('guestUid');
  var wasAtBottom=container.scrollHeight-container.scrollTop-container.clientHeight<100;
  var isOpen=document.getElementById('chat-float')?document.getElementById('chat-float').classList.contains('cf-open'):false;
  var html='<div class="cf-sys">💬 歡迎來到澳洲冒險即時聊天室！<br>雖然你沒有親臨現場，但我們在線上等你 🦘</div>';
  var lastDate='';
  msgs.forEach(function(msg){
    var isMe=!!(myUid&&(msg.uid===myUid||(myGuestUid&&msg.uid===myGuestUid)));
    var d=msg.timestamp?new Date(msg.timestamp):new Date();
    var ds=d.toLocaleDateString('zh-TW',{month:'numeric',day:'numeric'});
    if(ds!==lastDate){lastDate=ds;html+='<div class="cf-date-sep">— '+ds+' —</div>';}
    var time=d.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'});
    var av=msg.userPhoto||'https://ui-avatars.com/api/?name='+encodeURIComponent(msg.userName||'U')+'&background='+(isMe?'d4650a':'8b5e3c')+'&color=fff';
    var content='';
    if(msg.recalled)content=isAdmin?'<span class="cf-recalled-admin"><span class="cf-recalled-badge">已收回</span> '+esc(msg.text||'')+'</span>':'<span class="cf-recalled">⚠️ 此訊息已收回</span>';
    else if(msg.imageURL)content='<img src="'+msg.imageURL+'" class="cf-img-msg" onclick="openLightbox(0,[{url:\''+msg.imageURL+'\',info:\'\'}],false)">';
    else content=esc(msg.text||'');
    var actions='';
    if(isMe&&!msg.recalled)actions+='<button onclick="cfRecallMsg(\''+msg.id+'\')" class="cf-action-btn">↩ 收回</button>';
    if(isAdmin&&!msg.recalled)actions+=' <button onclick="cfDeleteMsg(\''+msg.id+'\')" class="cf-action-btn" style="background:#fff;border-color:#e74c3c;color:#e74c3c">🗑</button>';
    html+='<div class="cf-row '+(isMe?'me':'')+'" data-msgid="'+msg.id+'">'
      +(!isMe?'<img src="'+av+'" class="cf-av" onerror="this.src=\'https://ui-avatars.com/api/?name=U&background=8b5e3c&color=fff\'">':'')
      +'<div class="cf-bubble-wrap" style="'+(isMe?'align-items:flex-end':'')+'">'
      +(!isMe?'<div class="cf-uname">'+esc(msg.userName||'')+'</div>':'')
      +'<div class="cf-bubble '+(isMe?'me':'other')+'">'+content+'</div>'
      +'<div style="display:flex;align-items:center;'+(isMe?'justify-content:flex-end;':'')+'gap:6px;padding:0 2px">'
      +(isMe?actions+'<span class="cf-time" style="padding:0">'+time+'</span>':'<span class="cf-time" style="padding:0">'+time+'</span>'+actions)
      +'</div></div>'
      +(isMe?'<img src="'+(currentUser&&currentUser.photoURL?currentUser.photoURL:av)+'" class="cf-av" onerror="this.src=\'https://ui-avatars.com/api/?name=U&background=d4650a&color=fff\'">':'')
      +'</div>';
  });
  container.innerHTML=html;
  if(!isOpen){cfUnreadCount++;updateChatBadge();}
  if(wasAtBottom||isOpen)container.scrollTop=container.scrollHeight;
}

function updateCfUserBar(){
  var bar=document.getElementById('cf-guest-bar'),nameEl=document.getElementById('cf-name-display'),avEl=document.getElementById('cf-my-av');
  if(currentUser){if(bar)bar.style.display='none';if(avEl)avEl.src=currentUser.photoURL||'https://ui-avatars.com/api/?name='+encodeURIComponent(currentUser.displayName||'U')+'&background=d4650a&color=fff';}
  else{if(bar)bar.style.display='flex';var gn=sessionStorage.getItem('guestName')||'訪客';if(nameEl)nameEl.textContent='以「'+gn+'」聊天';if(avEl)avEl.src='https://ui-avatars.com/api/?name='+encodeURIComponent(gn)+'&background=8b5e3c&color=fff';}
}

function wireCfInput(){
  if(_chatWired)return; _chatWired=true;
  var input=document.getElementById('cf-input'),sendBtn=document.getElementById('cf-send'),imgInput=document.getElementById('cf-img-input');
  if(!input||!sendBtn)return;
  input.addEventListener('keydown',function(e){if(e.isComposing)return;if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();cfSendMessage();}});
  input.addEventListener('input',function(){input.style.height='auto';input.style.height=Math.min(input.scrollHeight,100)+'px';});
  sendBtn.onclick=cfSendMessage;
  if(imgInput)imgInput.onchange=async function(e){
    for(var i=0;i<e.target.files.length;i++){
      var file=e.target.files[i];
      var btn=document.getElementById('cf-send');if(btn){btn.textContent='⏳';btn.disabled=true;}
      try{
        var url=await uploadToCloudinary(file);
        var uN,uP,uid;
        if(currentUser){uN=sessionStorage.getItem('profileNickname')||currentUser.displayName||currentUser.email;uP=currentUser.photoURL||'';uid=currentUser.uid;}
        else{var gn=sessionStorage.getItem('guestName')||'訪客';uN=gn+' 👋';uP='';uid=sessionStorage.getItem('guestUid')||'guest_'+Math.random().toString(36).slice(2,8);sessionStorage.setItem('guestUid',uid);}
        await rtdb.ref('chat').push({uid:uid,userName:uN,userPhoto:uP,text:'',imageURL:url,timestamp:Date.now()});
      }catch(err){showToast('圖片上傳失敗','error');}
      finally{var b2=document.getElementById('cf-send');if(b2){b2.textContent='➤';b2.disabled=false;}}
    }
    e.target.value='';
  };
}

async function cfSendMessage(){
  if(_isSendingMsg)return;
  var input=document.getElementById('cf-input');var text=input?input.value.trim():'';if(!text||!rtdb)return;
  _isSendingMsg=true; if(input){input.value='';input.style.height='';}
  var uN,uP,uid;
  if(currentUser){uN=sessionStorage.getItem('profileNickname')||currentUser.displayName||currentUser.email;uP=currentUser.photoURL||'';uid=currentUser.uid;}
  else{var gn=sessionStorage.getItem('guestName');if(!gn){gn=prompt('請輸入你的暱稱（訪客）：','');if(gn===null){_isSendingMsg=false;return;}gn=gn.trim().slice(0,20)||'訪客';sessionStorage.setItem('guestName',gn);updateCfUserBar();}uN=gn+' 👋';uP='';uid=sessionStorage.getItem('guestUid')||'guest_'+Math.random().toString(36).slice(2,8);sessionStorage.setItem('guestUid',uid);}
  try{await rtdb.ref('chat').push({uid:uid,userName:uN,userPhoto:uP,text:text,timestamp:Date.now()});}
  catch(e){showToast('發送失敗：'+e.message,'error');}
  finally{_isSendingMsg=false;}
}

async function cfRecallMsg(id){if(!rtdb)return;try{await rtdb.ref('chat/'+id).update({recalled:true});showToast('訊息已收回','success');}catch(e){showToast('收回失敗','error');}}

async function cfDeleteMsg(id){if(!isAdmin||!rtdb)return;try{await rtdb.ref('chat/'+id).remove();}catch(e){showToast('刪除失敗','error');}}

async function cfChangeGuestName(){var n=prompt('輸入新暱稱：',sessionStorage.getItem('guestName')||'訪客');if(!n)return;sessionStorage.setItem('guestName',n.trim().slice(0,20)||'訪客');updateCfUserBar();}

async function clearAllChat(){if(!isAdmin||!rtdb)return;if(!confirm('確定清空所有聊天記錄？'))return;try{await rtdb.ref('chat').remove();showToast('聊天已清空','success');}catch(e){showToast('清空失敗','error');}}


function _chatInit() { wireCfInput(); }
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _chatInit);
} else {
  _chatInit();
}

window.chatToggle         = chatToggle;
window.cfSetSize          = cfSetSize;
window.cfToggleFullscreen = cfToggleFullscreen;
window.cfSendMessage      = cfSendMessage;
window.cfRecallMsg        = cfRecallMsg;
window.cfDeleteMsg        = cfDeleteMsg;
window.cfChangeGuestName  = cfChangeGuestName;
window.clearAllChat       = clearAllChat;
window.initChat           = initChat;
window.updateCfUserBar    = updateCfUserBar;
window.updateChatBadge    = updateChatBadge;

})();
