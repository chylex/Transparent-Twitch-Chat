// ==UserScript==
// @name         Transparent Twitch Chat
// @description  TODO
// @version      0.1.1
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
  let settings = {
    chatWidth: 350,
    backgroundOpacity: 0.33,
    headerOpacity: 0.42,
    
    hideBadgeTurbo: true,
    hideBadgePrime: true,
    hideBadgeSubscriber: true
  };
  
  tryRemoveElement(document.getElementById("chylex-ttc-style"));
  
  let style = document.createElement("style");
  style.id = "chylex-ttc-style";
  style.innerHTML = `
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
  margin-right: ${settings.chatWidth - 10}px;
}

.theatre #main_col:not(.expandRight) #right_close {
  margin-right: ${settings.chatWidth}px;
}

.theatre #main_col:not(.expandRight) .player-streamstatus {
  margin-right: ${settings.chatWidth + 20}px !important;
}

.theatre #main_col.expandRight .player-streamstatus {
  margin-right: 20px !important;
}

.theatre #main_col:not(.expandRight) .conversations-content {
  right: ${settings.chatWidth}px;
}

// change chat container

.theatre #right_col {
  background: none !important;
}

.theatre #right_col:not(:hover) .chat-container {
  background: #17141f${((settings.backgroundOpacity * 256) | 0).toString(16)} !important;
  color: #ece8f3 !important;
  text-shadow: 0 0 2px #000, 0 0 3px #000;
}

.theatre #right_col:not(:hover) .chat-header {
  background-color: #17141f${((settings.headerOpacity * 256) | 0).toString(16)} !important;
}

.theatre #right_col:not(:hover) .chat-messages .timestamp {
  color: #b7b5ba !important;
}

.theatre #right_col:not(:hover) .chat-messages .badges {
  opacity: 0.6;
}

.theatre #right_col:not(:hover) .chat-messages .from {
  text-shadow: 0 0 2px #000;
}

.theatre #right_col:not(:hover) .chat-messages .special-message {
  background: #201c2b50 !important;
  color: #b7b5ba !important;
  border-left-color: #6441a450 !important;
}

.theatre #right_col:not(:hover) .chat-messages .chat-chip {
  background: #201c2b50 !important;
  box-shadow: none !important;
}

.theatre #right_col:not(:hover) .chat-messages .card__info {
  color: #b7b5ba !important;
}

.theatre #right_col:not(:hover) .chat-interface {
  opacity: 0.6;
}

// style tweaks
${settings.hideBadgeTurbo ? `
.badge[alt="Turbo"], .badge[original-title="Turbo"] {
    display: none;
}` : ``}

${settings.hideBadgePrime ? `
.badge[alt$="Prime"], .badge[original-title$="Prime"] {
    display: none;
}` : ``}

${settings.hideBadgeSubscriber ? `
.badge[alt~="Subscriber"], .badge[original-title~="Subscriber"] {
    display: none;
}` : ``}

`.replace(/^\/\/(.*?)$/gm, "");
  
  document.head.appendChild(style);
}

generateCSS();
