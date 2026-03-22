// @charset "UTF-8";
// chat.js — 澳洲冒險即時聊天室
// 依賴主程式：rtdb, currentUser, isAdmin, showToast, esc, uploadToCloudinary, openLightbox
(function () {

// ── CSS ──
var css = [
  /* FAB */
  "#chat-fab{position:fixed;bottom:10%;right:2.5%;z-index:200;width:60px;height:60px;border-radius:50%;background:#D4650A;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(212,101,10,.4);border:none;font-family:'Nunito',sans-serif}",
  "#chat-fab:hover{background:#A84D08;transform:scale(1.06)}",
  "#chat-badge-dot{position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:#e74c3c;border:2px solid #fff;display:none}",
  /* Window */
  "#chat-float{position:fixed;bottom:calc(10% + 72px);right:2.5%;width:340px;max-width:94vw;border-radius:16px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.22);flex-direction:column;z-index:198;overflow:hidden;display:none;height:calc(75vh - 72px)}",
  "#chat-float.cf-open{display:flex;animation:cfIn .22s ease}",
  "@keyframes cfIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}",
  /* Font size variants (小中大) */
  "#chat-float.cf-font-sm .cf-bubble{font-size:11px}",
  "#chat-float.cf-font-lg .cf-bubble{font-size:17px}",
  /* Fullscreen */
  "#chat-float.cf-fullscreen{position:fixed;top:0;left:0;right:0;bottom:0;width:100%;max-width:100%;height:100%;border-radius:0;z-index:9999}",
  /* Messages */
  "#cf-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:4px;background:#f9f8ff}",
  "#cf-msgs::-webkit-scrollbar{width:3px}#cf-msgs::-webkit-scrollbar-thumb{background:#c8c2f5;border-radius:3px}",
  ".cf-sys{text-align:center;font-size:11px;color:#888;font-weight:600;padding:4px 0}",
  ".cf-date-sep{text-align:center;font-size:10px;color:#bbb;margin:6px 0}",
  ".cf-row{display:flex;align-items:flex-end;gap:6px;max-width:84%}",
  ".cf-row.me{flex-direction:row-reverse;align-self:flex-end;max-width:88%}",
  ".cf-av{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid #e0dcff}",
  ".cf-bubble-wrap{display:flex;flex-direction:column;gap:2px;align-items:flex-start;min-width:0}",
  ".cf-uname{font-size:10px;font-weight:700;color:#7a72cc;padding:0 4px}",
  ".cf-bubble{padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.6;word-break:break-word;font-family:'Nunito',sans-serif}",
  ".cf-bubble.other{background:#fff;color:#222;border:1px solid #e0dcff;border-bottom-left-radius:3px}",
  ".cf-bubble.me{background:#D4650A;color:#fff;border-bottom-right-radius:3px}",
  ".cf-time{font-size:10px;opacity:.55;padding:0 4px;white-space:nowrap}",
  /* Action buttons — both recall & delete look like clear circles */
  ".cf-action-btn{width:26px;height:26px;border-radius:50%;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;padding:0;flex-shrink:0;font-family:'Nunito',sans-serif;transition:all .15s}",
  ".cf-recall-btn{border:2px solid #D4650A;color:#D4650A;font-size:13px;font-weight:900}",
  ".cf-recall-btn:hover{background:#D4650A;color:#fff}",
  ".cf-del-btn{border:2px solid #e74c3c;color:#e74c3c}",
  ".cf-del-btn:hover{background:#e74c3c;color:#fff}",
  ".cf-row.me .cf-recall-btn{border-color:rgba(255,255,255,.7);color:rgba(255,255,255,.9)}",
  ".cf-row.me .cf-recall-btn:hover{background:rgba(255,255,255,.3)}",
  ".cf-recalled{font-style:italic;opacity:.5;font-size:12px}",
  ".cf-recalled-badge{background:#e74c3c;color:#fff;font-size:9px;font-weight:800;border-radius:4px;padding:1px 5px;margin-right:4px}",
  ".cf-img-msg{max-width:200px;border-radius:10px;cursor:pointer;display:block;margin-top:4px}",
  /* Guest bar */
  "#cf-guest-bar{padding:6px 12px;background:#f0eeff;border-bottom:1px solid #e0dcff;display:flex;align-items:center;gap:8px;flex-shrink:0}",
  ".cf-gb-btn{padding:4px 10px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:'Nunito',sans-serif}",
  /* Responsive */
  "@media(max-width:700px){#chat-float{width:calc(100vw - 16px);right:8px}}"
].join('');

var st = document.createElement('style');
st.textContent = css;
document.head.appendChild(st);

// ── State ──
var cfChatListener = null;
var cfChatQuery    = null;
var cfUnreadCount  = 0;
var cfFullscreen   = false;
var _chatWired     = false;
var _isSendingMsg  = false;

// ── Inject HTML ──
var wrap = document.createElement('div');
wrap.innerHTML = [
'<!-- chat FAB -->',
'<div id="chat-fab" onclick="chatToggle()">',
'  <span style="font-size:22px;line-height:1">&#x1F4AC;</span>',
'  <span style="font-size:10px;font-weight:800;letter-spacing:.5px">&#x804A;&#x5929;</span>',
'  <span id="chat-badge-dot"></span>',
'</div>',

'<!-- chat window -->',
'<div id="chat-float">',
'  <div style="background:linear-gradient(90deg,#5C3317,#A84D08);padding:10px 12px;display:flex;align-items:center;gap:8px;flex-shrink:0">',
'    <img src="https://ui-avatars.com/api/?name=AU&background=d4650a&color=fff" style="width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,.3);flex-shrink:0">',
'    <div style="flex:1;min-width:0">',
'      <div style="font-weight:800;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">&#x1F998; &#x6FB3;&#x6D32;&#x5192;&#x96AA;&#x5373;&#x6642;&#x804A;&#x5929;&#x5BA4;</div>',
'      <div style="font-size:10px;color:rgba(255,255,255,.8);display:flex;align-items:center;gap:4px">',
'        <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block"></span>',
'        LIVE &middot; &#x8207;16&#x4F4D;&#x898B;&#x7FD2;&#x6559;&#x5E2B;&#x5373;&#x6642;&#x4E92;&#x52D5;',
'      </div>',
'    </div>',
'    <div style="display:flex;gap:3px;flex-shrink:0">',
'      <button onclick="cfSetSize(\'sm\')" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:\'Nunito\',sans-serif;font-weight:700">&#x5C0F;</button>',
'      <button onclick="cfSetSize(\'md\')" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:\'Nunito\',sans-serif;font-weight:700">&#x4E2D;</button>',
'      <button onclick="cfSetSize(\'lg\')" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:\'Nunito\',sans-serif;font-weight:700">&#x5927;</button>',
'      <button onclick="cfToggleFullscreen()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:11px;font-family:\'Nunito\',sans-serif;font-weight:700" id="cf-fs-btn">&#x5168;</button>',
'      <button onclick="chatToggle()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:14px;line-height:1">&times;</button>',
'    </div>',
'  </div>',
'  <div id="cf-guest-bar" style="display:none">',
'    <span style="font-size:14px">&#x1F44B;</span>',
'    <span id="cf-name-display" style="flex:1;font-size:12px;font-weight:700;color:#5c3317;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">&#x4EE5;&#x8A2A;&#x5BA2;&#x8EAB;&#x5206;&#x804A;&#x5929;</span>',
'    <button onclick="cfChangeGuestName()" class="cf-gb-btn" style="background:#f5edd8;color:#5c3317">&#x6539;&#x540D;</button>',
'    <button onclick="openLoginModal()" class="cf-gb-btn" style="background:#2d5a27;color:#fff">&#x767B;&#x5165;</button>',
'  </div>',
'  <div id="cf-msgs">',
'    <div class="cf-sys">&#x1F4AC; &#x6B61;&#x8FCE;&#x4F86;&#x5230;&#x6FB3;&#x6D32;&#x5192;&#x96AA;&#x5373;&#x6642;&#x804A;&#x5929;&#x5BA4;&#xFF01;<br>&#x96D6;&#x7136;&#x4F60;&#x6C92;&#x6709;&#x89AA;&#x81E8;&#x73FE;&#x5834;&#xFF0C;&#x4F46;&#x6211;&#x5011;&#x5728;&#x7DDA;&#x4E0A;&#x7B49;&#x4F60; &#x1F998;</div>',
'  </div>',
'  <div style="padding:9px 11px;border-top:1px solid #ede9ff;background:#fff;display:flex;align-items:flex-end;gap:6px;flex-shrink:0">',
'    <img id="cf-my-av" src="https://ui-avatars.com/api/?name=%E8%A8%AA&background=8b5e3c&color=fff" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">',
'    <textarea id="cf-input" rows="1" style="flex:1;border:1px solid #d0c8ff;border-radius:20px;padding:7px 12px;font-family:\'Nunito\',sans-serif;font-size:13px;outline:none;resize:none;min-height:34px;max-height:100px;overflow-y:auto;background:#faf9ff;line-height:1.4;color:#222" placeholder="&#x8F38;&#x5165;&#x8A0A;&#x606F;&#x2026; Shift+Enter &#x63DB;&#x884C;"></textarea>',
'    <button onclick="document.getElementById(\'cf-img-input\').click()" style="background:none;border:none;cursor:pointer;font-size:18px;padding:4px;color:#a09ae0;flex-shrink:0">&#x1F5BC;</button>',
'    <input type="file" id="cf-img-input" accept="image/*" multiple style="display:none">',
'    <button id="cf-send" style="width:34px;height:34px;border-radius:50%;background:#D4650A;color:#fff;border:none;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">&#x27A4;</button>',
'  </div>',
'</div>'
].join('\n');
document.body.appendChild(wrap);

// ── Functions ──

function chatToggle() {
  var win = document.getElementById('chat-float');
  var fab = document.getElementById('chat-fab');
  var isOpen = win.classList.contains('cf-open');
  if (isOpen) {
    win.classList.remove('cf-open');
    setTimeout(function(){ win.style.display = 'none'; }, 250);
    if (fab) fab.classList.remove('cf-active');
  } else {
    win.style.display = 'flex';
    requestAnimationFrame(function(){ win.classList.add('cf-open'); });
    if (fab) fab.classList.add('cf-active');
    cfUnreadCount = 0;
    updateChatBadge();
    initChat();
    setTimeout(function(){ var m=document.getElementById('cf-msgs'); if(m) m.scrollTop=m.scrollHeight; }, 100);
  }
}

function cfSetSize(sz) {
  var win = document.getElementById('chat-float');
  if (!win) return;
  win.classList.remove('cf-font-sm', 'cf-font-md', 'cf-font-lg');
  if (sz !== 'md') win.classList.add('cf-font-' + sz);
}

function cfToggleFullscreen() {
  var win = document.getElementById('chat-float');
  var btn = document.getElementById('cf-fs-btn');
  if (!win) return;
  cfFullscreen = !cfFullscreen;
  win.classList.toggle('cf-fullscreen', cfFullscreen);
  if (btn) btn.innerHTML = cfFullscreen ? '&#x7E2E;' : '&#x5168;';
}

function updateChatBadge() {
  var dot = document.getElementById('chat-badge-dot');
  var nb  = document.getElementById('chat-badge');
  if (dot) dot.style.display = cfUnreadCount > 0 ? 'block' : 'none';
  if (nb)  { nb.textContent = cfUnreadCount > 0 ? String(cfUnreadCount) : ''; nb.style.display = cfUnreadCount > 0 ? 'inline' : 'none'; }
}

function initChat() {
  if (cfChatListener && cfChatQuery) {
    try { cfChatQuery.off('value', cfChatListener); } catch(e) {}
    cfChatListener = null; cfChatQuery = null;
  }
  if (typeof rtdb === 'undefined' || !rtdb) { console.warn('rtdb not ready'); return; }
  updateCfUserBar();
  cfChatQuery = rtdb.ref('chat').orderByChild('timestamp').limitToLast(80);
  var handler = function(snap) {
    try {
      var msgs = [];
      if (snap && typeof snap.forEach === 'function')
        snap.forEach(function(c){ try { var v=c.val(); if(v) msgs.push(Object.assign({id:c.key},v)); } catch(e){} });
      renderCfMessages(msgs);
    } catch(e) { console.warn('Chat render:', e); }
  };
  cfChatListener = handler;
  cfChatQuery.on('value', handler, function(err){ console.warn('Chat listener:', err); });
}

function renderCfMessages(msgs) {
  var container = document.getElementById('cf-msgs');
  if (!container) return;
  var myUid      = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.uid : sessionStorage.getItem('guestUid');
  var myGuestUid = sessionStorage.getItem('guestUid');
  var wasAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  var isOpen = document.getElementById('chat-float') ? document.getElementById('chat-float').classList.contains('cf-open') : false;

  var html = '<div class="cf-sys">&#x1F4AC; &#x6B61;&#x8FCE;&#x4F86;&#x5230;&#x6FB3;&#x6D32;&#x5192;&#x96AA;&#x5373;&#x6642;&#x804A;&#x5929;&#x5BA4;&#xFF01;<br>&#x96D6;&#x7136;&#x4F60;&#x6C92;&#x6709;&#x89AA;&#x81E8;&#x73FE;&#x5834;&#xFF0C;&#x4F46;&#x6211;&#x5011;&#x5728;&#x7DDA;&#x4E0A;&#x7B49;&#x4F60; &#x1F998;</div>';
  var lastDate = '';

  msgs.forEach(function(msg) {
    var isMe = !!(myUid && (msg.uid === myUid || (myGuestUid && msg.uid === myGuestUid)));
    var d    = msg.timestamp ? new Date(msg.timestamp) : new Date();
    var ds   = d.toLocaleDateString('zh-TW', {month:'numeric', day:'numeric'});
    if (ds !== lastDate) { lastDate = ds; html += '<div class="cf-date-sep">&mdash; ' + ds + ' &mdash;</div>'; }
    var time = d.toLocaleTimeString('zh-TW', {hour:'2-digit', minute:'2-digit'});
    var av   = msg.userPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(msg.userName||'U') + '&background=' + (isMe?'d4650a':'8b5e3c') + '&color=fff';
    var content = '';
    if (msg.recalled)
      content = (typeof isAdmin !== 'undefined' && isAdmin) ? '<span class="cf-recalled-badge">&#x5DF2;&#x6536;&#x56DE;</span><span class="cf-recalled">' + (typeof esc==='function'?esc(msg.text||''):msg.text||'') + '</span>' : '<span class="cf-recalled">&#x26A0;&#xFE0F; &#x6B64;&#x8A0A;&#x606F;&#x5DF2;&#x6536;&#x56DE;</span>';
    else if (msg.imageURL)
      content = '<img src="' + msg.imageURL + '" class="cf-img-msg" onclick="openLightbox(0,[{url:\'' + msg.imageURL + '\',info:\'\'}],false)">';
    else
      content = (typeof esc==='function' ? esc(msg.text||'') : String(msg.text||''));

    var actions = '';
    if (isMe && !msg.recalled)
      actions += '<button onclick="cfRecallMsg(\'' + msg.id + '\')" class="cf-action-btn cf-recall-btn" title="&#x6536;&#x56DE;">&#x21A9;</button>';
    if ((typeof isAdmin !== 'undefined' && isAdmin) && !msg.recalled)
      actions += ' <button onclick="cfDeleteMsg(\'' + msg.id + '\')" class="cf-action-btn cf-del-btn" title="&#x522A;&#x9664;">&times;</button>';

    html += '<div class="cf-row ' + (isMe?'me':'') + '" data-msgid="' + msg.id + '">'
      + (!isMe ? '<img src="' + av + '" class="cf-av" onerror="this.src=\'https://ui-avatars.com/api/?name=U&background=8b5e3c&color=fff\'">' : '')
      + '<div class="cf-bubble-wrap" style="' + (isMe?'align-items:flex-end':'') + '">'
      + (!isMe ? '<div class="cf-uname">' + (typeof esc==='function'?esc(msg.userName||''):msg.userName||'') + '</div>' : '')
      + '<div class="cf-bubble ' + (isMe?'me':'other') + '">' + content + '</div>'
      + '<div style="display:flex;align-items:center;' + (isMe?'justify-content:flex-end;':'') + 'gap:4px;padding:0 2px">'
      + (isMe ? actions + '<span class="cf-time" style="padding:0">' + time + '</span>' : '<span class="cf-time" style="padding:0">' + time + '</span>' + actions)
      + '</div></div>'
      + (isMe ? '<img src="' + ((typeof currentUser!=='undefined'&&currentUser&&currentUser.photoURL)?currentUser.photoURL:av) + '" class="cf-av" onerror="this.src=\'https://ui-avatars.com/api/?name=U&background=d4650a&color=fff\'">' : '')
      + '</div>';
  });

  container.innerHTML = html;
  if (!isOpen) { cfUnreadCount++; updateChatBadge(); }
  if (wasAtBottom || isOpen) container.scrollTop = container.scrollHeight;
}

function updateCfUserBar() {
  var bar    = document.getElementById('cf-guest-bar');
  var nameEl = document.getElementById('cf-name-display');
  var avEl   = document.getElementById('cf-my-av');
  var user   = (typeof currentUser !== 'undefined') ? currentUser : null;
  if (user) {
    if (bar) bar.style.display = 'none';
    if (avEl) avEl.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName||'U') + '&background=d4650a&color=fff';
  } else {
    if (bar) bar.style.display = 'flex';
    var gn = sessionStorage.getItem('guestName') || '&#x8A2A;&#x5BA2;';
    if (nameEl) nameEl.textContent = '&#x4EE5;\u300C' + gn + '\u300D&#x804A;&#x5929;';
    if (avEl)   avEl.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(gn) + '&background=8b5e3c&color=fff';
  }
}

function wireCfInput() {
  if (_chatWired) return;
  _chatWired = true;
  var input   = document.getElementById('cf-input');
  var sendBtn = document.getElementById('cf-send');
  var imgInput= document.getElementById('cf-img-input');
  if (!input || !sendBtn) return;
  input.addEventListener('keydown', function(e) {
    if (e.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cfSendMessage(); }
  });
  input.addEventListener('input', function() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });
  sendBtn.onclick = cfSendMessage;
  if (imgInput) {
    imgInput.onchange = function(e) {
      var files = Array.from(e.target.files);
      (function uploadNext(i) {
        if (i >= files.length) { e.target.value=''; return; }
        var btn = document.getElementById('cf-send');
        if (btn) { btn.textContent = '&#x23F3;'; btn.disabled = true; }
        if (typeof uploadToCloudinary === 'function') {
          uploadToCloudinary(files[i]).then(function(url) {
            var uN, uP, uid, user = (typeof currentUser!=='undefined')?currentUser:null;
            if (user) { uN = sessionStorage.getItem('profileNickname')||user.displayName||user.email; uP = user.photoURL||''; uid = user.uid; }
            else { var gn=sessionStorage.getItem('guestName')||'&#x8A2A;&#x5BA2;'; uN=gn+' &#x1F44B;'; uP=''; uid=sessionStorage.getItem('guestUid')||'guest_'+Math.random().toString(36).slice(2,8); sessionStorage.setItem('guestUid',uid); }
            return (typeof rtdb!=='undefined'&&rtdb)?rtdb.ref('chat').push({uid:uid,userName:uN,userPhoto:uP,text:'',imageURL:url,timestamp:Date.now()}):Promise.resolve();
          }).catch(function(err){ if(typeof showToast==='function') showToast('&#x5716;&#x7247;&#x4E0A;&#x50B3;&#x5931;&#x6557;','error'); })
            .finally(function(){
              var b=document.getElementById('cf-send');if(b){b.textContent='&#x27A4;';b.disabled=false;}
              uploadNext(i+1);
            });
        } else { uploadNext(i+1); }
      })(0);
    };
  }
}

