// ==UserScript==
// @name         Transparent Twitch Chat
// @description  Why decide between missing a PogChamp or sacrificing precious screen space, when you can have the best of both worlds!
// @version      {VERSION}
// @namespace    https://chylex.com
// @include      https://www.twitch.tv/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @noframes
// ==/UserScript==

let settings = {
  globalSwitch: true,
  
  chatWidth: 350,
  hideHeader: true,
  hideTimestamps: false,
  hideConversations: false,
  grayTheme: false,
  
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

function convHex(hex){
  if (hex.length === 8){
    return `rgba(${parseInt(hex.substr(0, 2), 16)}, ${parseInt(hex.substr(2, 2), 16)}, ${parseInt(hex.substr(4, 2), 16)}, ${parseInt(hex.substr(6, 2), 16) / 256})`;
  }
  else if (hex.length === 4){
    return `rgba(${parseInt(hex[0].repeat(2), 16)}, ${parseInt(hex[1].repeat(2), 16)}, ${parseInt(hex[2].repeat(2), 16)}, ${parseInt(hex[3].repeat(2), 16) / 256})`;
  }
}

function stripComments(str){
  return str.replace(/\/\/(.*?)$/gm, "");
}

function generateCustomCSS(){
  if (!settings.globalSwitch){
    tryRemoveElement(document.getElementById("chylex-ttc-style-custom"));
    return;
  }
  
  let multiselect = (str, selectors) => selectors.map(selector => str.replace("$", selector)).join(",");
  let $chatContainer = [ ".chat__container", ".video-chat" ];
  let $chatInterface = [ ".chat__pane > div:last-child", ".video-chat__input" ];
  
  let rcol = ".right-column--theatre";
  let rcolHover = ".right-column--theatre:hover";
  let rcolBlur = ".right-column--theatre:not(:hover)";
  
  let wa = ":not(.ttcwa)"; // selector priority workaround
  let style = document.getElementById("chylex-ttc-style-custom");
  
  if (!style){
    style = document.createElement("style");
    style.id = "chylex-ttc-style-custom";
  }
  
  style.innerHTML = stripComments(`

// fix scrollbars

${rcolBlur} .chat-list__lines .simplebar-track.vertical {
  visibility: hidden !important;
}

${rcolBlur} .video-chat__message-list-wrapper {
  overflow-y: hidden !important;
}

// general chat styles

${rcol} .video-watch-page__right-column${wa}, ${rcol} .channel-page__right-column${wa} {
  background: none !important;
  width: ${settings.chatWidth - 10}px;
}

${settings.hideHeader ? `
  ${rcol} .chat__header {
    display: none !important;
  }
` : ``}

${settings.chatWidth < 300 ? `
  ${rcol} .video-chat__sync-button, ${rcol} .video-chat__settings, ${rcol} .chat-settings {
    width: ${settings.chatWidth - 50}px;
  }
` : ``}

// BTTV workarounds

.theatre .ember-chat.roomMode${wa}, .theatre .chat-messages${wa}, .theatre .ember-chat${wa} {
  background: none !important;
}

.theatre .rightcol-content${wa} {
  background: none !important;
  z-index: 3 !important;
}

${settings.transparentChat ? `

  // expand player width, FrankerFaceZ workaround

.theatre .ct-bar--active.ct-bar--ember, .theatre #main_col {
  right: 0;
}

body${wa} .app-main.theatre${wa} #main_col, .theatre #flash {
  margin-right: 0 !important;
}

body${wa} .app-main.theatre${wa} #main_col${wa} #player${wa} {
  right: 0 !important;
}

  .channel-page__video-player--theatre-mode {
    width: 100% !important;
  }

  // fix player controls and status

  .channel-page__video-player--theatre-mode:not(.full-width) .player-hover {
    padding-right: ${settings.chatWidth - 10}px;
  }

  .channel-page__video-player--theatre-mode .player-streamstatus {
    margin-right: ${settings.chatWidth + 10}px !important;
    padding-right: 1.5em !important;
  }

  .channel-page__video-player--theatre-mode.full-width .player-streamstatus {
    margin-right: 20px !important;
  }

  // chat container transparency

  ${rcol} .chat__pane${wa}, ${rcol} .video-chat${wa} {
    border-left: none !important;
  }

  ${rcolBlur} .chat__pane${wa} {
    background: none !important;
  }


  ${rcolBlur} .video-chat__header {
    background-color: ${convHex("17141f66")} !important;
    box-shadow: none !important;
  }

  ${rcolBlur} .video-chat__input {
    background: transparent !important;
    box-shadow: none !important;
  }

  ${rcolBlur} .chat__container, ${rcolBlur} .video-chat {
    background: ${convHex("17141f"+(Math.round(settings.backgroundOpacity * 2.55).toString(16).padStart(2, '0')))} !important;
    color: #ece8f3 !important;
  }

  ${rcolBlur} .chat__pane > div:last-child, ${rcolBlur} .video-chat__input {
    opacity: 0.6;
  }

  // chat message shadow

  ${rcolBlur} .chat__container, ${rcolBlur} .video-chat {
    ${settings.smoothTextShadow ? `
    text-shadow: 0 0 2px ${convHex("000D")}, -1px 0 1px ${convHex("0006")}, 0 -1px 1px ${convHex("0006")}, 1px 0 1px ${convHex("0006")}, 0 1px 1px ${convHex("0006")};
    ` : `
    text-shadow: -1px 0 0 ${convHex("000A")}, 0 -1px 0 ${convHex("000A")}, 1px 0 0 ${convHex("000A")}, 0 1px 0 ${convHex("000A")};
    `}
  }

  ${rcolBlur} .chat-author__display-name, ${rcolBlur} .vod-message__timestamp {
    ${settings.smoothTextShadow ? `
    text-shadow: -1px 0 1px ${convHex("0006")}, 0 -1px 1px ${convHex("0006")}, 1px 0 1px ${convHex("0006")}, 0 1px 1px ${convHex("0006")};
    ` : `
    text-shadow: -1px 0 0 ${convHex("0008")}, 0 -1px 0 ${convHex("0008")}, 1px 0 0 ${convHex("0008")}, 0 1px 0 ${convHex("0008")};
    `}
  }

  // chat messages

  ${rcolBlur} .vod-message__timestamp {
    color: #b7b5ba !important;
  }







  // fix unwanted styles



  // conversation menu

  .whispers-threads-box__container:not(.whispers-threads-box__container--open):not(:hover) {
    opacity: ${settings.backgroundOpacity / 100};
  }
