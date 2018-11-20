// ==UserScript==
// @name         Transparent Twitch Chat
// @description  Why decide between missing a PogChamp or sacrificing precious screen space, when you can have the best of both worlds!
// @version      {VERSION}
// @namespace    https://chylex.com
// @homepageURL  https://github.com/chylex/Transparent-Twitch-Chat
// @supportURL   https://github.com/chylex/Transparent-Twitch-Chat/issues
// @updateURL    https://github.com/chylex/Transparent-Twitch-Chat/raw/master/dist/TransparentTwitchChat.user.js
// @include      https://www.twitch.tv/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @noframes
// ==/UserScript==

const settings = {
  globalSwitch: true,
  
  chatWidth: 350,
  chatFilters: "",
  grayTheme: false,
  
  hideHeader: true,
  hideChatInput: false,
  hidePinnedCheer: false,
  hideConversations: false,
  
  transparentChat: true,
  smoothTextShadow: false,
  chatLeftSide: false,
  backgroundOpacity: 30,
  
  hideBadgeTurbo: true,
  hideBadgePrime: true,
  hideBadgeSubscriber: true,
  badgeOpacity: 85
};

if (typeof GM_getValue !== "undefined"){
  for(let key in settings){
    settings[key] = GM_getValue(key, settings[key]);
  }
}

const isFirefox = "mozPaintCount" in window;

function tryRemoveElement(ele){
  if (ele && ele.parentNode){
    ele.parentNode.removeChild(ele);
  }
}

function onSettingsUpdated(){
  generateCustomCSS();
  refreshChatFilters();
  
  if (typeof GM_setValue !== "undefined"){
    for(let key in settings){
      GM_setValue(key, settings[key]);
    }
  }
}

// Styles

