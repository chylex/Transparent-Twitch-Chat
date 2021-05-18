// ==UserScript==
// @name         Transparent Twitch Chat
// @description  Why decide between missing a PogChamp or sacrificing precious screen space, when you can have the best of both worlds!
// @version      {VERSION}
// @namespace    https://chylex.com
// @homepageURL  https://github.com/chylex/Transparent-Twitch-Chat
// @supportURL   https://github.com/chylex/Transparent-Twitch-Chat/issues
// @downloadURL  https://github.com/chylex/Transparent-Twitch-Chat/raw/master/dist/TransparentTwitchChat.user.js
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
  playerPosition: "center center",
  hideTimestamps: true,
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
  hideBadgeVIP: false,
  hideBadgeSubGift: false,
  hideBadgeBitCheer: false,
  hideBadgeLeader: false,
  badgeOpacity: 85
};

if (typeof GM_getValue !== "undefined"){
  for(let key in settings){
    settings[key] = GM_getValue(key, settings[key]);
  }
}

const isFirefox = navigator.userAgent.includes(" Gecko/") || "mozFullScreen" in document;

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
  const isTheatre = ".ttc-theatre";
  const fullWidth = ".ttc-rcol-collapsed";
  const fullScreen = ".ttc-player-fullscreen";
  
  const isChatLeft = settings.chatLeftSide && settings.transparentChat;
  
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

// fix sidebar popping into foreground

${isTheatre} .side-nav {
  display: none !important;
}

@#css}}

${isFirefox ? `@#css{{
  ${rcol} .video-chat__message-list-wrapper:not(.video-chat__message-list-wrapper--unsynced) {
    overflow-y: hidden !important;
  }
@#css}}` : ``}

@#css{{

// general player styles

${isTheatre} .video-player video {
  object-position: ${settings.playerPosition == "#opposite-chat" ? (isChatLeft ? "center right" : "center left") : settings.playerPosition} !important;
}

// general chat styles

${rcol}${wa}, ${rcol} .channel-root__right-column${wa} {
  width: ${settings.chatWidth - 10}px !important;
}

${rcol} .chat-shell__expanded {
  min-width: 0 !important;
}

${rcol} .video-chat {
  flex-basis: auto !important;
}

${rcol} .video-chat__header {
  display: none !important;
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

#root[data-a-page-loaded-name="VideoWatchPage"] ${rcolBlur}:not(.right-column--collapsed) .right-column__toggle-visibility {
  display: none !important;
}

${settings.hideTimestamps ? `@#css{{
  ${rcol} .vod-message--timestamp .tw-tooltip-wrapper,
  ${rcol} .vod-message div[data-test-selector="message-timestamp"] {
    display: none !important;
  }
  
  ${rcol} .vod-message--timestamp {
    padding-left: 0.5rem;
  }
@#css}}` : ``}

${settings.hideHeader ? `@#css{{
  ${rcolBlur} .stream-chat-header {
    display: none !important;
  }
  
  ${rcolBlur}:not(.right-column--collapsed) .right-column__toggle-visibility {
    display: none !important;
  }
@#css}}` : ``}

${settings.hideChatInput ? `@#css{{
  ${rcolBlur} .chat-input {
    display: none !important;
  }
@#css}}` : ``}

${settings.hidePinnedCheer ? `@#css{{
  .channel-leaderboard {
    display: none;
  }
@#css}}` : ``}

