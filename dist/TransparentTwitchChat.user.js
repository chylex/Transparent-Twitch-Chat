// ==UserScript==
// @name         Transparent Twitch Chat
// @description  Why decide between missing a PogChamp or sacrificing precious screen space, when you can have the best of both worlds!
// @version      1.0.4
// @namespace    https://chylex.com
// @include      https://www.twitch.tv/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @noframes
// ==/UserScript==

let settings = {
  chatWidth: 350,
  chatLeftSide: false,
  hideHeader: true,

  backgroundOpacity: 30,
  badgeOpacity: 85,
  grayTheme: false,

  hideBadgeTurbo: true,
  hideBadgePrime: true,
  hideBadgeSubscriber: true
};

if (typeof GM_getValue !== "undefined"){
  for(let key in settings){
    settings[key] = GM_getValue(key, settings[key]);
  }
}

function tryRemoveElement(ele){
  if (ele && ele.parentNode){
    ele.parentNode.removeChild(ele);
  }
}

function onSettingsUpdated(){
  generateDynamicCSS();
  
  if (typeof GM_setValue !== "undefined"){
    for(let key in settings){
      GM_setValue(key, settings[key]);
    }
  }
}

function convHex(hex){
  if (hex.length === 8){
    return `rgba(${parseInt(hex.substr(0, 2), 16)}, ${parseInt(hex.substr(2, 2), 16)}, ${parseInt(hex.substr(4, 2), 16)}, ${parseInt(hex.substr(6, 2), 16) / 256})`;
  }
  else if (hex.length === 4){
    return `rgba(${parseInt(hex[0].repeat(2), 16)}, ${parseInt(hex[1].repeat(2), 16)}, ${parseInt(hex[2].repeat(2), 16)}, ${parseInt(hex[3].repeat(2), 16) / 256})`;
  }
}

function stripComments(str){
  return str.replace(/^\/\/(.*?)$/gm, "");
}

function generateStaticCSS(){
  if (document.getElementById("chylex-ttc-style-static")){
    return;
  }
  
  let wa = ":not(.ttcwa)"; // selector priority workaround
  
  let style = document.createElement("style");
  style.id = "chylex-ttc-style-static";
  style.innerHTML = stripComments(`

// simulate expandRight style, FrankerFaceZ workaround

.theatre .ct-bar--active.ct-bar--ember, .theatre #main_col {
  right: 0
}

body${wa} .app-main.theatre${wa} #main_col, .theatre #flash {
  margin-right: 0 !important;
}

body${wa} .app-main.theatre${wa} #main_col${wa} #player${wa} {
  right: 0 !important;
}

// fix scrollbars

.theatre #main_col .tse-scrollbar {
  display: none !important;
}

.theatre #right_col:not(:hover) .chat-messages .tse-scrollbar {
  display: none !important;
}

// hide replay header

.theatre .cn-chat-replay-header {
  display: none;
}

.theatre .cn-tab-container {
  top: 0 !important;
}

.theatre #right_col${wa} .chatReplay .chat-room {
  top: 0 !important;
}

// change chat messages

.theatre #right_col:not(:hover) .chat-messages .timestamp {
  color: #b7b5ba !important;
}

.theatre #right_col:not(:hover) .chat-messages .from {
  text-shadow: -1px 0 1px ${convHex("0006")}, 0 -1px 1px ${convHex("0006")}, 1px 0 1px ${convHex("0006")}, 0 1px 1px ${convHex("0006")};
}

.theatre #right_col:not(:hover) .chat-messages .special-message {
  background: ${convHex("201c2b50")} !important;
  color: #b7b5ba !important;
  border-left-color: ${convHex("6441a450")} !important;
}

.theatre #right_col:not(:hover) .chat-messages .system-msg {
  color: #b7b5ba !important;
}

.theatre #right_col:not(:hover) .chat-messages .chat-chip {
  background: ${convHex("201c2b50")} !important;
  box-shadow: none !important;
}

.theatre #right_col:not(:hover) .chat-messages .card__info {
  color: #b7b5ba !important;
}

.theatre #right_col:not(:hover) .chat-messages a {
  color: #cdb9f5 !important;
}

.theatre #right_col:not(:hover) .chat-messages .admin .message {
  color: #bd9ff5 !important;
}

// fix unwanted styles

.theatre #right_col:not(:hover) .chat-menu {
  text-shadow: none;
  color: #898395;
}

.theatre #right_col:not(:hover) .mentioning {
  text-shadow: none;
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

// BTTV workarounds

.theatre .ember-chat.roomMode${wa}, .theatre .chat-messages${wa}, .theatre .ember-chat${wa} {
  background: none !important;
}

.theatre .rightcol-content${wa} {
  background: none !important;
  z-index: 3 !important;
}`);
  
  document.head.appendChild(style);
}