function generateCustomCSS(){
  if (!settings.globalSwitch){
    tryRemoveElement(document.getElementById("chylex-ttc-style-custom"));
    return;
  }
  
  const wa = ":not(.ttcwa)"; // selector priority workaround
  const rcol = ".right-column--theatre";
  const rcolBlur = ".right-column--theatre:not(:hover)";
  const fullWidth = ".ttc-rcol-collapsed";
  const fullScreen = ".ttc-player-fullscreen";
  
  let style = document.getElementById("chylex-ttc-style-custom");
  
  if (!style){
    style = document.createElement("style");
    style.id = "chylex-ttc-style-custom";
  }
  
  style.innerHTML = `@#rem{{

@#css{{

// fix scrollbars

${rcolBlur} .chat-list__lines .simplebar-track.vertical {
  visibility: hidden !important;
}

@#css}}

${isFirefox ? `@#css{{
  ${rcol} .video-chat__message-list-wrapper:not(.video-chat__message-list-wrapper--unsynced) {
    overflow-y: hidden !important;
  }
@#css}}` : ``}

@#css{{

// general chat styles

${rcolBlur} .channel-root__right-column${wa} {
  background: rgba(14, 12, 19, ${settings.backgroundOpacity * 0.01}) !important;
}

${rcol} .channel-root__right-column${wa} {
  width: ${settings.chatWidth - 10}px;
}

${rcol} .video-chat {
  flex-basis: auto !important;
}

${rcol} .video-chat__header {
  display: none !important;
}

${rcol} .room-selector__header${wa} {
  border-right: none !important;
}

${rcol} .room-picker {
  width: ${settings.chatWidth - 10}px;
}

${rcol} .hidden {
  display: none;
}

${rcol} .video-chat__sync-button {
  width: ${settings.chatWidth - 50}px;
  z-index: 10;
  background-color: #b8b5c0 !important;
}

@#css}}

${settings.chatWidth < 350 ? `@#css{{
  ${rcol} .video-chat__settings, ${rcol} .chat-settings {
    width: ${settings.chatWidth - 50}px;
  }
@#css}}` : ``}

${settings.hideHeader ? `@#css{{
  ${rcolBlur} .room-selector__header {
    display: none !important;
  }
@#css}}` : ``}

${settings.hideChatInput ? `@#css{{
  ${rcolBlur} .chat-input, ${rcolBlur} .video-chat__input {
    display: none !important;
  }
@#css}}` : ``}

${settings.hidePinnedCheer ? `@#css{{
  .pinned-cheer, .pinned-cheer-v2 {
    display: none;
  }
@#css}}` : ``}

// BTTV workarounds

// .theatre .ember-chat.roomMode${wa}, .theatre .chat-messages${wa}, .theatre .ember-chat${wa} { // TODO
//   background: none !important;
// }

// .theatre .rightcol-content${wa} { // TODO
//   background: none !important;
//   z-index: 3 !important;
// }

${settings.transparentChat ? `@#css{{

  // expand player width, FrankerFaceZ workaround

  // .theatre .ct-bar--active.ct-bar--ember, .theatre #main_col { // TODO
  //   right: 0;
  // }

  // body${wa} .app-main.theatre${wa} #main_col, .theatre #flash { // TODO
  //   margin-right: 0 !important;
  // }

  // body${wa} .app-main.theatre${wa} #main_col${wa} #player${wa} { // TODO
  //   right: 0 !important;
  // }

  body:not(${fullScreen}) .persistent-player--theatre {
    width: 100% !important;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .hover-display div[class|="pl-controls"] {
    padding-right: ${settings.chatWidth - 10}px;
  }

  body:not(${fullScreen}) .persistent-player--theatre .pl-close-button {
    margin-right: 20px;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .pl-close-button {
    margin-right: ${settings.chatWidth + 10}px;
  }

  body:not(${fullScreen}) .persistent-player--theatre .player-streamstatus {
    margin-right: ${settings.chatWidth + 10}px !important;
    padding-right: 1.5em !important;
  }

  body${fullWidth}:not(${fullScreen}) .persistent-player--theatre .player-streamstatus {
    margin-right: 20px !important;
  }

  // chat container transparency

  ${rcol} .tw-border-l.tw-c-background-alt-2${wa} {
    border-left: none !important;
  }

  ${rcolBlur} .video-chat__header {
    background-color: @#hex(17141f66) !important;
    box-shadow: none !important;
  }

  ${rcolBlur} .video-chat__input {
    background: transparent !important;
    box-shadow: none !important;
  }

  ${rcolBlur} .chylex-ttc-chat-container {
    color: #ece8f3 !important;
  }

  ${rcol} .room-selector__header {
    border-left: none !important;
  }

  ${rcolBlur} .room-selector__header {
    background: rgba(14, 12, 19, ${settings.backgroundOpacity * 0.01}) !important;
    border-bottom-color: rgba(44, 37, 65, ${settings.backgroundOpacity * 0.01}) !important;
  }

  ${rcolBlur} .room-selector__header > p, ${rcolBlur} .room-selector__header .tw-button__text > div {
    color: #dad8de !important;
    text-shadow: -1px 0 0 @#hex(000a), 0 -1px 0 @#hex(000a), 1px 0 0 @#hex(000a), 0 1px 0 @#hex(000a);
  }

  ${rcolBlur} .chat-input, ${rcolBlur} .video-chat__input {
    opacity: 0.6;
  }

  // chat message shadow

  ${rcolBlur} .chylex-ttc-chat-container {
    ${settings.smoothTextShadow ? `
    text-shadow: 0 0 2px @#hex(000d), -1px 0 1px @#hex(0006), 0 -1px 1px @#hex(0006), 1px 0 1px @#hex(0006), 0 1px 1px @#hex(0006);
    ` : `
    text-shadow: -1px 0 0 @#hex(000a), 0 -1px 0 @#hex(000a), 1px 0 0 @#hex(000a), 0 1px 0 @#hex(000a);
    `}
  }

  ${rcolBlur} .chat-author__display-name, ${rcolBlur} .vod-message__timestamp {
    ${settings.smoothTextShadow ? `
    text-shadow: -1px 0 1px @#hex(0006), 0 -1px 1px @#hex(0006), 1px 0 1px @#hex(0006), 0 1px 1px @#hex(0006);
    ` : `
    text-shadow: -1px 0 0 @#hex(0008), 0 -1px 0 @#hex(0008), 1px 0 0 @#hex(0008), 0 1px 0 @#hex(0008);
    `}
  }

  ${rcolBlur} .chat-line__message--mention-recipient {
    text-shadow: none;
  }

  // chat messages

  ${rcolBlur} .vod-message__timestamp {
    color: #b7b5ba !important;
  }

  ${rcolBlur} .chat-line__message a {
    color: #cdb9f5 !important;
  }

  // conversation menu

  .whispers--theatre-mode .whispers-threads-box__container:not(.whispers-threads-box__container--open):not(:hover) {
    opacity: ${Math.max(0.1, settings.backgroundOpacity * 0.01)};
  }
@#css}}` : `@#css{{

  // adapt player size with disabled transparency

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre {
    width: calc(100% - ${settings.chatWidth - 10}px) !important;
  }

  body:not(${fullScreen}) .persistent-player--theatre .player-streamstatus {
    margin-right: 20px !important;
  }
@#css}}`}

// conversation menu and bottom margin

.whispers--theatre-mode.whispers--right-column-expanded {
  right: ${settings.chatWidth - 10}px !important;
}

${settings.hideConversations ? `@#css{{
  .whispers--theatre-mode {
    display: none;
  }

  .video-player--theatre .video-player__container {
    bottom: 0 !important;
  }
@#css}}` : ``}

// chat on left side

${settings.chatLeftSide && settings.transparentChat ? `@#css{{
  ${rcol}${wa}, ${rcol} .chat-list__lines .simplebar-track.vertical {
    left: 0 !important;
    right: auto !important;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .hover-display div[class|="pl-controls"] {
    padding-left: ${settings.chatWidth - 10}px;
    padding-right: 0;
  }

  .persistent-player--theatre .pl-close-button {
    margin-right: 0 !important;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .player-streaminfo {
    margin-left: 40px;
  }

  body${fullWidth}:not(${fullScreen}) .persistent-player--theatre .player-streaminfo {
    margin-left: 25px;
  }

  body:not(${fullScreen}) .persistent-player--theatre .player-streamstatus${wa} {
    margin-right: 0px !important;
    padding-right: 1.5em !important;
  }

  .whispers--theatre-mode${wa} {
    right: 0px !important;
  }

  ${rcol} .right-column__toggle-visibility {
    left: 5px;
    right: auto;
    margin-left: ${settings.chatWidth - 10}px;
    transform: rotate(180deg) !important;
  }

  ${rcol}.right-column--collapsed .right-column__toggle-visibility {
    margin-left: 0;
  }
@#css}}` : ``}

// gray theme

${settings.grayTheme ? `@#css{{
  ${rcol} .tw-border-l.tw-c-background-alt-2 {
    border-left-color: #2b2b2b !important;
  }

  ${rcol} .channel-root__right-column${wa} {
    background: #0e0e0e !important;
  }

  ${rcolBlur} .channel-root__right-column${wa} {
    background: rgba(14, 14, 14, ${settings.transparentChat ? (settings.backgroundOpacity * 0.01) : 1}) !important;
  }

  ${rcolBlur} .room-selector__header${wa} {
    background: rgba(14, 14, 14, ${settings.transparentChat ? (settings.backgroundOpacity * 0.01) : 1}) !important;
    border-bottom-color: rgba(42, 42, 42, ${settings.transparentChat ? (settings.backgroundOpacity * 0.01) : 1}) !important;
  }

  ${rcol} .room-selector__header${wa} {
    background: #0e0e0e !important;
    border-bottom-color: #2b2b2b !important;
    ${settings.transparentChat ? "" : "border-left-color: #2b2b2b !important;"}
  }

  ${rcol} .video-chat__input {
    box-shadow: inset 0 1px 0 0 #2b2b2b !important;
  }

  ${rcol} [data-a-target="video-chat-input"], ${rcol} [data-a-target="chat-input"] {
    background-color: #0e0e0e !important;
    border-color: #2b2b2b !important;
  }

  ${rcol} [data-a-target="video-chat-input"]:focus, ${rcol} [data-a-target="chat-input"]:focus {
    border-color: #787878 !important;
    box-shadow: 0 0 6px -2px #787878 !important;
  }

  ${rcol} [data-a-target="chat-send-button"], ${rcol} [data-a-target="video-chat-submit-button"] {
    background-color: #2b2b2b !important;
    border: 1px solid #000000 !important;
  }

  ${rcol} [data-a-target="chat-send-button"]:active, ${rcol} [data-a-target="chat-send-button"]:focus,
  ${rcol} [data-a-target="video-chat-submit-button"]:active, ${rcol} [data-a-target="video-chat-submit-button"]:focus {
    box-shadow: 0 0 6px 0 #787878 !important;
  }

  .whispers--theatre-mode .whispers-threads-box__container:not(.whispers-threads-box__container--open) {
    border-top-color: #2b2b2b !important;
    border-right-color: #2b2b2b !important;
    border-bottom-color: #2b2b2b !important;
    border-left-color: #2b2b2b !important;
  }

  .whispers--theatre-mode .whispers-threads-box__open-close${wa} {
    background-color: #0e0e0e !important;
  }
@#css}}` : ``}

@#css{{

// badge tweaks

${rcolBlur} a[data-a-target="chat-badge"] {
  opacity: ${settings.badgeOpacity / 100};
  ${settings.badgeOpacity === 0 ? `display: none !important;` : ``}
}

@#css}}

${settings.hideBadgeTurbo ? `@#css{{
  ${rcol} .chat-badge[alt="Turbo"] {
   display: none;
  }
@#css}}` : ``}

${settings.hideBadgePrime ? `@#css{{
  ${rcol} .chat-badge[alt$="Prime"] {
   display: none;
  }
@#css}}` : ``}

${settings.hideBadgeSubscriber ? `@#css{{
  ${rcol} .chat-badge[alt~="Subscriber"] {
   display: none;
  }
@#css}}` : ``}

@#css{{

// dynamic styles for settings, replaces default style

#chylex-ttc-settings-btn {
  margin-left: ${settings.chatWidth - 60}px;
}

