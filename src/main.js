// ==UserScript==
// @name         Transparent Twitch Chat
// @description  TODO
// @version      1.0
// @namespace    https://chylex.com
// @include      https://www.twitch.tv/*
// @run-at       document-end
// @noframes
// @grant  GM_getValue
// @grant  GM_setValue
// ==/UserScript==

function tryRemoveElement(ele){
  if (ele && ele.parentNode){
    ele.parentNode.removeChild(ele);
  }
}

function generateCSS(){
  tryRemoveElement(document.getElementById("chylex-ttc-style"));
  
  let style = document.createElement("style");
  style.id = "chylex-ttc-style";
  document.head.appendChild(style);
  
  for(let rule of `
// simulate expandRight style

.theatre .ct-bar--active.ct-bar--ember, .theatre #main_col {
  right: 0
}

.theatre #main_col, .theatre #flash {
  margin-right: 0;
}

.theatre #main_col #player {
  right: 0 !important;
}

// fix player controls

.theatre #main_col:not(.expandRight) .player-hover {
  margin-right: 340px;
}

.theatre #main_col:not(.expandRight) #right_close {
  margin-right: 350px;
}

.theatre #main_col:not(.expandRight) .player-streamstatus {
  margin-right: 370px !important;
}

.theatre #main_col.expandRight .player-streamstatus {
  margin-right: 20px !important;
}

// fix right column

.theatre #right_col {
  background: none !important;
}

// change chat container (base)

.theatre .chat-header {
  background-color: #17141f40 !important;
}

.theatre .chat-container {
  background: #17141f40 !important;
  color: #d0ccd8 !important;
  text-shadow: 0 0 2px #000, 0 0 3px #000;
  //transition: background 0.075s, color 0.075s;
}

.theatre .chat-interface {
  opacity: 0.5;
  //transition: opacity 0.075s;
}

// change chat container (restore on hover)

.theatre .chat-container:hover .chat-header {
  background-color: #17141f !important;
}

.theatre .chat-container:hover {
  background: #17141f !important;
  color: #898395 !important;
  text-shadow: none;
}

.theatre .chat-container:hover .chat-interface {
  opacity: 1;
}`.split("}")){
    if (rule.length){
      let parsed = rule.replace(/^\/\/(.*?)$/gm, "")+"}";

      try{
        style.sheet.insertRule(parsed, 0);
      }catch(e){
        alert("[TransparentTwitchChat] Error adding rule: "+parsed);
      }
    }
  }
}

generateCSS();