function generateDynamicCSS(){
  tryRemoveElement(document.getElementById("chylex-ttc-style-dynamic"));
  
  let style = document.createElement("style");
  style.id = "chylex-ttc-style-dynamic";
  style.innerHTML = stripComments(`

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

// chat on left side

${settings.chatLeftSide ? `
.theatre #right_col, .theatre .chat-messages .tse-scrollbar {
  left: 0;
  right: auto;
}

.theatre #main_col:not(.expandRight) .player-hover {
  padding-left: ${settings.chatWidth - 10}px;
  padding-right: 0;
}

.theatre #main_col:not(.expandRight) .player-streaminfo {
  margin-left: 50px;
}

.theatre #main_col.expandRight .player-streaminfo {
  margin-left: 25px;
}

.theatre #main_col:not(.expandRight) .conversations-content {
  right: 10px !important;
}

.theatre #main_col #right_close {
  left: 5px;
  right: auto;
  margin-left: ${settings.chatWidth}px;
}

.theatre #main_col.expandRight #right_close {
  margin-left: 0;
}

.theatre #right_close::before {
  border-left-width: 0;
  border-right-width: 6px;
  border-right-color: black;
}

.theatre #main_col.expandRight #right_close::before {
  border-left-width: 6px;
  border-left-color: black;
  border-right-width: 0;
}` : ``}

// change chat container

.theatre #right_col {
  background: none !important;
  width: ${settings.chatWidth - 10}px;
}

.theatre #right_col:not(:hover) .chat-container {
  background: ${convHex("17141f"+(Math.round(settings.backgroundOpacity * 2.55).toString(16).padStart(2, '0')))} !important;
  color: #ece8f3 !important;
  text-shadow: 0 0 2px ${convHex("000D")}, -1px 0 1px ${convHex("0006")}, 0 -1px 1px ${convHex("0006")}, 1px 0 1px ${convHex("0006")}, 0 1px 1px ${convHex("0006")};
}

.theatre #right_col:not(:hover) .chat-header {
  background-color: ${convHex("17141f66")} !important;
}

${settings.hideHeader ? `
.theatre #right_col:not(:hover) .chat-header {
  display: none;
}` : ``}

.theatre #right_col:not(:hover) .chat-room {
  top: ${settings.hideHeader ? `0` : `50px`} !important;
}

.theatre #right_col:hover .chat-room {
  top: 50px !important;
}

.theatre #right_col:not(:hover) .chat-interface {
  opacity: 0.6;
}

// conversation menu

.theatre .conversations-list-container:not(.list-displayed):not(:hover) {
  opacity: ${settings.backgroundOpacity / 100};
}

// gray theme

${settings.grayTheme ? `
.theatre #right_col:not(:hover) .chat-container {
  background: ${convHex("141414"+(Math.round(settings.backgroundOpacity * 2.55).toString(16).padStart(2, '0')))} !important;
}

.theatre #right_col:hover .chat-container {
  background: #141414 !important;
}

.theatre #right_col:not(:hover) .chat-header {
  background-color: ${convHex("09090966")} !important;
}

.theatre #right_col:hover .chat-header {
  background: #090909 !important;
}

.theatre .ember-chat .chat-interface .textarea-contain textarea {
  background-color: ${convHex("2a2a2a90")} !important;
  border: 1px solid ${convHex("00000090")} !important;
  box-shadow: none !important;
}

.theatre .chat-container .button--icon-only figure svg {
  fill: #dedede !important;
  opacity: 0.5;
}

.theatre #right_col:hover .chat-container .button--icon-only figure svg {
  fill: #dedede !important;
  opacity: 1;
}