@#css}}
@#rem}}`;
  
  document.head.appendChild(style);
}

function generateSettingsCSS(){
  if (document.getElementById("chylex-ttc-style-settings")){
    return;
  }
  
  const style = document.createElement("style");
  style.id = "chylex-ttc-style-settings";
  style.innerHTML = `@#rem{{@#css{{

// settings button

#chylex-ttc-settings-btn {
  display: none;
  width: 3em;
  height: 3em;
  position: absolute;
  bottom: 128px;
  margin-left: 290px;
  z-index: 9;
  cursor: pointer;
  fill: @#hex(fffa);
}

.video-chat #chylex-ttc-settings-btn {
  bottom: 135px;
}

#chylex-ttc-settings-btn:hover .player-tip {
  display: inline-block;
  width: auto;
  left: 50%;
  top: 0.5em;
  margin-left: -13.75em;
  z-index: 8;
}

#chylex-ttc-settings-btn svg {
  width: 100%;
  height: 100%;
}

#chylex-ttc-settings-btn:hover {
  fill: #fff;
}

.right-column--theatre:hover #chylex-ttc-settings-btn {
  display: block;
}

// settings modal

#chylex-ttc-settings-modal {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 630px;
  height: 292px;
  margin-left: -315px;
  margin-top: -146px;
  z-index: 10000;
  background-color: @#hex(111c);
}

#chylex-ttc-settings-modal #ttc-opt-global-wrapper {
  position: absolute;
  margin: 5px 0 0 -69px;
  display: inline-block;
}

#chylex-ttc-settings-modal h2 {
  color: @#hex(fffe);
  font-size: 24px;
  text-align: center;
  margin: 0;
  padding: 14px 0 13px;
  background-color: @#hex(0009);
}

#chylex-ttc-settings-modal .ttc-flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 4px;
}

#chylex-ttc-settings-modal .ttc-flex-column {
  flex: 0 0 calc(100% / 4);
}

#chylex-ttc-settings-modal p {
  color: @#hex(fffd);
  font-size: 14px;
  margin-top: 8px;
  padding: 0 9px;
}

#chylex-ttc-settings-modal p:first-of-type {
  margin: 0 0 4px;
}

#chylex-ttc-settings-modal .player-menu__section {
  padding: 0 12px 2px;
}

#chylex-ttc-settings-modal .player-menu__header {
  margin-bottom: 0;
  color: @#hex(fffa);
}

#chylex-ttc-settings-modal .player-menu__item {
  align-items: center;
  margin: 2px 0 9px;
  padding-left: 1px;
}

#chylex-ttc-settings-modal .switch {
  font-size: 10px;
  height: 17px;
  line-height: 17px;
}

#chylex-ttc-settings-modal .switch span {
  width: 27px;
}

#chylex-ttc-settings-modal .switch.active span {
  left: 25px;
}

#chylex-ttc-settings-modal .switch::before, #chylex-ttc-settings-modal .switch::after {
  width: 26px;
  box-sizing: border-box;
}

#chylex-ttc-settings-modal .switch::before {
  text-align: left;
  padding-left: 5px;
}

#chylex-ttc-settings-modal .switch::after {
  text-align: right;
  padding-right: 3px;
}

#chylex-ttc-settings-modal input[type="range"] {
  width: auto;
}

#chylex-ttc-settings-modal .tw-toggle__button::after {
  border-radius: 0;
}

#chylex-ttc-settings-modal output {
  color: @#hex(fffc);
  width: 46px;
  padding-left: 4px;
  text-align: right;
}
@#css}}@#rem}}`;
  
  document.head.appendChild(style);
}

