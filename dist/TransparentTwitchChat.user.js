// ==UserScript==
// @name         Transparent Twitch Chat
// @description  Why decide between missing a PogChamp or sacrificing precious screen space, when you can have the best of both worlds!
// @version      1.4.1
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
  
  style.innerHTML = `
${rcolBlur} .chat-list__lines .simplebar-track.vertical {visibility:hidden!important}

${isFirefox ? `
${rcol} .video-chat__message-list-wrapper:not(.video-chat__message-list-wrapper--unsynced) {overflow-y:hidden!important}
` : ``}

${rcolBlur} .channel-root__right-column${wa} {background:rgba(14, 12, 19, ${settings.backgroundOpacity * 0.01})!important}
${rcol}${wa}, ${rcol} .channel-root__right-column${wa} {width:${settings.chatWidth - 10}px!important}
${rcol} .video-chat {flex-basis:auto!important}
${rcol} .video-chat__header {display:none!important}
${rcol} .room-picker {width:${settings.chatWidth - 10}px}
${rcol} .hidden {display:none}
${rcol} .video-chat__sync-button {width:${settings.chatWidth - 50}px;z-index:10;background-color:#b8b5c0!important}

#root[data-a-page-loaded-name="VideoWatchPage"] ${rcolBlur}:not(.right-column--collapsed) .right-column__toggle-visibility {
display: none !important;
}
${settings.hideHeader ? `
${rcolBlur} .rooms-header, ${rcolBlur} .room-selector__header {display:none!important}
${rcolBlur}:not(.right-column--collapsed) .right-column__toggle-visibility {display:none!important}
` : ``}
${settings.hideChatInput ? `
${rcolBlur} .chat-input {display:none!important}
` : ``}
${settings.hidePinnedCheer ? `
.channel-leaderboard {display:none}
` : ``}
${settings.transparentChat ? `
body:not(${fullScreen}) .persistent-player--theatre {width:100%!important}
body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .top-bar,body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .player-controls {padding-right:${settings.chatWidth - 10}px}
body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .player-overlay-background > div {right:${settings.chatWidth - 10}px!important}
${rcol} .chat-room {background:transparent!important}
${rcolBlur} .chylex-ttc-chat-container {color:#ece8f3!important}
${rcolBlur} .rooms-header, ${rcolBlur} .leaderboard-header-tabbed-layout {background:transparent!important}
${rcolBlur} .chat-input {opacity:0.6}
${rcolBlur} .chylex-ttc-chat-container {${settings.smoothTextShadow ? `text-shadow:0 0 2px rgba(0,0,0,0.86328125), -1px 0 1px rgba(0,0,0,0.3984375), 0 -1px 1px rgba(0,0,0,0.3984375), 1px 0 1px rgba(0,0,0,0.3984375), 0 1px 1px rgba(0,0,0,0.3984375);` : `text-shadow:-1px 0 0 rgba(0,0,0,0.6640625), 0 -1px 0 rgba(0,0,0,0.6640625), 1px 0 0 rgba(0,0,0,0.6640625), 0 1px 0 rgba(0,0,0,0.6640625);`}}${rcolBlur} .chat-author__display-name, ${rcolBlur} .vod-message__timestamp {${settings.smoothTextShadow ? `text-shadow:-1px 0 1px rgba(0,0,0,0.3984375), 0 -1px 1px rgba(0,0,0,0.3984375), 1px 0 1px rgba(0,0,0,0.3984375), 0 1px 1px rgba(0,0,0,0.3984375);` : `text-shadow:-1px 0 0 rgba(0,0,0,0.53125), 0 -1px 0 rgba(0,0,0,0.53125), 1px 0 0 rgba(0,0,0,0.53125), 0 1px 0 rgba(0,0,0,0.53125);`}}${rcolBlur} .chat-line__message--mention-recipient {text-shadow:none}
${rcolBlur} .chat-line__message a {color:#cdb9f5!important}
.whispers--theatre-mode .whispers-threads-box__container:not(.whispers-threads-box__container--open):not(:hover) {opacity:${Math.max(0.1, settings.backgroundOpacity * 0.01)}}
` : `
body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre {width:calc(100% - ${settings.chatWidth - 10}px)!important}
body:not(${fullScreen}) .persistent-player--theatre .player-streamstatus {margin-right:20px!important}
`}
.whispers--theatre-mode.whispers--right-column-expanded-beside {
right: ${settings.chatWidth - 10}px !important;
}
${settings.hideConversations ? `
.whispers--theatre-mode${wa} {display:none!important}
.video-player__container--theatre-whispers, .highwind-video-player__container--theatre-whispers {bottom:1px!important; // allows hiding player controls in fullscreen by moving cursor all the way down}` : ``}
${settings.chatLeftSide && settings.transparentChat ? `
${rcol}${wa}, ${rcol} .chat-list__lines .simplebar-track.vertical {left:0!important;right:auto!important}
${rcol} .channel-root__right-column${wa} {border-left:none!important;border-right:var(--border-width-default) solid var(--color-border-base)!important}
body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .top-bar {padding-left:${settings.chatWidth}px;padding-right:0}
body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .player-controls {padding-left:${settings.chatWidth - 10}px;padding-right:0}
body:not(${fullWidth}):not(${fullScreen}) .persistent-player--theatre .player-overlay-background > div {left:${settings.chatWidth - 10}px!important;right:0!important}
.whispers--theatre-mode.whispers--right-column-expanded-beside {right:0px!important}
${rcol} .right-column__toggle-visibility {transform:rotate(180deg)!important}
${rcol}.right-column--collapsed .right-column__toggle-visibility {left:0.5rem}
` : ``}
${settings.grayTheme ? `
${rcol} [data-a-target="chat-input"] {background-color:#0e0e0e!important;border-color:#2b2b2b!important}
${rcol} [data-a-target="chat-input"]:focus {border-color:#787878!important;box-shadow:0 0 6px -2px #787878!important}
${rcol} [data-a-target="chat-send-button"] {background-color:#2b2b2b!important;border:1px solid #000000!important}
${rcol} [data-a-target="chat-send-button"]:active, ${rcol} [data-a-target="chat-send-button"]:focus {box-shadow:0 0 6px 0 #787878!important}
` : ``}

${rcolBlur} a[data-a-target="chat-badge"] {opacity:${settings.badgeOpacity / 100};${settings.badgeOpacity === 0 ? `display:none!important;` : ``}}
${settings.hideBadgeTurbo ? `
${rcol} .chat-badge[alt="Turbo"] {display:none}
` : ``}
${settings.hideBadgePrime ? `
${rcol} .chat-badge[alt$="Prime"] {display:none}
` : ``}
${settings.hideBadgeSubscriber ? `
${rcol} .chat-badge[alt~="Subscriber"] {display:none}
` : ``}

#chylex-ttc-settings-btn {margin-left:${settings.chatWidth - 60}px}
`;
  
  document.head.appendChild(style);
}

function generateSettingsCSS(){
  if (document.getElementById("chylex-ttc-style-settings")){
    return;
  }
  
  const style = document.createElement("style");
  style.id = "chylex-ttc-style-settings";
  style.innerHTML = `
#chylex-ttc-settings-btn {display:none;width:2.5em;height:2.5em;position:absolute;bottom:105px;margin-left:290px;z-index:9;cursor:pointer;fill:rgba(255,255,255,0.6640625)}
.video-chat #chylex-ttc-settings-btn {bottom:18px}
#chylex-ttc-settings-btn svg {width:100%;height:100%}
#chylex-ttc-settings-btn:hover {fill:#fff}
.right-column--theatre:hover #chylex-ttc-settings-btn {display:block}
#chylex-ttc-settings-modal {position:absolute;left:50%;top:50%;width:860px;height:292px;margin-left:-430px;margin-top:-146px;z-index:10000;background-color:rgba(17,17,17,0.796875)}
#chylex-ttc-settings-modal #ttc-opt-global-wrapper {position:absolute;margin:5px 0 0 -69px;display:inline-block}
#chylex-ttc-settings-modal h2 {color:rgba(255,255,255,0.9296875);font-size:24px;text-align:center;margin:0;padding:14px 0 13px;background-color:rgba(0,0,0,0.59765625)}
#chylex-ttc-settings-modal .ttc-flex-container {display:flex;flex-direction:row;justify-content:space-between;padding:8px 4px}
#chylex-ttc-settings-modal .ttc-flex-column {flex:0 0 calc(100% / 4)}
#chylex-ttc-settings-modal p {color:rgba(255,255,255,0.86328125);font-size:14px;margin-top:8px;padding:0 9px}
#chylex-ttc-settings-modal p:first-of-type {margin:0 0 4px}
#chylex-ttc-settings-modal .player-menu__section {padding:0 12px 2px}
#chylex-ttc-settings-modal .player-menu__header {margin-bottom:0;color:rgba(255,255,255,0.6640625)}
#chylex-ttc-settings-modal .player-menu__item {align-items:center;margin:2px 0 9px;padding-left:1px}
#chylex-ttc-settings-modal .switch {font-size:10px;height:17px;line-height:17px}
#chylex-ttc-settings-modal .switch span {width:27px}
#chylex-ttc-settings-modal .switch.active span {left:25px}
#chylex-ttc-settings-modal .switch::before, #chylex-ttc-settings-modal .switch::after {width:26px;box-sizing:border-box}
#chylex-ttc-settings-modal .switch::before {text-align:left;padding-left:5px}
#chylex-ttc-settings-modal .switch::after {text-align:right;padding-right:3px}
#chylex-ttc-settings-modal input[type="text"] {width:100%;padding:2px}
#chylex-ttc-settings-modal input[type="range"] {width:142px}
#chylex-ttc-settings-modal .tw-toggle__button {width:4rem}
#chylex-ttc-settings-modal .tw-toggle__button, #chylex-ttc-settings-modal .tw-toggle__button::after {border-radius:0}
#chylex-ttc-settings-modal output {color:rgba(255,255,255,0.796875);width:46px;padding-left:4px;text-align:right;vertical-align:40%}
`;
  
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