` : `

  // adapt player size with disabled transparency

  .channel-page__video-player--theatre-mode {
    width: calc(100% - ${settings.chatWidth - 10}px) !important;
  }
`}

// conversation menu and bottom margin

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

// hide timestamps

${settings.hideTimestamps ? `
  ${rcol} .vod-message__timestamp {
    visibility: hidden;
    width: 0 !important;
  }
` : ``}

// chat on left side

${settings.chatLeftSide && settings.transparentChat ? `
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





// gray theme

${settings.grayTheme ? `
${multiselect(".theatre #right_col $", $chatContainer)} {
  border-left-color: #333;
}

${multiselect(".theatre #right_col:not(:hover) $", $chatContainer)} {
  background: ${convHex("141414"+(Math.round(settings.transparentChat ? (settings.backgroundOpacity * 2.55) : 255).toString(16).padStart(2, '0')))} !important;
}

${multiselect(".theatre #right_col:hover $", $chatContainer)} {
  background: #141414 !important;
}

.theatre #right_col:not(:hover) .chat-header {
  background-color: ${convHex(settings.transparentChat ? "09090966" : "090909ff")} !important;
  box-shadow: inset 0 -1px 0 0 ${convHex(settings.transparentChat ? "3336" : "333f")} !important;
}

.theatre #right_col:hover .chat-header {
  background: #090909 !important;
  box-shadow: inset 0 -1px 0 0 #333 !important;
}

.theatre #right_col:not(:hover) .video-chat__header {
  box-shadow: inset 0 -1px 0 0 ${convHex(settings.transparentChat ? "3336" : "333f")} !important;
}

.theatre #right_col:hover .video-chat__header {
  box-shadow: inset 0 -1px 0 0 #333 !important;
}

${multiselect(".theatre $ textarea", $chatInterface)} {
  background-color: ${convHex(settings.transparentChat ? "2a2a2a90" : "2a2a2aff")} !important;
  border: 1px solid ${convHex(settings.transparentChat ? "00000090" : "000000ff")} !important;
  box-shadow: none !important;
}

${multiselect(".theatre #right_col:hover $ textarea", $chatInterface)} {
  background-color: #2a2a2a !important;
  border: 1px solid #000000 !important;
}

${multiselect(".theatre $ .button--icon-only figure svg", $chatContainer)} {
  fill: #dedede !important;
  opacity: 0.5;
}

${multiselect(".theatre #right_col:hover $ .button--icon-only figure svg", $chatContainer)} {
  fill: #dedede !important;
  opacity: 1;
}

.theatre .chat-container .button:not(.button--icon-only), .theatre .video-chat__input [data-a-target="video-chat-submit-button"] {
  background-color: ${convHex(settings.transparentChat ? "2a2a2a90" : "2a2a2aff")} !important;
  border: 1px solid ${convHex(settings.transparentChat ? "00000090" : "000000ff")} !important;
}` : ``}

// badge tweaks

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

// dynamic styles for settings, replaces default style

#chylex-ttc-settings-btn {
  margin-left: ${settings.chatWidth - 58}px;
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
  z-index: 20000;
  cursor: pointer;
  fill: ${convHex("fffa")};
  margin-left: 292px;
}

.chat__container #chylex-ttc-settings-btn {
  bottom: 130px;
}

.video-chat #chylex-ttc-settings-btn {
  margin-top: 6px;
}

#chylex-ttc-settings-btn:hover .player-tip {
  display: inline-block;
  width: auto;
  left: 50%;
  top: 0.5em;
  margin-left: -13.75em;
  z-index: 19999;
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
  width: 560px;
  height: 350px;
  margin-left: -280px;
  margin-top: -175px;
  z-index: 10000;
  background-color: ${convHex("111b")};
}

#chylex-ttc-settings-modal #ttc-opt-global-wrapper {
  position: absolute;
  margin: 5px 0 0 -69px;
  display: inline-block;
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
  padding: 0 12px;
}

#chylex-ttc-settings-modal p:first-of-type {
  margin: 0 0 4px;
}

#chylex-ttc-settings-modal .player-menu__section {
  padding: 0 12px;
}

#chylex-ttc-settings-modal .player-menu__header {
  margin-bottom: 0;
  color: ${convHex("fffa")};
}

#chylex-ttc-settings-modal .player-menu__item {
  align-items: center;
  margin: 1px 0 9px;
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
    ${generateToggle("Hide Chat Header", "hideHeader")}
    ${generateToggle("Hide Timestamps", "hideTimestamps")}
    ${generateToggle("Hide Conversations", "hideConversations")}
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
  let container = document.querySelector(".chat__container,.video-chat");
  
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

generateSettingsCSS();

if (settings.globalSwitch){
  generateCustomCSS();
}
