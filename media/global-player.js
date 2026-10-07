(function(){
'use strict';

/* ═══════════════════════════════════════
   GLOBAL AUDIO PLAYER — English Learning Platform
   يتعلق تلقائياً بأي صوت على الصفحة
   (audio elements + speechSynthesis)
═══════════════════════════════════════ */

// ─── CSS ───────────────────────────────
const css=`
#gp{
  position:fixed;bottom:0;left:0;right:0;z-index:9998;
  background:linear-gradient(135deg,#0a1628 0%,#0f2548 100%);
  border-top:2px solid #f4a624;
  box-shadow:0 -4px 24px rgba(0,0,0,.5);
  transition:transform .35s cubic-bezier(.4,0,.2,1);
  font-family:'Poppins','Segoe UI',Arial,sans-serif;
}
#gp.gp-hidden{transform:translateY(110%)}
.gp-inner{display:flex;align-items:center;gap:14px;padding:10px 22px;height:68px}
.gp-wave{display:flex;align-items:center;gap:2.5px;flex-shrink:0;margin-right:2px}
.gp-wb{width:3px;border-radius:3px;background:#f4a624;animation:gpw .7s ease-in-out infinite alternate}
.gp-wb:nth-child(1){height:7px;animation-delay:.00s}
.gp-wb:nth-child(2){height:14px;animation-delay:.10s}
.gp-wb:nth-child(3){height:10px;animation-delay:.20s}
.gp-wb:nth-child(4){height:18px;animation-delay:.15s}
.gp-wb:nth-child(5){height:9px;animation-delay:.05s}
.gp-wave.paused .gp-wb{animation-play-state:paused;opacity:.35}
@keyframes gpw{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
.gp-track{min-width:0;flex:0 0 200px;max-width:220px}
.gp-name{font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}
.gp-sub{font-size:10px;color:#8899b0;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'Cairo',sans-serif;direction:rtl}
.gp-ctrl{display:flex;align-items:center;gap:7px;flex-shrink:0}
.gp-btn{
  border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);
  color:#e8edf5;cursor:pointer;border-radius:8px;
  width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  font-size:12px;transition:all .2s;flex-shrink:0;
}
.gp-btn:hover{border-color:#f4a624;color:#f4a624;background:rgba(244,166,36,.08)}
.gp-btn:active{transform:scale(.92)}
.gp-btn-play{
  background:#f4a624!important;border-color:#f4a624!important;
  color:#0d1b2a!important;border-radius:50%!important;
  width:40px!important;height:40px!important;font-size:16px!important;
  box-shadow:0 4px 14px rgba(244,166,36,.35);
}
.gp-btn-play:hover{background:#e69920!important;transform:scale(1.06)}
.gp-skip-lbl{font-size:9px;font-weight:800;color:inherit;line-height:1;display:block;margin-top:-1px}
.gp-prog-wrap{flex:1;display:flex;align-items:center;gap:9px;min-width:0}
.gp-time{font-size:10px;color:#8899b0;font-family:'Courier New',monospace;white-space:nowrap;flex-shrink:0;min-width:36px}
.gp-prog{
  flex:1;height:5px;border-radius:5px;background:rgba(255,255,255,.1);
  cursor:pointer;position:relative;transition:height .18s;
}
.gp-prog:hover{height:9px}
.gp-prog-fill{height:100%;border-radius:5px;background:linear-gradient(to right,#f4a624,#ffd700);pointer-events:none;width:0%;transition:width .12s linear}
.gp-prog-thumb{
  position:absolute;top:50%;right:calc(100% - var(--pct,0%));transform:translate(50%,-50%);
  width:13px;height:13px;border-radius:50%;background:#f4a624;
  opacity:0;transition:opacity .18s;pointer-events:none;box-shadow:0 0 6px rgba(244,166,36,.6);
}
.gp-prog:hover .gp-prog-thumb{opacity:1}
.gp-vol{display:flex;align-items:center;gap:7px;flex-shrink:0}
.gp-vol-ico{font-size:15px;cursor:pointer;color:#8899b0;transition:color .2s;user-select:none}
.gp-vol-ico:hover{color:#f4a624}
input.gp-vol-range{
  -webkit-appearance:none;appearance:none;
  width:75px;height:4px;border-radius:4px;
  background:rgba(255,255,255,.15);outline:none;cursor:pointer;
}
input.gp-vol-range::-webkit-slider-thumb{
  -webkit-appearance:none;width:13px;height:13px;border-radius:50%;
  background:#f4a624;cursor:pointer;box-shadow:0 0 4px rgba(244,166,36,.4);
}
input.gp-vol-range::-moz-range-thumb{
  width:13px;height:13px;border-radius:50%;background:#f4a624;border:none;cursor:pointer;
}
.gp-close{background:none;border:none;color:#8899b0;cursor:pointer;font-size:15px;padding:4px 6px;flex-shrink:0;transition:color .2s;line-height:1}
.gp-close:hover{color:#fff}
@media(max-width:680px){
  .gp-track{flex:0 0 110px;max-width:110px}
  .gp-vol{display:none}
  .gp-wave{display:none}
  .gp-inner{gap:8px;padding:8px 12px}
}
`;

const style=document.createElement('style');
style.textContent=css;
document.head.appendChild(style);

// ─── HTML ──────────────────────────────
document.body.insertAdjacentHTML('beforeend',`
<div id="gp" class="gp-hidden">
  <div class="gp-inner">
    <div class="gp-wave paused" id="gpWave">
      <div class="gp-wb"></div><div class="gp-wb"></div><div class="gp-wb"></div>
      <div class="gp-wb"></div><div class="gp-wb"></div>
    </div>
    <div class="gp-track">
      <div class="gp-name" id="gpName">—</div>
      <div class="gp-sub" id="gpSub">English Learning Platform</div>
    </div>
    <div class="gp-ctrl">
      <button class="gp-btn" id="gpPrev" title="إعادة / السابق">⏮</button>
      <button class="gp-btn" id="gpBack" title="إعادة من البداية / 10 ثوانٍ للخلف">
        <span style="line-height:1">⏪</span><span class="gp-skip-lbl">10</span>
      </button>
      <button class="gp-btn gp-btn-play" id="gpPlay">▶</button>
      <button class="gp-btn" id="gpFwd" title="إيقاف / 10 ثوانٍ للأمام">
        <span style="line-height:1">⏩</span><span class="gp-skip-lbl">10</span>
      </button>
      <button class="gp-btn" id="gpNext" title="إيقاف / التالي">⏭</button>
    </div>
    <div class="gp-prog-wrap">
      <span class="gp-time" id="gpCur">0:00</span>
      <div class="gp-prog" id="gpProg">
        <div class="gp-prog-fill" id="gpFill"></div>
        <div class="gp-prog-thumb" id="gpThumb"></div>
      </div>
      <span class="gp-time" id="gpDur">0:00</span>
    </div>
    <div class="gp-vol">
      <span class="gp-vol-ico" id="gpVolIco">🔊</span>
      <input type="range" class="gp-vol-range" id="gpVol" min="0" max="1" step="0.05" value="1">
    </div>
    <button class="gp-close" id="gpClose" title="إغلاق">✕</button>
  </div>
</div>
`);

// ─── REFS ──────────────────────────────
const gp      = document.getElementById('gp');
const gpPlay  = document.getElementById('gpPlay');
const gpPrev  = document.getElementById('gpPrev');
const gpNext  = document.getElementById('gpNext');
const gpBack  = document.getElementById('gpBack');
const gpFwd   = document.getElementById('gpFwd');
const gpProg  = document.getElementById('gpProg');
const gpFill  = document.getElementById('gpFill');
const gpThumb = document.getElementById('gpThumb');
const gpCur   = document.getElementById('gpCur');
const gpDur   = document.getElementById('gpDur');
const gpName  = document.getElementById('gpName');
const gpSub   = document.getElementById('gpSub');
const gpVol   = document.getElementById('gpVol');
const gpVolIco= document.getElementById('gpVolIco');
const gpClose = document.getElementById('gpClose');
const gpWave  = document.getElementById('gpWave');

// ─── AUDIO ELEMENTS STATE ──────────────
let audios  = [];
let curAud  = null;
let curIdx  = -1;
let dragging= false;

// ─── TTS STATE ─────────────────────────
// حالات TTS: 'idle' | 'playing' | 'stopped' | 'ended'
// لا يوجد 'starting' — نعيّن 'playing' فوراً من أول لحظة
// generation counter: أي callback بجيل قديم يُتجاهل
let ttsGen     = 0;
let ttsPhase   = 'idle';
let curTTSText = '';
let curTTSRate = 0.85;
let curTTSLang = 'en-GB';
let ttsDurEst  = 0;
let ttsElapsed = 0;
let ttsT0      = 0;
let ttsRafId   = null;
let _ttsOrigSpeak = null;

// ─── UTILS ─────────────────────────────
function fmt(s){
  if(!s||isNaN(s)||s<0)return'0:00';
  const m=Math.floor(s/60),sc=Math.floor(s%60);
  return m+':'+(sc<10?'0':'')+sc;
}

function getLabel(aud){
  const apWrap=aud.closest('.ap');
  if(apWrap){const lbl=apWrap.querySelector('.ap-label');if(lbl)return lbl.textContent.trim().replace(/^[🔊🎧📢\s]+/,'').trim();}
  const card=aud.closest('.card');
  if(card){const t=card.querySelector('.card-title');if(t)return t.textContent.trim();}
  const dlg=aud.closest('.dlg-hd,.dialogue');
  if(dlg){const h=dlg.querySelector('h3,h4,.card-title');if(h)return h.textContent.trim();}
  let el=aud.parentElement;
  for(let i=0;i<6;i++){if(!el)break;const h=el.querySelector('h1,h2,h3,h4');if(h)return h.textContent.trim().substring(0,50);el=el.parentElement;}
  const src=aud.getAttribute('src')||aud.src||'';
  return src.split('/').pop().replace(/\.(mp3|wav|ogg|m4a)$/i,'').replace(/[_]/g,' ')||'Audio';
}

function getPageTitle(){
  const h=document.querySelector('.hero-unit,.unit-badge');
  if(h)return h.textContent.trim();
  return document.title.split('|')[0].trim().substring(0,40);
}

// ─── DISPLAY ───────────────────────────
function showPlayer(){gp.classList.remove('gp-hidden');syncBodyPad();}
function hidePlayer(){gp.classList.add('gp-hidden');syncBodyPad();}
function syncBodyPad(){document.querySelectorAll('.main-content').forEach(mc=>{mc.style.paddingBottom=gp.classList.contains('gp-hidden')?'0':'70px';});}
function setPlaying(yes){gpPlay.textContent=yes?'⏸':'▶';yes?gpWave.classList.remove('paused'):gpWave.classList.add('paused');}
function setPct(pct){gpFill.style.width=pct+'%';gpThumb.style.setProperty('--pct',pct+'%');}

// ─── AUDIO PROGRESS ────────────────────
function updateAudioProgress(){if(!curAud||!curAud.duration)return;setPct((curAud.currentTime/curAud.duration)*100);gpCur.textContent=fmt(curAud.currentTime);}
function setCurrent(aud){curAud=aud;curIdx=audios.indexOf(aud);gpName.textContent=getLabel(aud);gpSub.textContent=getPageTitle();setPct(0);gpCur.textContent='0:00';gpDur.textContent=aud.duration?fmt(aud.duration):'--:--';}

// ─── TICKER ────────────────────────────
function tickerStart(){
  tickerStop();
  ttsT0=performance.now();
  (function tick(){
    ttsRafId=requestAnimationFrame(tick);
    const e=ttsElapsed+(performance.now()-ttsT0)/1000;
    gpCur.textContent=fmt(e);
    if(ttsDurEst>0)setPct(Math.min(99,e/ttsDurEst*100));
  })();
}
function tickerStop(){if(ttsRafId!==null){cancelAnimationFrame(ttsRafId);ttsRafId=null;}}

// ─── TTS STOP ──────────────────────────
function ttsStop(){
  ttsGen++;
  tickerStop();
  ttsPhase='stopped';
  setPlaying(false);
  const ss=window.speechSynthesis;
  const kill=()=>{if(ss&&(ss.speaking||ss.pending))ss.cancel();};
  kill();setTimeout(kill,60);setTimeout(kill,180);setTimeout(kill,400);
}

// ─── TTS PAUSE ─────────────────────────
function ttsPause(){
  if(ttsPhase!=='playing')return;
  // احفظ الوقت المنقضي قبل الإيقاف المؤقت
  ttsElapsed+=(performance.now()-ttsT0)/1000;
  tickerStop();
  ttsPhase='paused';
  setPlaying(false);
  const ss=window.speechSynthesis;
  if(ss&&ss.speaking)ss.pause();
}

// ─── TTS RESUME ────────────────────────
function ttsResume(){
  if(ttsPhase!=='paused')return;
  const ss=window.speechSynthesis;
  if(ss&&ss.paused){
    ttsPhase='playing';
    ttsT0=performance.now(); // elapsed محفوظ — نكمل من حيث توقفنا
    setPlaying(true);
    tickerStart();
    ss.resume();
  } else {
    // Chrome أحياناً لا يدعم resume — نعيد من البداية
    ttsPlay();
  }
}

// ─── TTS PLAY ──────────────────────────
// يعيّن 'playing' فوراً (لا 'starting') — يُصلح مشكلة زر الوقف وقت التهيئة
// polling: ينتظر حتى يتأكد Chrome صامت قبل تشغيل utterance جديدة
function ttsPlay(){
  if(!curTTSText||!_ttsOrigSpeak)return;

  const myGen=++ttsGen;

  // تحديث فوري — 'playing' بدون انتظار start event
  ttsPhase='playing';
  ttsElapsed=0;
  ttsT0=performance.now();
  const label=curTTSText.length>48?curTTSText.substring(0,48)+'…':curTTSText;
  gpName.textContent=label;
  gpSub.textContent=getPageTitle();
  gpDur.textContent=fmt(ttsDurEst);
  setPct(0);
  gpCur.textContent='0:00';
  setPlaying(true);
  showPlayer();
  tickerStart();

  const ss=window.speechSynthesis;
  if(ss)ss.cancel();

  // انتظر حتى Chrome صامت قبل التشغيل (max 12 محاولة × 60ms = ~720ms)
  const doSpeak=(tries)=>{
    if(ttsGen!==myGen)return; // تم تجاوزه بعملية أحدث
    if(tries>0&&ss&&(ss.speaking||ss.pending)){
      ss.cancel();
      setTimeout(()=>doSpeak(tries-1),60);
      return;
    }
    const u=new SpeechSynthesisUtterance(curTTSText);
    u.lang=curTTSLang;
    u.rate=curTTSRate;
    // نضبط ttsT0 عند start الفعلي لدقة الـ progress
    u.onstart=()=>{if(ttsGen===myGen){ttsElapsed=0;ttsT0=performance.now();}};
    u.onboundary=(e)=>{
      if(ttsGen!==myGen||ttsPhase!=='playing')return;
      if(curTTSText.length>0){const r=e.charIndex/curTTSText.length;ttsElapsed=ttsDurEst*r;ttsT0=performance.now();setPct(Math.min(99,r*100));}
    };
    u.onend=()=>{
      if(ttsGen!==myGen)return;
      tickerStop();ttsPhase='ended';setPlaying(false);setPct(100);gpCur.textContent=fmt(ttsDurEst);
    };
    u.onerror=()=>{if(ttsGen!==myGen)return;tickerStop();ttsPhase='stopped';setPlaying(false);};
    _ttsOrigSpeak(u);
  };
  doSpeak(12);
}

// ─── BIND AUDIO ELEMENT ────────────────
function bindAudio(aud){
  aud.addEventListener('play',()=>{
    if(ttsPhase!=='idle'){ttsStop();ttsPhase='idle';curTTSText='';}
    if(aud!==curAud)setCurrent(aud);
    setPlaying(true);showPlayer();
  });
  aud.addEventListener('pause',()=>{if(aud===curAud)setPlaying(false);});
  aud.addEventListener('ended',()=>{if(aud!==curAud)return;setPlaying(false);setPct(0);gpCur.textContent='0:00';});
  aud.addEventListener('timeupdate',()=>{if(aud===curAud&&!dragging)updateAudioProgress();});
  aud.addEventListener('loadedmetadata',()=>{if(aud===curAud)gpDur.textContent=fmt(aud.duration);});
  aud.addEventListener('durationchange',()=>{if(aud===curAud)gpDur.textContent=fmt(aud.duration);});
}

function collectAudios(){
  document.querySelectorAll('audio').forEach(a=>{if(!audios.includes(a)){audios.push(a);bindAudio(a);}});
}

// ─── HOOK SPEECH SYNTHESIS ─────────────
// يعترض كل speak() من الدروس — يعيّن 'playing' ويشغّل الـ ticker فوراً
function hookSpeechSynthesis(){
  if(!window.speechSynthesis)return;
  _ttsOrigSpeak=window.speechSynthesis.speak.bind(window.speechSynthesis);

  window.speechSynthesis.speak=function(utterance){
    const text=utterance.text||'';
    const rate=utterance.rate||1;
    const estSec=(text.trim().split(/\s+/).length||1)/140*(1/rate)*60;

    // خزّن المعلومات فوراً
    curTTSText=text;
    curTTSRate=rate;
    curTTSLang=utterance.lang||'en-GB';
    ttsDurEst=estSec;

    const myGen=++ttsGen;

    // عيّن 'playing' وحدّث الـ UI فوراً — لا ننتظر start event
    ttsPhase='playing';
    ttsElapsed=0;
    ttsT0=performance.now();
    const label=text.length>48?text.substring(0,48)+'…':text;
    gpName.textContent=label;
    gpSub.textContent=getPageTitle();
    gpDur.textContent=fmt(estSec);
    setPct(0);gpCur.textContent='0:00';
    setPlaying(true);showPlayer();tickerStart();

    // عند start الفعلي: أعد ضبط ttsT0 لدقة أكبر
    utterance.addEventListener('start',()=>{
      if(ttsGen!==myGen)return;
      ttsElapsed=0;ttsT0=performance.now();
    });
    utterance.addEventListener('boundary',(e)=>{
      if(ttsGen!==myGen||ttsPhase!=='playing')return;
      if(text.length>0){const r=e.charIndex/text.length;ttsElapsed=estSec*r;ttsT0=performance.now();setPct(Math.min(99,r*100));}
    });
    utterance.addEventListener('end',()=>{
      if(ttsGen!==myGen)return;
      tickerStop();ttsPhase='ended';setPlaying(false);setPct(100);gpCur.textContent=fmt(estSec);
    });
    utterance.addEventListener('error',()=>{
      if(ttsGen!==myGen)return;
      tickerStop();ttsPhase='stopped';setPlaying(false);
    });

    _ttsOrigSpeak(utterance);
  };
}

// ─── CONTROLS ──────────────────────────

// ▶/⏸ — تشغيل أو إيقاف مؤقت
gpPlay.addEventListener('click',()=>{
  if(ttsPhase==='playing'){ttsPause();return;}
  if(ttsPhase==='paused'){ttsResume();return;}
  if(ttsPhase==='stopped'||ttsPhase==='ended'){ttsPlay();return;}
  if(!curAud)return;
  curAud.paused?curAud.play().catch(()=>{}):curAud.pause();
});

// ⏪ — 10 ثوانٍ للخلف (audio) / إعادة من البداية (TTS)
gpBack.addEventListener('click',()=>{
  if(curAud&&ttsPhase==='idle'){curAud.currentTime=Math.max(0,curAud.currentTime-10);return;}
  if(ttsPhase==='playing'||ttsPhase==='paused'){ttsPlay();return;}
});

// ⏩ — 10 ثوانٍ للأمام (audio) / إيقاف (TTS)
gpFwd.addEventListener('click',()=>{
  if(curAud&&ttsPhase==='idle'){curAud.currentTime=Math.min(curAud.duration||0,curAud.currentTime+10);return;}
  if(ttsPhase==='playing'||ttsPhase==='paused'){ttsStop();return;}
  if(ttsPhase==='stopped'||ttsPhase==='ended'){ttsPlay();return;}
});

// ⏮ — إعادة من البداية (TTS) / الصوت السابق (audio)
gpPrev.addEventListener('click',()=>{
  if(ttsPhase!=='idle'){ttsPlay();return;}
  if(audios.length===0)return;
  const idx=curIdx>0?curIdx-1:audios.length-1;
  if(curAud&&!curAud.paused)curAud.pause();
  const a=audios[idx];setCurrent(a);a.currentTime=0;a.play().catch(()=>{});
});

// ⏭ — إيقاف (TTS) / الصوت التالي (audio)
gpNext.addEventListener('click',()=>{
  if(ttsPhase!=='idle'){ttsStop();return;}
  if(audios.length===0)return;
  const idx=curIdx<audios.length-1?curIdx+1:0;
  if(curAud&&!curAud.paused)curAud.pause();
  const a=audios[idx];setCurrent(a);a.currentTime=0;a.play().catch(()=>{});
});

// ─── PROGRESS SEEK (audio only) ────────
function seekTo(e){
  if(ttsPhase!=='idle'||!curAud||!curAud.duration)return;
  const r=gpProg.getBoundingClientRect();
  const pct=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  curAud.currentTime=pct*curAud.duration;setPct(pct*100);
}
gpProg.addEventListener('mousedown',(e)=>{if(ttsPhase==='idle'){dragging=true;seekTo(e);}});
document.addEventListener('mousemove',(e)=>{if(dragging)seekTo(e);});
document.addEventListener('mouseup',()=>{dragging=false;});
gpProg.addEventListener('click',seekTo);
gpProg.addEventListener('touchstart',(e)=>{if(ttsPhase==='idle'){dragging=true;seekTo(e.touches[0]);}},{passive:true});
document.addEventListener('touchmove',(e)=>{if(dragging)seekTo(e.touches[0]);},{passive:true});
document.addEventListener('touchend',()=>{dragging=false;});

// ─── VOLUME ────────────────────────────
gpVol.addEventListener('input',()=>{
  const v=parseFloat(gpVol.value);
  audios.forEach(a=>a.volume=v);
  gpVolIco.textContent=v===0?'🔇':v<0.5?'🔉':'🔊';
});
gpVolIco.addEventListener('click',()=>{
  const mute=parseFloat(gpVol.value)>0;gpVol.value=mute?0:1;gpVol.dispatchEvent(new Event('input'));
});

// ─── CLOSE ─────────────────────────────
gpClose.addEventListener('click',()=>{
  if(ttsPhase!=='idle'){
    ttsStop();ttsPhase='idle';curTTSText='';
  }
  if(curAud&&!curAud.paused)curAud.pause();
  setPlaying(false);setPct(0);gpCur.textContent='0:00';
  hidePlayer();
});

// ─── KEYBOARD ──────────────────────────
document.addEventListener('keydown',(e)=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
  if(e.key===' '){e.preventDefault();gpPlay.click();}
  if(e.key==='ArrowLeft')gpBack.click();
  if(e.key==='ArrowRight')gpFwd.click();
});

// ─── MUTATION OBSERVER ─────────────────
new MutationObserver(collectAudios).observe(document.body,{childList:true,subtree:true});

// ─── INIT ──────────────────────────────
function init(){collectAudios();hookSpeechSynthesis();}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}
else{init();}

})();