// Filters

function getNodeText(node){
  if (node.nodeType === Node.TEXT_NODE){
    return node.nodeValue;
  }
  
  if (node.nodeType === Node.ELEMENT_NODE){
    if (node.tagName === "IMG"){
      return node.getAttribute("alt") || "";
    }
    else{
      let text = "";
      
      for(let child of node.childNodes){
        text += getNodeText(child);
      }
      
      return text;
    }
  }
  
  return "";
}

var filtersRegex = null;

var filtersObserver = new MutationObserver(function(mutations){
  for(let mutation of mutations){
    for(let added of mutation.addedNodes){
      let text;
      const classes = added.classList;
      
      if (classes.contains("chat-line__message")){
        const nodes = Array.from(added.childNodes);
        const colon = nodes.findIndex(node => node.tagName === "SPAN" && node.innerText === ": ");
        text = nodes.slice(colon+1).map(getNodeText).join("");
      }
      else{
        text = getNodeText(added.querySelector(".qa-mod-message") || added);
      }
      
      if (filtersRegex.test(text)){
        classes.add("hidden");
      }
    }
  }
});

function refreshChatFilters(){
  const chat = document.querySelector(".chat-list__lines .simplebar-content > div, .video-chat__message-list-wrapper ul");
  
  if (!chat){
    return false;
  }
  
  const filters = (settings.chatFilters || "").split(",").map(entry => entry.trim()).filter(entry => !!entry);
  
  if (filters.length === 0){
    filtersRegex = null;
  }
  else{
    const options = filters.map(entry => entry.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "(?:\\S*)").replace(/\s+/g, "\\s+")).join("|");
    filtersRegex = new RegExp("(?:^|[^a-z0-9])(?:"+options+")(?:$|[^a-z0-9])", "i");
  }
  
  if (filtersRegex && settings.globalSwitch){
    filtersObserver.observe(chat, { childList: true });
  }
  else{
    filtersObserver.disconnect();
  }
  
  return true;
}