.theatre .chat-container .button:not(.button--icon-only) {
  background-color: ${convHex("2a2a2a90")} !important;
  border: 1px solid ${convHex("00000090")} !important;
}` : ``}

// badge tweaks

.theatre #right_col:not(:hover) .chat-messages .badges {
  opacity: ${settings.badgeOpacity / 100};
  ${settings.badgeOpacity === 0 ? `display: none;` : ``}
}

${settings.hideBadgeTurbo ? `
.theatre .badge[alt="Turbo"], .theatre .badge[original-title="Turbo"], .theatre .badge.turbo {
 display: none;
}` : ``}

${settings.hideBadgePrime ? `
.theatre .badge[alt$="Prime"], .theatre .badge[original-title$="Prime"], .theatre .badge.premium {
 display: none;
}` : ``}

${settings.hideBadgeSubscriber ? `
.theatre .badge[alt~="Subscriber"], .theatre .badge[original-title~="Subscriber"], .theatre .badge.subscriber {
 display: none;
}` : ``}

// dynamic styles for settings

#chylex-ttc-settings-btn {
  margin-top: -152px;
  margin-left: ${settings.chatWidth - 58}px;
}

.chatReplay #chylex-ttc-settings-btn {
  margin-top: -40px;
  margin-left: ${settings.chatWidth - 52}px;
}`);
  
  document.head.appendChild(style);
}

function generateSettingsCSS(){
  if (document.getElementById("chylex-ttc-style-settings")){
    return;
  }
  
  let style = document.createElement("style");
  style.id = "chylex-ttc-style-settings";
  style.innerHTML = stripComments(`

// settings button

#chylex-ttc-settings-btn {
  display: none;
  width: 3em;
  height: 3em;
  position: absolute;
  z-index: 2000;
  cursor: pointer;
  fill: ${convHex("fffa")};
}

#chylex-ttc-settings-btn:hover .player-tip {
  display: inline-block;
  width: auto;
  left: 50%;
  top: 0.5em;
  margin-left: -13.75em;
  z-index: 1999;
}

#chylex-ttc-settings-btn svg {
  width: 100%;
  height: 100%;
}

#chylex-ttc-settings-btn:hover {
  fill: #fff;
}

.theatre #right_col:hover #chylex-ttc-settings-btn {
  display: block;
}

// settings modal

#chylex-ttc-settings-modal {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 520px;
  height: 300px;
  margin-left: -260px;
  margin-top: -150px;
  z-index: 1000;
  background-color: ${convHex("000b")};
}

#chylex-ttc-settings-modal h2 {
  color: ${convHex("fffe")};
  font-size: 24px;
  text-align: center;
  margin: 0;
  padding: 17px 0 16px;
  background-color: ${convHex("0009")};
}

#chylex-ttc-settings-modal .ttc-flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 4px;
}

#chylex-ttc-settings-modal .ttc-flex-column {
  flex: 0 0 calc(100% / 3);
}

#chylex-ttc-settings-modal p {
  color: ${convHex("fffd")};
  font-size: 14px;
  margin-top: 8px;
  padding: 0 10px;
}

#chylex-ttc-settings-modal p:first-of-type {
  margin-top: 0;
}

#chylex-ttc-settings-modal .player-menu__header {
  margin-bottom: 0;
  color: ${convHex("fffa")};
}

#chylex-ttc-settings-modal .player-menu__item {
  align-items: center;
}

#chylex-ttc-settings-modal .player-switch {
  margin-bottom: 0;
}

#chylex-ttc-settings-modal input[type="range"] {
  width: auto;
}

#chylex-ttc-settings-modal output {
  color: ${convHex("fffc")};
  width: 46px;
  padding-left: 4px;
  text-align: right;
}`);
  
  document.head.appendChild(style);
}

function debounce(func, wait){
  let timeout = -1;
  
  return function(){
    window.clearTimeout(timeout);
    timeout = window.setTimeout(func, wait);
  };
}
                          