function cfSendMessage() {
  if (_isSendingMsg) return;
  var input = document.getElementById('cf-input');
  var text  = input ? input.value.trim() : '';
  if (!text || typeof rtdb === 'undefined' || !rtdb) return;
  _isSendingMsg = true;
  if (input) { input.value = ''; input.style.height = ''; }
  var uN, uP, uid, user = (typeof currentUser!=='undefined')?currentUser:null;
  if (user) {
    uN  = sessionStorage.getItem('profileNickname') || user.displayName || user.email;
    uP  = user.photoURL || '';
    uid = user.uid;
    doSend(uid, uN, uP, text);
  } else {
    var gn = sessionStorage.getItem('guestName');
    if (!gn) {
      gn = prompt('&#x8ACB;&#x8F38;&#x5165;&#x4F60;&#x7684;&#x66B1;&#x7A31;&#xFF08;&#x8A2A;&#x5BA2;&#xFF09;&#xFF1A;', '');
      if (gn === null) { _isSendingMsg = false; return; }
      gn = (gn.trim().slice(0,20)) || '&#x8A2A;&#x5BA2;';
      sessionStorage.setItem('guestName', gn);
      updateCfUserBar();
    }
    uid = sessionStorage.getItem('guestUid') || 'guest_' + Math.random().toString(36).slice(2,8);
    sessionStorage.setItem('guestUid', uid);
    doSend(uid, gn + ' &#x1F44B;', '', text);
  }
}
function doSend(uid, uN, uP, text) {
  rtdb.ref('chat').push({uid:uid,userName:uN,userPhoto:uP,text:text,timestamp:Date.now()})
    .catch(function(e){ if(typeof showToast==='function') showToast('&#x767C;&#x9001;&#x5931;&#x6557;&#xFF1A;'+e.message,'error'); })
    .finally(function(){ _isSendingMsg = false; });
}