// Helpers

var classObserverCallback = function(mutations){
  for(let mutation of mutations){
    const classes = mutation.target.classList;
    
    if (classes.contains("right-column")){
      document.body.classList.toggle("ttc-rcol-collapsed", classes.contains("right-column--collapsed"));
    }
    else if (classes.contains("video-player")){
      document.body.classList.toggle("ttc-player-fullscreen", classes.contains("video-player--fullscreen"));
    }
  }
};

var classObserver = new MutationObserver(classObserverCallback);

function setupClassHelpers(){
  const col = document.querySelector(".right-column");
  const player = document.querySelector(".video-player");
  
  if (!col || !player){
    return false;
  }
  
  classObserver.observe(col, { attributes: true, attributeFilter: [ "class" ] });
  classObserver.observe(player, { attributes: true, attributeFilter: [ "class" ] });
  
  classObserverCallback([
    { target: col },
    { target: player }
  ]);
  
  return true;
}

// Settings

function debounce(func, wait){
  let timeout = -1;
  
  return function(){
    window.clearTimeout(timeout);
    timeout = window.setTimeout(func, wait);
  };
}

function createSettingsModal(){
  tryRemoveElement(document.getElementById("chylex-ttc-settings-modal"));
  
  const generateToggle = function(title, option){
    window.setTimeout(function(){
      const toggle = document.getElementById("ttc-opt-"+option);
      
      toggle.addEventListener("click", function(){
        settings[option] = toggle.checked;
        onSettingsUpdated();
      });
    }, 1);
    
    return `
<div class="player-menu__section" data-enabled="true">
  <div class="player-menu__header">
    <span class="js-menu-header">${title}</span>
  </div>
  <div class="player-menu__item pl-flex pl-flex--nowrap flex-shrink-0">
    <div class="tw-toggle">
      <input class="tw-toggle__input" id="ttc-opt-${option}" value="${settings[option] ? "on" : "off"}" type="checkbox"${settings[option] ? " checked" : ""}>
      <label for="ttc-opt-${option}" class="tw-toggle__button"></label>
    </div>
  </div>
</div>`;
  };
  
  const generateTxtbox = function(title, option, cfg){
    window.setTimeout(function(){
      const input = document.getElementById("ttc-opt-"+option);
      
      input.addEventListener("input", debounce(function(){
        settings[option] = input.value;
        onSettingsUpdated();
      }, cfg.wait));
    }, 1);
    
    return `
<div class="player-menu__section" data-enabled="true">
  <div class="player-menu__header">
    <span class="js-menu-header">${title}</span>
  </div>
  <div class="player-menu__item pl-flex pl-flex--nowrap">
    <input id="ttc-opt-${option}" type="text" value="${settings[option]}" placeholder="${cfg.placeholder}">
  </div>
</div>`;
  };
  
  const generateSlider = function(title, option, cfg){
    window.setTimeout(function(){
      const slider = document.getElementById("ttc-opt-"+option);
      const regenerate = debounce(onSettingsUpdated, cfg.wait);
      
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
</div>`;
  };
  
  const modal = document.createElement("div");
  modal.id = "chylex-ttc-settings-modal";
  modal.innerHTML = `
<h2>
  <div id="ttc-opt-global-wrapper" class="tw-toggle">
    <input class="tw-toggle__input" id="ttc-opt-global" value="${settings.globalSwitch ? "on" : "off"}" type="checkbox"${settings.globalSwitch ? " checked" : ""}>
    <label for="ttc-opt-global" class="tw-toggle__button"></label>
  </div>

  <span>Transparent Twitch Chat</span>
</h2>

<div class="ttc-flex-container">
  <div class="ttc-flex-column">
    <p>General</p>
    ${generateSlider("Chat Width", "chatWidth", { min: 250, max: 600, step: 25, wait: 500, text: "px" })}
    ${generateTxtbox("Chat Filters", "chatFilters", { wait: 500, placeholder: "Example: kappa, *abc*" })}
    ${generateToggle("Gray Theme", "grayTheme")}
  </div>

  <div class="ttc-flex-column">
    <p>Transparency</p>
    ${generateToggle("Transparent Chat", "transparentChat")}
    ${generateToggle("Smooth Text Shadow", "smoothTextShadow")}
    ${generateToggle("Chat on Left Side", "chatLeftSide")}
    ${generateSlider("Background Opacity", "backgroundOpacity", { min: 0, max: 100, step: 5, wait: 100, text: "%" })}
  </div>

  <div class="ttc-flex-column">
    <p>Elements</p>
    ${generateToggle("Hide Chat Header", "hideHeader")}
    ${generateToggle("Hide Chat Input", "hideChatInput")}
    ${generateToggle("Hide Pinned Cheer", "hidePinnedCheer")}
    ${generateToggle("Hide Whispers", "hideConversations")}
  </div>

  <div class="ttc-flex-column">
    <p>Badges</p>
    ${generateToggle("Hide Turbo Badge", "hideBadgeTurbo")}
    ${generateToggle("Hide Prime Badge", "hideBadgePrime")}
    ${generateToggle("Hide Subscriber Badge", "hideBadgeSubscriber")}
    ${generateSlider("Badge Opacity", "badgeOpacity", { min: 0, max: 100, step: 5, wait: 100, text: "%" })}
  </div>
</div>
`;
  
  document.body.appendChild(modal);
  
  document.getElementById("ttc-opt-global").addEventListener("click", function(e){
    settings.globalSwitch = e.currentTarget.checked;
    onSettingsUpdated();
  });
  
  modal.addEventListener("click", function(e){
    e.stopPropagation();
  });
}

function insertSettingsButton(){
  const container = document.querySelector("[data-test-selector='chat-room-component-layout'] > div, .video-chat");
  
  if (!container){
    return false;
  }
  
  container.classList.add("chylex-ttc-chat-container");
  
  tryRemoveElement(document.getElementById("chylex-ttc-settings-btn"));
  tryRemoveElement(document.getElementById("chylex-ttc-settings-modal"));
  
  const button = document.createElement("div");
  button.id = "chylex-ttc-settings-btn";
  button.innerHTML = '<span class="player-tip js-tip" data-tip="Transparent Twitch Chat"></span><svg><use xlink:href="#icon_settings"></use></svg>';
  container.appendChild(button);
  
  button.addEventListener("click", function(e){
    if (!document.getElementById("chylex-ttc-settings-modal")){
      createSettingsModal();
      e.stopPropagation();
    }
  });
  
  if (isFirefox && container.classList.contains("video-chat")){
    const wrapper = document.querySelector(".video-chat__message-list-wrapper");
    const unsynced = "video-chat__message-list-wrapper--unsynced";
    
    wrapper.addEventListener("wheel", function(e){
      if (e.deltaY < 0){
        wrapper.classList.add(unsynced);
      }
    });
    
    wrapper.addEventListener("keydown", function(e){
      if (e.keyCode === 38 || e.keyCode === 33){ // up arrow || page up
        wrapper.classList.add(unsynced);
      }
    });
  }
  
  return true;
}

// Setup

var prevAddress = null;
var rehookInterval = null;

window.setInterval(function(){
  if (location.href != prevAddress){
    prevAddress = location.href;
    
    var hooks = [
      refreshChatFilters,
      setupClassHelpers,
      insertSettingsButton
    ];
    
    window.clearInterval(rehookInterval);
    
    rehookInterval = window.setInterval(function(){
      for(let index = hooks.length - 1; index >= 0; index--){
        if (hooks[index]()){
          hooks.splice(index, 1);
        }
      }
      
      if (hooks.length === 0){
        window.clearInterval(rehookInterval);
        rehookInterval = null;
      }
    }, 250);
  }
}, 1000);

document.body.addEventListener("click", function(){
  tryRemoveElement(document.getElementById("chylex-ttc-settings-modal"));
});

generateSettingsCSS();
generateCustomCSS();
