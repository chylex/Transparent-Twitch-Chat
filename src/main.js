// ==UserScript==
// @name         Transparent Twitch Chat
// @description  Why decide between missing a PogChamp or sacrificing precious screen space, when you can have the best of both worlds!
// @version      {VERSION}
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
    backgroundOpacity: 0.3,
    headerOpacity: 0.4,
    badgeOpacity: 0.85,
    
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
  padding-right: ${settings.chatWidth - 10}px;
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

// fix scrollbars

.theatre #main_col .tse-scrollbar {
  display: none !important;
}

.theatre #right_col:not(:hover) .chat-messages .tse-scrollbar {
  display: none !important;
}

// change chat container

.theatre #right_col {
  background: none !important;
  width: ${settings.chatWidth - 10}px;
}

.theatre #right_col:not(:hover) .chat-container {
  background: #17141f${((settings.backgroundOpacity * 256) | 0).toString(16)} !important;
  color: #ece8f3 !important;
  text-shadow: 0 0 2px #000D, -1px 0 1px #0006, 0 -1px 1px #0006, 1px 0 1px #0006, 0 1px 1px #0006;
}

.theatre #right_col:not(:hover) .chat-header {
  background-color: #17141f${((settings.headerOpacity * 256) | 0).toString(16)} !important;
}

.theatre #right_col:not(:hover) .chat-interface {
  opacity: 0.6;
}

// hide replay header

.theatre .cn-chat-replay-header {
  display: none;
}

.theatre .cn-tab-container {
  top: 0 !important;
}

// change chat messages

.theatre #right_col:not(:hover) .chat-messages .timestamp {
  color: #b7b5ba !important;
}

.theatre #right_col:not(:hover) .chat-messages .badges {
  opacity: ${settings.badgeOpacity};
}

.theatre #right_col:not(:hover) .chat-messages .from {
  text-shadow: -1px 0 1px #0006, 0 -1px 1px #0006, 1px 0 1px #0006, 0 1px 1px #0006;
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

.theatre #right_col:not(:hover) .chat-messages a {
  color: #cdb9f5 !important;
}

// username color tweaks (possibly figure out a better way later)

.theatre .from[style="color:#0000FF"], .theatre .from[style="color:#0000DF"] {
  color: #88F !important;
}

.theatre .from[style="color:#000000"] {
  color: #888 !important;
}

.theatre .from[style="color:#8A2BE2"] {
  color: #AA4BFF !important;
}

.theatre .from[style="color:#5A3A54"] {
  color: #957C74 !important;
}

.theatre .from[style="color:#1F1FA8"] {
  color: #5252F8 !important;
}

.theatre .from[style="color:#1945B3"] {
  color: #4F7AC3 !important;
}

.theatre .from[style="color:#030061"] {
  color: #6360A1 !important;
}

.theatre .from[style="color:#4B00AD"] {
  color: #7B50D2 !important;
}

.theatre .from[style="color:#403271"] {
  color: #8072A1 !important;
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
