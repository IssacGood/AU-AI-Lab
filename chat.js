// @charset "UTF-8";
// chat.js — 澳洲冒險即時聊天室
// IIFE 封裝，依賴主程式提供：rtdb, uploadToCloudinary, openLightbox, showToast, esc
(function() {

// ── CSS ──
var css = "#chat-fab-dot{position:fixed;bottom:calc(10% + 66px);right:calc(2.5% + 52px);width:12px;height:12px;background:#4ade80;border-radius:50%;border:2px solid #fff;z-index:100000;box-shadow:0 0 0 0 rgba(74,222,128,.5);animation:chatPulse 2s infinite}\n#chat-fab{position:fixed;bottom:10%;right:2.5%;width:68px;height:68px;border-radius:50%;background:var(--primary);border:none;cursor:pointer;box-shadow:0 4px 16px rgba(212,101,10,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;z-index:99999;transition:all .2s}\n#chat-fab:hover{background:var(--primary-dark);transform:scale(1.06)}\n#chat-fab-icon{font-size:28px;line-height:1}\n#chat-fab-label{color:#fff;font-size:10px;font-weight:800;letter-spacing:.5px;font-family:'Nunito',sans-serif}\n#chat-fab-unread{position:absolute;top:-2px;right:-2px;background:#e74c3c;color:#fff;border-radius:50%;width:20px;height:20px;font-size:11px;font-weight:800;display:none;align-items:center;justify-content:center;border:2px solid #fff;font-family:'Nunito',sans-serif}\n#chat-float{position:fixed;bottom:calc(10% + 80px);right:2.5%;width:340px;border-radius:16px;background:#fff;border:1px solid #ddd8ff;box-shadow:0 8px 32px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;z-index:99998;font-family:'Nunito',sans-serif}\n#chat-float.cf-open{display:flex;animation:cfIn .25s ease}\n@keyframes cfIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}\n#cf-hdr{background:var(--primary);padding:12px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}\n#cf-hdr-av{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}\n#cf-hdr-info{flex:1;min-width:0}\n#cf-hdr-name{font-size:14px;font-weight:700;color:#fff;font-family:'Nunito',sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#cf-hdr-status{font-size:11px;color:rgba(255,255,255,.85);margin-top:1px;display:flex;align-items:center;gap:4px}\n.cf-live-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;animation:chatPulse 2s infinite;flex-shrink:0}\n.cf-hdr-actions{display:flex;align-items:center;gap:4px}\n.cf-size-btn{background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'Nunito',sans-serif;font-weight:700;transition:background .15s}\n.cf-size-btn:hover{background:rgba(255,255,255,.35)}\n.cf-icon-btn{background:rgba(255,255,255,.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0}\n.cf-icon-btn:hover{background:rgba(255,255,255,.35)}\n#cf-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;background:#f5f4ff;scroll-behavior:smooth}\n#cf-msgs::-webkit-scrollbar{width:3px}\n#cf-msgs::-webkit-scrollbar-thumb{background:#c8c2f5;border-radius:3px}\n.cf-sys{text-align:center;font-size:11px;color:#888;font-weight:600;padding:2px 0}\n.cf-row{display:flex;align-items:flex-end;gap:6px;max-width:82%}\n.cf-row.me{flex-direction:row-reverse;align-self:flex-end;max-width:88%}\n.cf-av{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid #e0dcff;margin-bottom:2px}\n.cf-av-placeholder{width:24px;height:24px;border-radius:50%;background:#e0dcff;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-bottom:2px;color:#5a4fcf;font-weight:700}\n.cf-bubble-wrap{display:flex;flex-direction:column;gap:2px;align-items:flex-start;min-width:0;width:100%}\n.cf-name{font-size:10px;font-weight:700;color:#7a72cc;padding:0 4px}\n.cf-row.me .cf-name{display:none}\n.cf-bubble{padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.6;word-break:normal;overflow-wrap:anywhere;white-space:pre-wrap;display:inline-block;max-width:100%}\n.cf-bubble.other{background:#fff;color:#222;border:1px solid #e0dcff;border-bottom-left-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.06)}\n.cf-bubble.me{background:var(--primary);color:#fff;border-bottom-right-radius:3px}\n.cf-time{font-size:10px;opacity:.55;padding:0 4px;align-self:flex-end;white-space:nowrap}\n#cf-footer{padding:9px 11px;border-top:1px solid #ede9ff;background:#fff;display:flex;gap:8px;align-items:flex-end;flex-shrink:0}\n#cf-my-av{width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--primary-light)}\n#cf-input{flex:1;border:1px solid #d0c8ff;border-radius:20px;padding:7px 13px;font-family:'Nunito',sans-serif;font-size:13px;outline:none;resize:none;min-height:34px;max-height:100px;line-height:1.4;color:#222;transition:border-color .2s;background:#fff}\n#cf-input:focus{border-color:var(--primary)}\n#cf-send{width:34px;height:34px;border-radius:50%;background:var(--primary);border:none;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}\n#cf-send:hover{background:var(--primary-dark);transform:scale(1.06)}\n#cf-guest-bar{padding:6px 12px;background:#f0eeff;border-bottom:1px solid #e0dcff;display:flex;align-items:center;gap:8px;flex-shrink:0;font-size:12px;color:#5a4fcf;font-weight:600}\n#cf-guest-bar .cf-gb-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.cf-gb-btn{background:var(--primary);color:#fff;border:none;border-radius:8px;padding:3px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif}\n  #chat-float{height:calc(75vh - 80px)}\n  #chat-float{height:calc(70vh - 80px)}\n  #chat-fab{bottom:10%;right:2.5%;width:68px;height:68px}\n  #chat-float{\n  #chat-float.cf-open{animation:cfInMobile .28s cubic-bezier(.22,1,.36,1)}\n  @keyframes cfInMobile{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}\n#chat-float.cf-fullscreen{\n  #chat-float.cf-fullscreen{\n.cf-img-msg{max-width:220px;border-radius:12px;cursor:pointer;display:block;margin-top:4px;border:2px solid rgba(255,255,255,.3)}\n.cf-img-msg:hover{opacity:.88}\n.cf-recalled{font-style:italic;opacity:.55;font-size:12px}\n.cf-recalled-admin{font-size:12px;background:rgba(231,76,60,.08);border:1px dashed #e74c3c!important;border-radius:8px;padding:6px 10px!important}\n.cf-recalled-badge{background:#e74c3c;color:#fff;font-size:10px;font-weight:800;border-radius:6px;padding:1px 6px;margin-left:6px;vertical-align:middle}\n#cf-img-btn{background:none;border:none;cursor:pointer;font-size:18px;padding:4px 6px;color:#a09ae0;transition:color .2s;flex-shrink:0;align-self:center}\n#cf-img-btn:hover{color:var(--primary)}\n#cf-img-input{display:none}\n.cf-actions{display:inline-flex;gap:4px;margin-left:6px;vertical-align:middle}\n.cf-action-btn{background:#f5edd8;border:1.5px solid #c4844a;border-radius:20px;cursor:pointer;font-size:11px;font-weight:800;padding:4px 10px;color:#a84d08;font-family:'Nunito',sans-serif;transition:all .2s;white-space:nowrap;display:inline-flex;align-items:center;gap:3px}\n.cf-action-btn:hover{background:#a84d08;color:#fff;border-color:#a84d08}\n.cf-del-btn:hover{background:#e74c3c!important;color:#fff!important;border-color:#e74c3c!important}\n.cf-row.me .cf-action-btn{background:#fff;border-color:#fff;color:#d4650a;font-weight:800}\n.cf-row.me .cf-action-btn:hover{background:#f5edd8;border-color:#f5edd8;color:#a84d08}\n.cf-header{\n.cf-hbtn{\n.cf-hbtn:hover{background:rgba(255,255,255,.38);}\n.cf-guest-bar{";
var _st = document.createElement('style');
_st.textContent = css;
document.head.appendChild(_st);

// ── Module state ──
var cfChatListener = null;
var cfChatQuery    = null;
var cfUnreadCount  = 0;
var cfFullscreen   = false;
var _chatWired     = false;
var _isSendingMsg  = false;

// ── Inject HTML ──
var _wrap = document.createElement('div');
_wrap.innerHTML = "<!-- \u2500\u2500 FLOATING CHAT FAB \u2500\u2500 -->\n<div id=\"chat-fab\" onclick=\"chatToggle()\" style=\"position:fixed;bottom:10%;right:2.5%;z-index:200;width:60px;height:60px;border-radius:50%;background:#D4650A;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(212,101,10,.4);font-size:20px;border:none\">\n  \ud83d\udcac\n  <span style=\"font-size:10px;font-weight:800;margin-top:1px\">\u804a\u5929</span>\n  <span id=\"chat-badge-dot\" style=\"position:absolute;top:6px;right:6px;width:10px;height:10px;border-radius:50%;background:#e74c3c;border:2px solid #fff;display:none\"></span>\n</div>\n\n<!-- \u2500\u2500 FLOATING CHAT WINDOW \u2500\u2500 -->\n<div id=\"chat-float\" style=\"display:none;position:fixed;bottom:calc(10% + 72px);right:2.5%;width:340px;max-width:94vw;border-radius:16px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.22);flex-direction:column;z-index:198;overflow:hidden;max-height:calc(80vh - 72px)\">\n\n  <!-- Header: all inline so no CSS class needed -->\n  <div style=\"display:flex;align-items:center;gap:8px;padding:10px 12px;background:linear-gradient(90deg,#5C3317,#A84D08);flex-shrink:0\">\n    <img src=\"https://ui-avatars.com/api/?name=AU&background=d4650a&color=fff\" style=\"width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,.3)\">\n    <div style=\"flex:1;min-width:0\">\n      <div style=\"font-weight:800;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">\ud83e\udd98 \u6fb3\u6d32\u5192\u96aa\u5373\u6642\u804a\u5929\u5ba4</div>\n      <div style=\"font-size:10px;color:rgba(255,255,255,.8);display:flex;align-items:center;gap:4px\">\n        <span style=\"width:7px;height:7px;border-radius:50%;background:#4caf50;display:inline-block;animation:pulse 2s infinite\"></span>\n        LIVE \u00b7 \u820716\u4f4d\u898b\u7fd2\u6559\u5e2b\u5373\u6642\u4e92\u52d5\n      </div>\n    </div>\n    <div style=\"display:flex;gap:3px;flex-shrink:0\">\n      <button onclick=\"cfSetSize('sm')\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:700\">\u5c0f</button>\n      <button onclick=\"cfSetSize('md')\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:700\">\u4e2d</button>\n      <button onclick=\"cfSetSize('lg')\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:700\">\u5927</button>\n      <button onclick=\"cfToggleFullscreen()\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:13px\">\u26f6</button>\n      <button onclick=\"chatToggle()\" style=\"background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:14px\">\u2715</button>\n    </div>\n  </div>\n\n  <!-- Guest bar -->\n  <div id=\"cf-guest-bar\" style=\"display:none;align-items:center;gap:8px;padding:8px 12px;background:#f5f0ff;border-bottom:1px solid #ede9ff\">\n    <span style=\"font-size:14px\">\ud83d\udc4b</span>\n    <span id=\"cf-name-display\" style=\"flex:1;font-size:12px;font-weight:700;color:#5c3317\">\u4ee5\u8a2a\u5ba2\u8eab\u5206\u804a\u5929</span>\n    <button onclick=\"cfChangeGuestName()\" style=\"padding:4px 10px;background:#f5edd8;border:1px solid #d4b896;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;color:#5c3317;font-family:'Nunito',sans-serif\">\u6539\u540d</button>\n    <button onclick=\"openLoginModal()\" style=\"padding:4px 10px;background:#2d5a27;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;color:#fff;font-family:'Nunito',sans-serif\">\u767b\u5165</button>\n  </div>\n\n  <!-- Messages -->\n  <div id=\"cf-msgs\" style=\"flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:4px;background:#f9f8ff;min-height:200px\">\n    <div class=\"cf-sys\">\ud83d\udcac \u6b61\u8fce\u4f86\u5230\u6fb3\u6d32\u5192\u96aa\u5373\u6642\u804a\u5929\u5ba4\uff01<br>\u96d6\u7136\u4f60\u6c92\u6709\u89aa\u81e8\u73fe\u5834\uff0c\u4f46\u6211\u5011\u5728\u7dda\u4e0a\u7b49\u4f60 \ud83e\udd98</div>\n  </div>\n\n  <!-- Input area -->\n  <div style=\"padding:9px 11px;border-top:1px solid #ede9ff;background:#fff;display:flex;align-items:flex-end;gap:6px;flex-shrink:0\">\n    <img id=\"cf-my-av\" src=\"https://ui-avatars.com/api/?name=\u8a2a&background=8b5e3c&color=fff\" style=\"width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0\">\n    <textarea id=\"cf-input\" placeholder=\"\u8f38\u5165\u8a0a\u606f\u2026 Shift+Enter \u63db\u884c\" rows=\"1\" style=\"flex:1;border:1px solid #d0c8ff;border-radius:20px;padding:7px 12px;font-family:'Nunito',sans-serif;font-size:13px;outline:none;resize:none;min-height:34px;max-height:100px;overflow-y:auto;background:#faf9ff;line-height:1.4\"></textarea>\n    <button onclick=\"document.getElementById('cf-img-input').click()\" style=\"width:30px;height:30px;border:none;background:transparent;cursor:pointer;font-size:17px;padding:0;display:flex;align-items:center;justify-content:center\">\ud83d\uddbc</button>\n    <input type=\"file\" id=\"cf-img-input\" accept=\"image/*\" multiple style=\"display:none\">\n    <button id=\"cf-send\" style=\"width:34px;height:34px;border-radius:50%;background:#D4650A;color:#fff;border:none;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0\">\u27a4</button>\n  </div>\n</div>";
document.body.appendChild(_wrap);

// ── Functions ──
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


// ── Init ──
function _chatInit() { wireCfInput(); }
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _chatInit);
} else {
  _chatInit();
}

// ── Expose globals for onclick handlers ──
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
