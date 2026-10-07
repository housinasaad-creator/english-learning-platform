// Smart TTS — male English voice, works on iOS/Android/Desktop
(function(){
  var _voice = null;
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  var MALE = ['daniel','arthur','reed','oliver','george','james','mark','david','guy',
              'aaron','fred','alex','tom','lee','male','gordon','bruce','junior'];

  function findMale(){
    var voices = speechSynthesis.getVoices();
    var en = voices.filter(function(v){ return /^en/i.test(v.lang); });
    if(!en.length) return null;
    for(var i = 0; i < en.length; i++){
      var n = en[i].name.toLowerCase();
      for(var j = 0; j < MALE.length; j++){
        if(n.indexOf(MALE[j]) >= 0) return en[i];
      }
    }
    return en[0];
  }

  function doSpeak(text, rate){
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    if(_voice){
      u.voice = _voice;
      u.pitch = 0.95;
    } else {
      u.pitch = 0.75;
    }
    u.lang = 'en-GB';
    u.rate = isMobile ? (rate || 0.85) : 0.75;
    u.volume = 1;
    speechSynthesis.speak(u);
  }

  if(typeof speechSynthesis !== 'undefined'){
    speechSynthesis.onvoiceschanged = function(){ _voice = findMale(); };
    speechSynthesis.getVoices();
  }

  window.ttsRead = function(text, rate){
    if(!_voice) _voice = findMale();
    if(!_voice){
      setTimeout(function(){
        _voice = findMale();
        doSpeak(text, rate);
      }, 300);
    } else {
      doSpeak(text, rate);
    }
  };
})();