function createSettingsModal(){
  tryRemoveElement(document.getElementById("chylex-ttc-settings-modal"));
  
  let generateToggle = function(title, option){
    window.setTimeout(function(){
      let toggle = document.getElementById("ttc-opt-"+option);
      
      toggle.addEventListener("click", function(){
        settings[option] = !(toggle.getAttribute("data-value") === "on");
        toggle.setAttribute("data-value", settings[option] ? "on" : "off");
        onSettingsUpdated();
      });
    }, 1);
    
    return `
<div class="player-menu__section" data-enabled="true">
  <div class="player-menu__header">
    <span class="js-menu-header">${title}</span>
  </div>
  <div class="player-menu__item pl-flex pl-flex--nowrap">
    <a id="ttc-opt-${option}" class="player-switch" data-value="${settings[option] ? `on` : `off`}">
      <div class="switch-label">ON</div>
      <div class="switch-toggle"></div>
      <div class="switch-label">OFF</div>
    </a>
  </div>
</div>`;
  };
  
  let generateSlider = function(title, option, cfg){
    window.setTimeout(function(){
      let slider = document.getElementById("ttc-opt-"+option);
      let regenerate = debounce(onSettingsUpdated, cfg.wait);
      
      slider.addEventListener("input", function(){
        settings[option] = parseInt(slider.value, 10);
        document.getElementById("ttc-optval-"+option).value = slider.value+cfg.text;
        regenerate();
      });
    }, 1);
    
    return `
<div class="player-menu__section" data-enabled="true">
  <div class="player-menu__header">
    <span class="js-menu-header">${title}</span>
  </div>
  <div class="player-menu__item pl-flex pl-flex--nowrap">
    <input id="ttc-opt-${option}" type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${settings[option]}">
    <output id="ttc-optval-${option}" for="ttc-opt-${option}">${settings[option]}${cfg.text}</option>
  </div>
</div>
`;
  };
  
  let modal = document.createElement("div");
  modal.id = "chylex-ttc-settings-modal";
  modal.innerHTML = `
<h2>Transparent Twitch Chat</h2>

<div class="ttc-flex-container">
  <div class="ttc-flex-column">
    <p>Chat Layout</p>
    ${generateSlider("Chat Width", "chatWidth", { min: 250, max: 600, step: 25, wait: 500, text: "px" })}
    ${generateToggle("Chat on Left Side", "chatLeftSide")}
    ${generateToggle("Hide Chat Header", "hideHeader")}
  </div>

  <div class="ttc-flex-column">
    <p>Colors &amp; Opacity</p>
    ${generateSlider("Background Opacity", "backgroundOpacity", { min: 0, max: 100, step: 5, wait: 100, text: "%" })}
    ${generateSlider("Badge Opacity", "badgeOpacity", { min: 0, max: 100, step: 5, wait: 100, text: "%" })}
    ${generateToggle("Gray Theme", "grayTheme")}
  </div>

  <div class="ttc-flex-column">
    <p>Badges</p>
    ${generateToggle("Hide Turbo Badge", "hideBadgeTurbo")}
    ${generateToggle("Hide Prime Badge", "hideBadgePrime")}
    ${generateToggle("Hide Subscriber Badge", "hideBadgeSubscriber")}
  </div>
</div>
`;
  
  document.body.appendChild(modal);
  
  modal.addEventListener("click", function(e){
    e.stopPropagation();
  });
}

function insertSettingsButton(){
  let container = document.getElementsByClassName("chat-container")[0];
  
  if (!container){
    return;
  }
  
  tryRemoveElement(document.getElementById("chylex-ttc-settings-btn"));
  tryRemoveElement(document.getElementById("chylex-ttc-settings-modal"));
  
  let button = document.createElement("div");
  button.id = "chylex-ttc-settings-btn";
  button.innerHTML = '<span class="player-tip js-tip" data-tip="Transparent Twitch Chat"></span><svg><use xlink:href="#icon_settings"></use></svg>';
  container.appendChild(button);
  
  button.addEventListener("click", function(e){
    if (!document.getElementById("chylex-ttc-settings-modal")){
      createSettingsModal();
      e.stopPropagation();
    }
  });
}

window.setInterval(function(){
  if (!document.getElementById("chylex-ttc-settings-btn")){
    insertSettingsButton();
  }
}, 2000);

document.body.addEventListener("click", function(){
  tryRemoveElement(document.getElementById("chylex-ttc-settings-modal"));
});

generateStaticCSS();
generateDynamicCSS();
generateSettingsCSS();
