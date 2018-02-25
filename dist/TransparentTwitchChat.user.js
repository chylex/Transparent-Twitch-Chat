// ==UserScript==
// @name         Transparent Twitch Chat
// @description  Why decide between missing a PogChamp or sacrificing precious screen space, when you can have the best of both worlds!
// @version      1.1.8
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
  grayTheme: false,
  hideTimestamps: false,
  
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
  
  if (typeof GM_setValue !== "undefined"){
    for(let key in settings){
      GM_setValue(key, settings[key]);
    }
  }
}

function generateCustomCSS(){
  if (!settings.globalSwitch){
    tryRemoveElement(document.getElementById("chylex-ttc-style-custom"));
    return;
  }
  
  let wa = ":not(.ttcwa)"; // selector priority workaround
  let rcol = ".right-column--theatre";
  let rcolBlur = ".right-column--theatre:not(:hover)";
  let fullWidth = "[style*='width: 100%']";
  
  let style = document.getElementById("chylex-ttc-style-custom");
  
  if (!style){
    style = document.createElement("style");
    style.id = "chylex-ttc-style-custom";
  }
  
  style.innerHTML = `${rcolBlur} .chat-list__lines .simplebar-track.vertical {
visibility: hidden !important;
}
${isFirefox ? `
${rcol} .video-chat__message-list-wrapper:not(.video-chat__message-list-wrapper--unsynced) {
overflow-y: hidden !important;
}
` : ``}
${rcol} .video-watch-page__right-column${wa}, ${rcol} .channel-page__right-column${wa} {
background: none !important;
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
${settings.hideHeader ? `
${rcolBlur} .room-selector__header {
display: none !important;
}
` : ``}
${settings.hideChatInput ? `
${rcolBlur} .chat-input, ${rcolBlur} .video-chat__input {
display: none;
}
` : ``}
${settings.hidePinnedCheer ? `
.pinned-cheer {
display: none;
}
` : ``}
${rcol} .video-chat__sync-button {
width: ${settings.chatWidth - 50}px;
z-index: 10;
background-color: #b8b5c0 !important;
}
${settings.chatWidth < 350 ? `
${rcol} .video-chat__settings, ${rcol} .chat-settings {
width: ${settings.chatWidth - 50}px;
}
` : ``}
${settings.transparentChat ? `
.persistent-player--theatre {
width: 100% !important;
}
.persistent-player--theatre:not(${fullWidth}) .hover-display > div {
padding-right: ${settings.chatWidth - 10}px;
}
.persistent-player--theatre .player-streamstatus {
margin-right: ${settings.chatWidth + 10}px !important;
padding-right: 1.5em !important;
}
.persistent-player--theatre${fullWidth} .player-streamstatus {
margin-right: 20px !important;
}
${rcol} .tw-border-l.tw-c-background-alt-2${wa} {
border-left: none !important;
}
${rcolBlur} .video-chat__header {
background-color: rgba(23,20,31,0.3984375) !important;
box-shadow: none !important;
}
${rcolBlur} .video-chat__input {
background: transparent !important;
box-shadow: none !important;
}
${rcolBlur} .chylex-ttc-chat-container {
background: rgba(14, 12, 19, ${settings.backgroundOpacity * 0.01}) !important;
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
text-shadow: -1px 0 0 rgba(0,0,0,0.6640625), 0 -1px 0 rgba(0,0,0,0.6640625), 1px 0 0 rgba(0,0,0,0.6640625), 0 1px 0 rgba(0,0,0,0.6640625);
}
${rcolBlur} .chat-input, ${rcolBlur} .video-chat__input {
opacity: 0.6;
}
${rcolBlur} .chylex-ttc-chat-container {
${settings.smoothTextShadow ? `
text-shadow: 0 0 2px rgba(0,0,0,0.86328125), -1px 0 1px rgba(0,0,0,0.3984375), 0 -1px 1px rgba(0,0,0,0.3984375), 1px 0 1px rgba(0,0,0,0.3984375), 0 1px 1px rgba(0,0,0,0.3984375);
` : `
text-shadow: -1px 0 0 rgba(0,0,0,0.6640625), 0 -1px 0 rgba(0,0,0,0.6640625), 1px 0 0 rgba(0,0,0,0.6640625), 0 1px 0 rgba(0,0,0,0.6640625);
`}
}
${rcolBlur} .chat-author__display-name, ${rcolBlur} .vod-message__timestamp {
${settings.smoothTextShadow ? `
text-shadow: -1px 0 1px rgba(0,0,0,0.3984375), 0 -1px 1px rgba(0,0,0,0.3984375), 1px 0 1px rgba(0,0,0,0.3984375), 0 1px 1px rgba(0,0,0,0.3984375);
` : `
text-shadow: -1px 0 0 rgba(0,0,0,0.53125), 0 -1px 0 rgba(0,0,0,0.53125), 1px 0 0 rgba(0,0,0,0.53125), 0 1px 0 rgba(0,0,0,0.53125);
`}
}
${rcolBlur} .chat-line__message--mention-recipient {
text-shadow: none;
}
${rcolBlur} .vod-message__timestamp {
color: #b7b5ba !important;
}
${rcolBlur} .chat-line__message a {
color: #cdb9f5 !important;
}
.whispers--theatre-mode .whispers-threads-box__container:not(.whispers-threads-box__container--open):not(:hover) {
opacity: ${Math.max(0.1, settings.backgroundOpacity * 0.01)};
}
` : `
.persistent-player--theatre:not(${fullWidth}) {
width: calc(100% - ${settings.chatWidth - 10}px) !important;
}
.persistent-player--theatre .player-streamstatus {
margin-right: 20px !important;
}
`}
.whispers--theatre-mode.whispers--right-column-expanded {
right: ${settings.chatWidth - 10}px !important;
}
${settings.hideConversations ? `
.whispers--theatre-mode {
display: none;
}
.video-player--theatre .video-player__container {
bottom: 0 !important;
}
` : ``}
${settings.hideTimestamps ? `
${rcol} .vod-message__timestamp {
visibility: hidden;
width: 0 !important;
}
` : ``}
${settings.chatLeftSide && settings.transparentChat ? `
${rcol}${wa}, ${rcol} .chat-list__lines .simplebar-track.vertical {
left: 0 !important;
right: auto !important;
}
.persistent-player--theatre:not(${fullWidth}) .hover-display > div {
padding-left: ${settings.chatWidth - 10}px;
padding-right: 0;
}
.persistent-player--theatre:not(${fullWidth}) .player-streaminfo {
margin-left: 40px;
}
.persistent-player--theatre${fullWidth} .player-streaminfo {
margin-left: 25px;
}
.persistent-player--theatre .player-streamstatus${wa} {
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
transform: rotate(90deg) !important;
}
${rcol}.right-column--collapsed .right-column__toggle-visibility {
margin-left: 0;
transform: rotate(-90deg) !important;
}
` : ``}
${settings.grayTheme ? `
${rcol} .tw-border-l.tw-c-background-alt-2 {
border-left-color: #2b2b2b !important;
}
${rcol} .chylex-ttc-chat-container${wa} {
background: #0e0e0e !important;
}
${rcolBlur} .chylex-ttc-chat-container${wa} {
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
` : ``}
${rcolBlur} div[data-a-target="chat-badge"] {
opacity: ${settings.badgeOpacity / 100};
${settings.badgeOpacity === 0 ? `display: none !important;` : ``}
}
${settings.hideBadgeTurbo ? `
${rcol} .chat-badge[alt="Turbo"] {
display: none;
}
` : ``}
${settings.hideBadgePrime ? `
${rcol} .chat-badge[alt$="Prime"] {
display: none;
}
` : ``}
${settings.hideBadgeSubscriber ? `
${rcol} .chat-badge[alt~="Subscriber"] {
display: none;
}
` : ``}
#chylex-ttc-settings-btn {
margin-left: ${settings.chatWidth - 58}px;
}`;
  
  document.head.appendChild(style);
}

function generateSettingsCSS(){
  if (document.getElementById("chylex-ttc-style-settings")){
    return;
  }
  
  let style = document.createElement("style");
  style.id = "chylex-ttc-style-settings";
  style.innerHTML = `#chylex-ttc-settings-btn {
display: none;
width: 3em;
height: 3em;
position: absolute;
bottom: 130px;
margin-left: 292px;
z-index: 9;
cursor: pointer;
fill: rgba(255,255,255,0.6640625);
}
.video-chat #chylex-ttc-settings-btn {
bottom: 120px;
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
#chylex-ttc-settings-modal {
position: absolute;
left: 50%;
top: 50%;
width: 630px;
height: 292px;
margin-left: -315px;
margin-top: -146px;
z-index: 10000;
background-color: rgba(17,17,17,0.796875);
}
#chylex-ttc-settings-modal #ttc-opt-global-wrapper {
position: absolute;
margin: 5px 0 0 -69px;
display: inline-block;
}
#chylex-ttc-settings-modal h2 {
color: rgba(255,255,255,0.9296875);
font-size: 24px;
text-align: center;
margin: 0;
padding: 14px 0 13px;
background-color: rgba(0,0,0,0.59765625);
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
color: rgba(255,255,255,0.86328125);
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
color: rgba(255,255,255,0.6640625);
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
#chylex-ttc-settings-modal output {
color: rgba(255,255,255,0.796875);
width: 46px;
padding-left: 4px;
text-align: right;
}`;
  
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
      <input class="tw-toggle__input" id="ttc-opt-${option}" data-a-target="tw-toggle" value="${settings[option] ? "on" : "off"}" type="checkbox"${settings[option] ? " checked" : ""}>
      <label for="ttc-opt-${option}" class="tw-toggle__button"></label>
    </div>
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
<h2>
  <div id="ttc-opt-global-wrapper" class="tw-toggle">
    <input class="tw-toggle__input" id="ttc-opt-global" data-a-target="tw-toggle" value="${settings.globalSwitch ? "on" : "off"}" type="checkbox"${settings.globalSwitch ? " checked" : ""}>
    <label for="ttc-opt-global" class="tw-toggle__button"></label>
  </div>

  <span>Transparent Twitch Chat</span>
</h2>

<div class="ttc-flex-container">
  <div class="ttc-flex-column">
    <p>General</p>
    ${generateSlider("Chat Width", "chatWidth", { min: 250, max: 600, step: 25, wait: 500, text: "px" })}
    ${generateToggle("Gray Theme", "grayTheme")}
    ${generateToggle("Hide Timestamps", "hideTimestamps")}
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
  const container = document.querySelector("[data-test-selector='chat-room-component-layout'] > div,.video-chat");
  
  if (!container){
    return;
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
}

window.setInterval(function(){
  if (!document.getElementById("chylex-ttc-settings-btn")){
    insertSettingsButton();
  }
}, 2000);

document.body.addEventListener("click", function(){
  tryRemoveElement(document.getElementById("chylex-ttc-settings-modal"));
});

generateSettingsCSS();

if (settings.globalSwitch){
  generateCustomCSS();
}