${settings.transparentChat ? `@#css{{

  // expand player width

  body:not(${fullScreen}) .persistent-player--theatre {
    width: 100% !important;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .top-bar,
  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre div[data-a-target="player-controls"] {
    padding-right: ${settings.chatWidth - 10}px;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .player-overlay-background > div {
    right: ${settings.chatWidth - 10}px !important;
  }

  // chat container transparency

  ${rcolBlur} .channel-root__right-column${wa} {
    background: rgba(14, 12, 19, ${settings.backgroundOpacity * 0.01}) !important;
  }

  ${rcolBlur} .channel-root__right-column${wa} > div, ${rcol} .chat-room {
    background: transparent !important;
  }

  ${rcolBlur} .chylex-ttc-chat-container {
    color: #ece8f3 !important;
  }

  ${rcolBlur} .rooms-header, ${rcolBlur} .leaderboard-header-tabbed-layout {
    background: transparent !important;
  }

  ${rcolBlur} .chat-input {
    opacity: 0.6;
  }

  // chat messages

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

  ${rcolBlur} .chat-line__message a {
    color: #cdb9f5 !important;
  }
  
  ${rcolBlur} .user-notice-line {
    background-color: rgba(31, 31, 35, 0.45) !important;
  }
  
  ${rcolBlur} .user-notice-line--highlighted {
    border-left-color: transparent !important;
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

.whispers--theatre-mode.whispers--right-column-expanded-beside {
  right: ${settings.chatWidth - 10}px !important;
}

${settings.hideConversations ? `@#css{{
  .whispers--theatre-mode${wa} {
    display: none !important;
  }

  .video-player__container--theatre-whispers, .highwind-video-player__container--theatre-whispers {
    bottom: 1px !important; // allows hiding player controls in fullscreen by moving cursor all the way down
  }
@#css}}` : ``}

// chat on left side

${isChatLeft ? `@#css{{
  ${rcol}${wa}, ${rcol} .chat-list__lines .simplebar-track.vertical {
    left: 0 !important;
    right: auto !important;
  }

  ${rcol} .channel-root__right-column${wa} {
    border-left: none !important;
    border-right: var(--border-width-default) solid var(--color-border-base) !important;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .top-bar {
    padding-left: ${settings.chatWidth}px;
    padding-right: 0;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre div[data-a-target="player-controls"] {
    padding-left: ${settings.chatWidth - 10}px;
    padding-right: 0;
  }

  body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .player-overlay-background > div {
    left: ${settings.chatWidth - 10}px !important;
    right: 0 !important;
  }

  .whispers--theatre-mode.whispers--right-column-expanded-beside {
    right: 0px !important;
  }

  ${rcol} .right-column__toggle-visibility {
    transform: rotate(180deg) !important;
  }

  ${rcol}.right-column--collapsed .right-column__toggle-visibility {
    left: 0.5rem;
  }
@#css}}` : ``}

// gray theme

${settings.grayTheme ? `@#css{{
  ${rcol} [data-a-target="chat-input"] {
    background-color: #0e0e0e !important;
    border-color: #2b2b2b !important;
  }

  ${rcol} [data-a-target="chat-input"]:focus {
    border-color: #787878 !important;
    box-shadow: 0 0 6px -2px #787878 !important;
  }

  ${rcol} [data-a-target="chat-send-button"] {
    background-color: #2b2b2b !important;
    border: 1px solid #000000 !important;
  }

  ${rcol} [data-a-target="chat-send-button"]:active, ${rcol} [data-a-target="chat-send-button"]:focus {
    box-shadow: 0 0 6px 0 #787878 !important;
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

${settings.hideBadgeVIP ? `@#css{{
  ${rcol} .chat-badge[alt="VIP"] {
   display: none;
  }
@#css}}` : ``}

${settings.hideBadgeSubGift ? `@#css{{
  ${rcol} .chat-badge[alt*="Gift Subs"] {
   display: none;
  }
@#css}}` : ``}

${settings.hideBadgeBitCheer ? `@#css{{
  ${rcol} .chat-badge[alt~="cheer"] {
   display: none;
  }
@#css}}` : ``}

${settings.hideBadgeLeader ? `@#css{{
  ${rcol} .chat-badge[alt*="Bits Leader"], ${rcol} .chat-badge[alt*="Gifter Leader"] {
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
  width: 2.5em;
  height: 2.5em;
  position: absolute;
  bottom: 105px;
  margin-left: 290px;
  z-index: 9;
  cursor: pointer;
  fill: @#hex(fffa);
}

.video-chat #chylex-ttc-settings-btn {
  bottom: 18px;
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
  width: 870px;
  height: 294px;
  margin-left: -435px;
  margin-top: -147px;
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
  display: flex;
  align-items: center;
  margin: 2px 0 9px;
  padding-left: 1px;
}

#chylex-ttc-settings-modal .player-menu__item.ttc-setting-small-margin {
  margin-bottom: 7px;
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

#chylex-ttc-settings-modal input[type="text"] {
  width: 100%;
  padding: 1px 4px;
}

#chylex-ttc-settings-modal input[type="range"] {
  width: 100%;
}

#chylex-ttc-settings-modal select {
  width: 100%;
  padding: 1px 0;
}

#chylex-ttc-settings-modal output {
  color: @#hex(fffc);
  display: inline-block;
  flex: 1 1 42px;
  padding-left: 6px;
  text-align: left;
}

#chylex-ttc-settings-modal .tw-toggle__button {
  width: 4rem;
}

#chylex-ttc-settings-modal .tw-toggle__button, #chylex-ttc-settings-modal .tw-toggle__button::after {
  border-radius: 0;
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
      document.body.classList.toggle("ttc-theatre", classes.contains("right-column--theatre"));
      document.body.classList.toggle("ttc-rcol-collapsed", classes.contains("right-column--collapsed"));
    }
  }
};

var classObserver = new MutationObserver(classObserverCallback);

function setupClassHelpers(){
  const col = document.querySelector(".right-column");
  
  if (!col){
    return false;
  }
  
  classObserver.observe(col, { attributes: true, attributeFilter: [ "class" ] });
  
  classObserverCallback([
    { target: col }
  ]);
  
  return true;
}

function setupFullscreenHelper(){
  for(let event of [ "fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange" ]){
    if ("on" + event in document){
      document.addEventListener(event, function(){
        document.body.classList.toggle("ttc-player-fullscreen", document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      });
      
      break;
    }
  }
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
  
  const generateOptionBase = function(title, item, extra){
    extra = extra || {};
    
    return `
<div class="player-menu__section" data-enabled="true"${extra.floatLeft ? ` style="float:left"` : ""}>
  <div class="player-menu__header">
    <span class="js-menu-header">${title}</span>
  </div>
  <div class="player-menu__item ${extra.itemClasses ? " " + extra.itemClasses : ""}">
    ${item}
  </div>
</div>`;
  };
  
  const prepareOptionEvent = function(option, setupCallback){
    window.setTimeout(function(){
      const ele = document.getElementById("ttc-opt-" + option);
      setupCallback(ele);
    }, 1);
  };
  
  const updateOption = function(option, value){
    settings[option] = value;
    onSettingsUpdated();
  };
  
  // Concrete option types
  
  const generateToggle = function(title, option, floatLeft){
    prepareOptionEvent(option, function(ele){
      ele.addEventListener("click", function(){ updateOption(option, ele.checked); });
    });
    
    return generateOptionBase(title, `
<div class="tw-toggle">
  <input class="tw-toggle__input" id="ttc-opt-${option}" value="${settings[option] ? "on" : "off"}" type="checkbox"${settings[option] ? " checked" : ""}>
  <label for="ttc-opt-${option}" class="tw-toggle__button"></label>
</div>`, floatLeft ? { floatLeft: true } : {});
  };
  
  const generateTxtbox = function(title, option, cfg){
    prepareOptionEvent(option, function(ele){
      ele.addEventListener("input", debounce(function(){ updateOption(option, ele.value); }, cfg.wait));
    });
    
    return generateOptionBase(title, `<input id="ttc-opt-${option}" type="text" value="${settings[option]}" placeholder="${cfg.placeholder}">`);
  };
  
  const generateSelect = function(title, option, cfg){
    prepareOptionEvent(option, function(ele){
      ele.addEventListener("input", function(){ updateOption(option, ele.value); });
    });
    
    const initialOption = settings[option];
    const optionElements = Object.keys(cfg).map(function(key){
      return `<option value="${key}"${key == initialOption ? " selected" : ""}>${cfg[key]}</option>`;
    });
    
    return generateOptionBase(title, `<select id="ttc-opt-${option}">${optionElements}</select>`);
  };
  
  const generateSlider = function(title, option, cfg){
    prepareOptionEvent(option, function(ele){
      const regenerate = debounce(onSettingsUpdated, cfg.wait);
      
      ele.addEventListener("input", function(){
        settings[option] = parseInt(ele.value, 10);
        document.getElementById("ttc-optval-" + option).value = ele.value + cfg.text;
        regenerate();
      });
    });
    
    return generateOptionBase(title, `
  <input id="ttc-opt-${option}" type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${settings[option]}">
  <output id="ttc-optval-${option}" for="ttc-opt-${option}">${settings[option]}${cfg.text}</option>
`, { itemClasses: "ttc-setting-small-margin" });
  };
  
  // Generate modal
  
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
  <div style="flex: 0 0 23%">
    <p>General</p>
    ${generateSlider("Chat Width", "chatWidth", { min: 250, max: 600, step: 25, wait: 500, text: "px" })}
    ${generateTxtbox("Chat Filters", "chatFilters", { wait: 500, placeholder: "Example: kappa, *abc*" })}
    ${generateSelect("Player Position", "playerPosition", {
      "#opposite-chat": "Opposite of Chat",
      "top left":       "Top Left",
      "top center":     "Top Center",
      "top right":      "Top Right",
      "center left":    "Center Left",
      "center center":  "Center",
      "center right":   "Center Right",
      "bottom left":    "Bottom Left",
      "bottom center":  "Bottom Center",
      "bottom right":   "Bottom Right"
    })}
    ${generateToggle("Hide Timestamps", "hideTimestamps", true)}
    ${generateToggle("Gray Theme", "grayTheme")}
  </div>

  <div style="flex: 0 0 21%">
    <p>Transparency</p>
    ${generateToggle("Transparent Chat", "transparentChat")}
    ${generateToggle("Smooth Text Shadow", "smoothTextShadow")}
    ${generateToggle("Chat on Left Side", "chatLeftSide")}
    ${generateSlider("Background Opacity", "backgroundOpacity", { min: 0, max: 100, step: 5, wait: 100, text: "%" })}
  </div>

  <div style="flex: 0 0 16%">
    <p>Elements</p>
    ${generateToggle("Hide Chat Header", "hideHeader")}
    ${generateToggle("Hide Chat Input", "hideChatInput")}
    ${generateToggle("Hide Pinned Cheer", "hidePinnedCheer")}
    ${generateToggle("Hide Whispers", "hideConversations")}
  </div>

  <div style="flex: 0 0 19%">
    <p>Badges</p>
    ${generateToggle("Hide Subscriber Badge", "hideBadgeSubscriber")}
    ${generateToggle("Hide Prime Badge", "hideBadgePrime")}
    ${generateToggle("Hide Turbo Badge", "hideBadgeTurbo")}
    ${generateToggle("Hide VIP Badge", "hideBadgeVIP")}
  </div>

  <div style="flex: 0 0 21%">
    <p style="visibility: hidden">Badges</p>
    ${generateToggle("Hide Sub Gift Badge", "hideBadgeSubGift")}
    ${generateToggle("Hide Bit Cheer Badge", "hideBadgeBitCheer")}
    ${generateToggle("Hide Gift/Bit Leader Badge", "hideBadgeLeader")}
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
  button.innerHTML = '<svg viewBox="0 0 15 15"><path d="M8.463,0.062c-0.639,-0.083 -1.287,-0.083 -1.926,0l-0.251,1.333c-0.802,0.159 -1.565,0.475 -2.244,0.929l-1.12,-0.765c-0.511,0.394 -0.969,0.852 -1.363,1.363l0.765,1.12c-0.454,0.679 -0.77,1.442 -0.929,2.244l-1.333,0.251c-0.083,0.639 -0.083,1.287 0,1.926l1.333,0.251c0.159,0.802 0.475,1.565 0.929,2.244l-0.765,1.12c0.394,0.511 0.852,0.969 1.363,1.363l1.12,-0.765c0.679,0.454 1.442,0.77 2.244,0.929l0.251,1.333c0.639,0.083 1.287,0.083 1.926,0l0.251,-1.333c0.802,-0.159 1.565,-0.475 2.244,-0.929l1.12,0.765c0.511,-0.394 0.969,-0.852 1.363,-1.363l-0.765,-1.12c0.454,-0.679 0.77,-1.442 0.929,-2.244l1.333,-0.251c0.083,-0.639 0.083,-1.287 0,-1.926l-1.333,-0.251c-0.159,-0.802 -0.475,-1.565 -0.929,-2.244l0.765,-1.12c-0.394,-0.511 -0.852,-0.969 -1.363,-1.363l-1.12,0.765c-0.679,-0.454 -1.442,-0.77 -2.244,-0.929l-0.251,-1.333Zm-0.963,2.731c2.598,0 4.707,2.109 4.707,4.707c0,2.598 -2.109,4.707 -4.707,4.707c-2.598,0 -4.707,-2.109 -4.707,-4.707c0,-2.598 2.109,-4.707 4.707,-4.707Z"/><rect x="6.75" y="6" width="1.5" height="5.25"/><rect x="4.89" y="4.5" width="5.221" height="1.5"/></svg>';
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

setupFullscreenHelper();

generateSettingsCSS();
generateCustomCSS();