function cfRecallMsg(id) {
  if (typeof rtdb === 'undefined' || !rtdb) return;
  rtdb.ref('chat/'+id).update({recalled:true})
    .then(function(){ if(typeof showToast==='function') showToast('&#x8A0A;&#x606F;&#x5DF2;&#x6536;&#x56DE;','success'); })
    .catch(function(){ if(typeof showToast==='function') showToast('&#x6536;&#x56DE;&#x5931;&#x6557;','error'); });
}
function cfDeleteMsg(id) {
  if (typeof isAdmin === 'undefined' || !isAdmin || typeof rtdb === 'undefined' || !rtdb) return;
  rtdb.ref('chat/'+id).remove().catch(function(){ if(typeof showToast==='function') showToast('&#x522A;&#x9664;&#x5931;&#x6557;','error'); });
}
function cfChangeGuestName() {
  var n = prompt('&#x8F38;&#x5165;&#x65B0;&#x66B1;&#x7A31;&#xFF1A;', sessionStorage.getItem('guestName')||'&#x8A2A;&#x5BA2;');
  if (!n) return;
  sessionStorage.setItem('guestName', (n.trim().slice(0,20))||'&#x8A2A;&#x5BA2;');
  updateCfUserBar();
}
function clearAllChat() {
  if (typeof isAdmin === 'undefined' || !isAdmin || typeof rtdb === 'undefined' || !rtdb) return;
  if (!confirm('&#x78BA;&#x5B9A;&#x6E05;&#x7A7A;&#x6240;&#x6709;&#x804A;&#x5929;&#x8A18;&#x9304;&#xFF1F;')) return;
  rtdb.ref('chat').remove()
    .then(function(){ if(typeof showToast==='function') showToast('&#x804A;&#x5929;&#x5DF2;&#x6E05;&#x7A7A;','success'); })
    .catch(function(e){ if(typeof showToast==='function') showToast('&#x5931;&#x6557;','error'); });
}

// ── Init once ──
function _init() { wireCfInput(); }
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _init);
} else { _init(); }

// ── Expose globals ──
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
