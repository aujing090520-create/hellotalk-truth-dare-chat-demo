import './styles.css';
import './voice-message.css';
import { runtimePromptBank } from './question-store.js';

const app = document.querySelector('#app');

const players = {
  me: { name: '林凡', avatar: '林' },
  them: { name: 'L10', avatar: '/assets/avatar-l10.png' },
};

const prompts = runtimePromptBank();
const VOICE_MAX_SECONDS = 60;

const emojiChoices = ['😁', '😊', '😃', '😌', '😉', '😍', '😘', '😙', '😳', '🥳', '😄', '😜', '😇', '😒', '😏', '😰', '😔', '😞', '🥹', '😥', '😨', '😂', '😮', '😱', '😠', '😡', '😤', '😪', '😎', '🤗', '😈', '👽', '❤', '💔', '💕', '💞', '💓', '✨', '💫', '🎵', '🧡', '💛', '💚', '💙', '💜', '🩷', '🖤', '🤍', '🤎', '❣️', '💗', '💖', '💘', '💝', '💟', '🥰', '😚', '🫶', '🤝', '🙌', '👏', '🎉', '🌹', '🌷', '🌻', '🍀', '☀️', '🌙', '⭐️', '🫧', '🎈', '👍', '👎', '🙏', '💪', '👋', '🤚', '✋', '🖐', '👌', '🤌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '☝️', '👆', '👇', '✍️', '💅', '🫰', '🤳', '🙆', '🙋', '🙇', '🤦', '🤷', '💁', '🧏', '🫡', '🫵', '👐', '🫱', '🫲', '☕️', '🎬', '📚', '🎮', '⚽️', '🏀', '🎨', '📷', '✈️', '🚗', '🚲', '🌍', '🏝', '🏔', '🏙', '🍜', '🍕', '🍰', '🍉', '🐱', '🐶', '🐼', '🦊', '🌿', '🌸', '🌈', '🔥', '💧', '❄️', '🌞', '🎁', '🎀', '🧩', '🪄', '🎯', '💤'];

const toolItems = [
  ['tool-voice.png', '语音通话'], ['tool-bookmark.png', '收藏'], [null, '付费陪练', 'coach'], ['tool-calendar.png', '学习计划'],
  ['tool-draw.png', '涂鸦'], ['tool-intro.png', '介绍好友'], ['tool-location.png', '位置'], ['tool-teach.png', '上课'], ['tool-game.png', '小游戏'],
];

const state = {
  game: 'idle',
  active: null,
  type: null,
  usedPromptIds: { truth: [], dare: [] },
  turn: 0,
  completedRounds: 0,
  currentChallenge: null,
  voice: null,
  answerDrafts: { me: '', them: '' },
  emojiSelections: { me: [], them: [] },
  drafts: { me: '', them: '' },
  toolsOwner: 'me',
  sheet: null,
  review: false,
  selectedRule: null,
  messages: [
    { kind: 'text', sender: 'them', text: 'Hi! I just finished my work. How was your day?' },
    { kind: 'text', sender: 'me', text: 'Pretty good! I was thinking about the weekend.' },
  ],
};

const other = (role) => role === 'me' ? 'them' : 'me';
const name = (role) => players[role].name;
const typeName = (type) => type === 'truth' ? '真心话' : '大冒险';
const promptKind = (type) => type === 'truth' ? '真心话问题' : '大冒险挑战';
const currentPromptItem = () => state.currentChallenge;
const currentPrompt = () => currentPromptItem()?.text || '';
const currentTurnActionLabel = () => {
  if (!state.currentChallenge) return '选择';
  return state.currentChallenge.type === 'truth' ? '回答' : '完成';
};
const ruleMap = { 'FR-001/1': 'target-entry', 'FR-002/2': 'target-invite', 'FR-003/1': 'target-session', 'FR-003/2': 'target-choice', 'FR-003/4': 'target-actions' };
let voiceTicker = null;

function avatar(role, size = '') {
  const person = players[role];
  return person.avatar.startsWith('/')
    ? `<img class="avatar ${size}" src="${person.avatar}" alt="${person.name}头像" />`
    : `<span class="avatar letter ${size}">${person.avatar}</span>`;
}

function icon(name) {
  const paths = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    phone: '<path d="M6.6 2.8l3.2 2.1-1.7 3.1c1.2 2.5 3.2 4.5 5.7 5.7l3.1-1.7 2.1 3.2c.3.4.2 1-.2 1.3l-1.5 1.1c-.7.5-1.5.6-2.3.3C8.9 15.8 4.2 11.1 2.2 5c-.3-.8-.2-1.7.3-2.3l1.1-1.5c.3-.4.9-.5 1.3-.2l1.7 1.8z"/>',
    dots: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    close: '<path d="M5 5l14 14M19 5L5 19"/>',
    flag: '<path d="M6 21V4m0 1h10l-1.7 3L16 11H6"/>',
    coach: '<circle cx="9" cy="7" r="3.5"/><path d="M3.5 19c.4-3.4 2.3-5.2 5.5-5.2s5.1 1.8 5.5 5.2"/><circle cx="17.5" cy="16.5" r="4"/><path d="M17.5 14.2v4.6m-1.6-3h2.8"/>',
    signal: '<path d="M3 18h3v3H3zm5-5h3v8H8zm5-5h3v13h-3zm5-5h3v18h-3z"/>',
    wifi: '<path d="M3 9.2a13 13 0 0 1 18 0M6.5 12.8a8 8 0 0 1 11 0M10 16.2a3 3 0 0 1 4 0M12 20h.01"/>',
    battery: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4"/><path d="M11 8.5 8.8 13h2.5l-1.1 2.5 3-4.5h-2.4L13 8.5z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/>',
    send: '<path d="M21 3 10.5 13.5M21 3l-6.7 18-3.8-7.5L3 9.7z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4m-3 0h6"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function voiceDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function stopVoiceTicker() {
  if (!voiceTicker) return;
  clearInterval(voiceTicker);
  voiceTicker = null;
}

function startVoiceTicker() {
  stopVoiceTicker();
  voiceTicker = setInterval(() => {
    if (state.voice?.status !== 'recording') return stopVoiceTicker();
    state.voice.duration = Math.min(state.voice.duration + 1, VOICE_MAX_SECONDS);
    const timer = document.querySelector('.voice-bar em');
    if (timer) timer.textContent = voiceDuration(state.voice.duration);
    if (state.voice.duration >= VOICE_MAX_SECONDS) {
      state.voice.status = 'paused';
      stopVoiceTicker();
      updatePromptAnswerArea();
    }
  }, 1000);
}

function clearVoice() {
  stopVoiceTicker();
  state.voice = null;
}

function voiceRecorder() {
  const voice = state.voice;
  const recording = voice.status === 'recording';
  const waves = [8, 14, 19, 12, 22, 16, 25, 12, 18, 28, 15, 23, 10, 20, 26, 14, 18, 11, 21, 15, 9].map((height) => `<i style="--wave-height:${height}px"></i>`).join('');
  return `<div class="voice-recorder ${recording ? 'recording' : 'paused'}"><button class="voice-side" data-action="${recording ? 'cancel-voice' : 'discard-voice'}" aria-label="${recording ? '取消录音' : '删除录音'}">${icon(recording ? 'close' : 'trash')}</button><div class="voice-bar"><button class="voice-control" data-action="${recording ? 'pause-voice' : 'resume-voice'}" aria-label="${recording ? '暂停录音' : '继续录音'}">${icon(recording ? 'pause' : 'play')}</button><span class="voice-wave">${waves}</span><em>${voiceDuration(voice.duration)}</em></div><button class="voice-send" data-action="send-voice" aria-label="发送语音">${icon('send')}</button></div>`;
}

function answerComposer(role) {
  if (state.voice) return voiceRecorder();
  const responseType = state.currentChallenge?.responseType;
  if (responseType === 'emoji_3') return emojiComposer(role);
  if (responseType === 'voice') return `<button class="voice-task-start" data-action="start-voice" data-owner="${role}">${icon('mic')}<span>录制短语音</span></button>`;
  const placeholder = state.type === 'truth' ? '回答这个问题…' : '完成挑战后输入回答…';
  return `<div class="answer-box"><input data-answer-owner="${role}" value="${state.answerDrafts[role]}" placeholder="${placeholder}" /></div>`;
}

function emojiComposer(role) {
  const selected = state.emojiSelections[role];
  return `<div class="emoji-composer"><div class="emoji-status"><span>${selected.length ? selected.join(' ') : '从下面选择 3 个表情'}</span><small>${selected.length}/3</small></div><div class="emoji-grid">${emojiChoices.map((emoji, index) => `<button class="emoji-option ${selected.includes(emoji) ? 'selected' : ''}" data-action="select-emoji" data-owner="${role}" data-emoji="${emoji}" data-emoji-key="${index}" aria-label="选择 ${emoji}">${emoji}</button>`).join('')}</div></div>`;
}

function promptAnswerArea(role) {
  const recording = state.voice?.status === 'recording' || state.voice?.status === 'paused';
  const responseType = state.currentChallenge?.responseType;
  const ready = responseType === 'emoji_3' ? state.emojiSelections[role].length === 3 : state.answerDrafts[role].trim();
  const actions = recording ? '' : responseType === 'voice'
    ? `<div class="prompt-actions" id="target-actions"><button data-action="decline-prompt">不想回答</button></div>`
    : `<div class="prompt-actions" id="target-actions"><button data-action="decline-prompt">不想回答</button><button class="purple" data-action="submit" data-owner="${role}" ${ready ? '' : 'disabled'}>完成</button></div>`;
  return `<div id="answer-area">${answerComposer(role)}${actions}</div>`;
}

function updatePromptAnswerArea() {
  const role = state.sheet?.owner;
  const area = document.getElementById('answer-area');
  if (!role || !area) return;
  area.outerHTML = promptAnswerArea(role);
}

function textMessage(message, role) {
  const own = message.sender === role;
  const gameLabel = message.gameRound ? `<span class="game-answer-label"><b>${typeName(message.gameType)} · 第 ${message.gameRound} 回合</b><em>${message.gamePrompt}</em></span>` : '';
  return `<div class="message-row ${own ? 'own' : 'peer'}">${own ? '' : avatar(message.sender, 'small')}<div class="message-stack">${gameLabel}<div class="bubble">${message.text}</div></div></div>`;
}

function voiceMessage(message, role) {
  const own = message.sender === role;
  const gameLabel = message.gameRound ? `<span class="game-answer-label"><b>${typeName(message.gameType)} · 第 ${message.gameRound} 回合</b><em>${message.gamePrompt}</em></span>` : '';
  return `<div class="message-row ${own ? 'own' : 'peer'}">${own ? '' : avatar(message.sender, 'small')}<div class="message-stack">${gameLabel}<div class="voice-message" aria-label="语音 ${voiceDuration(message.duration)}"><span class="voice-play">${icon('play')}</span><span class="voice-time">${voiceDuration(message.duration)}</span></div></div></div>`;
}

function gameMessage(message, role) {
  if (message.kind === 'invite') {
    const waiting = state.game === 'invited';
    const isRecipient = role === 'them';
    return `<div class="game-wrap" id="target-invite"><div class="invite-card"><div class="card-top"><span class="game-logo">真</span><div><strong>真心话大冒险</strong><p>${name('me')} 邀请 ${name('them')} 一起玩</p></div></div><div class="card-line">轮流选择 · 系统随机出题</div>${waiting ? (isRecipient ? `<div class="card-actions"><button class="ghost" data-action="decline">暂不玩</button><button class="purple" data-action="accept">开始游戏</button></div>` : `<span class="waiting">等待 ${name('them')} 接受…</span>`) : `<span class="waiting">${message.status}</span>`}</div></div>`;
  }
  if (message.kind === 'session') {
    return `<div class="game-wrap" id="target-session"><div class="session-card"><div class="card-top"><span class="game-logo">真</span><div><strong>真心话大冒险</strong><p>已开始</p></div></div><div class="session-line"><b>轮流选择</b><span>系统随机抽题</span></div></div></div>`;
  }
  if (message.kind === 'system') {
    return `<div class="system-message">${message.text}</div>`;
  }
  if (message.kind === 'turn') {
    const activeHere = state.game === 'playing' && state.active === role && !state.type;
    const first = message.turn === 1;
    return `<div class="game-wrap" id="target-turn"><div class="turn-card"><span>${first ? '游戏开始' : '交换回合'}</span><strong>${first ? `${name(message.player)}发起本局，${name(message.player)}先来` : `轮到 ${name(message.player)} 了`}</strong><p>${name(message.player)} 选真心话或大冒险，系统随机抽题</p>${activeHere ? `<button class="purple" data-action="open-choice" data-owner="${role}">选择</button>` : `<small>等待 ${name(message.player)} 选择…</small>`}</div></div>`;
  }
  if (message.kind === 'result') {
    return `<div class="game-wrap"><div class="result-card"><span>${name(message.player)}选择了${typeName(message.type)}</span><p>${message.prompt}</p><div>${name(message.player)}：${message.answer}</div></div></div>`;
  }
  if (message.kind === 'challenge') {
    const pending = message.status === 'pending';
    const actorHere = pending && role === message.player && state.game === 'playing';
    const declined = message.status === 'declined';
    const actionWord = message.type === 'truth' ? '回答' : '完成';
    return `<div class="game-wrap"><div class="challenge-card"><span>${name(message.player)}抽到了${typeName(message.type)}</span><p>${message.prompt}</p>${pending ? (actorHere ? `<div class="challenge-actions"><small>由 ${name(message.player)} ${actionWord}，完成后交给 ${name(other(message.player))}</small><button class="ghost" data-action="open-prompt" data-owner="${role}">${actionWord}</button></div>` : `<small>等待 ${name(message.player)} ${actionWord}…</small>`) : `<div class="challenge-answer">${declined ? `${name(message.player)}选择不回答此题，回合交给 ${name(other(message.player))}` : `${name(message.player)}：${message.answer}`}</div>`}</div></div>`;
  }
  if (message.kind === 'ended') {
    return `<div class="game-wrap"><div class="end-card"><strong>本局已结束</strong><span>继续聊聊刚才的答案吧</span><button class="ghost" data-action="restart">再玩一次</button></div></div>`;
  }
  return '';
}

function conversation(role) {
  return state.messages.map((message) => message.kind === 'text' ? textMessage(message, role) : message.kind === 'voice' ? voiceMessage(message, role) : gameMessage(message, role)).join('');
}

function gameDock(role) {
  if (state.game !== 'playing') return '';
  const challenge = state.currentChallenge;
  const activeHere = state.active === role;
  const action = challenge ? 'open-prompt' : 'open-choice';
  const label = challenge
    ? `第 ${state.turn} 回合 · ${name(challenge.player)}${challenge.type === 'truth' ? '正在回答真心话' : '正在完成大冒险'}`
    : `第 ${state.turn} 回合 · 轮到 ${name(state.active)}`;
  const control = activeHere
    ? `<button data-action="${action}" data-owner="${role}">${currentTurnActionLabel()}</button>`
    : `<span>进行中</span>`;
  return `<div class="game-dock"><span class="dock-mark">真</span><p><b>真心话大冒险</b><small>${label}</small></p>${control}</div>`;
}

function toolsGrid(role) {
  if (state.toolsOwner !== role) return '';
  return `<div class="tool-grid">${toolItems.map(([asset, label, fallback]) => `<button class="tool" ${label === '小游戏' ? `data-action="open-mini" data-owner="${role}" id="target-entry"` : ''}>${asset ? `<img src="/assets/${asset}" alt=""/>` : `<span class="tool-fallback ${fallback}">${icon(fallback)}</span>`}<span>${label}</span></button>`).join('')}</div>`;
}

function composer(role) {
  const toolsOpen = state.toolsOwner === role;
  const source = ['composer-photo.png', 'composer-emoji.png', 'composer-gift.png', 'composer-translate.png', 'composer-phrases.png'];
  const toolsButton = toolsOpen
    ? `<button class="asset-button tools-toggle is-open" data-action="toggle-tools" data-owner="${role}" aria-label="收起工具"><span class="toolbar-close">${icon('close')}</span></button>`
    : `<button class="asset-button tools-toggle" data-action="toggle-tools" data-owner="${role}" aria-label="打开工具"><img src="/assets/composer-plus.png" alt=""/></button>`;
  const draft = state.drafts[role];
  return `<section class="composer"><div class="input-line"><input class="chat-input" data-chat-owner="${role}" value="${draft}" placeholder="输入消息…" />${draft ? `<button class="send-chat" data-action="send-chat" data-owner="${role}">发送</button>` : `<img class="mic" src="/assets/composer-mic.png" alt="语音"/>`}</div><div class="toolbar">${toolsButton}${source.map((asset) => `<button class="asset-button"><img src="/assets/${asset}" alt=""/></button>`).join('')}</div>${toolsGrid(role)}</section>`;
}

function sheet(role) {
  if (!state.sheet || state.sheet.owner !== role) return '';
  if (state.sheet.type === 'mini') {
    return `<div class="scrim" data-action="close-sheet"></div><section class="sheet mini-sheet"><button class="sheet-close" data-action="close-sheet">${icon('close')}</button><h2>小游戏</h2><div class="mini-list"><button><span class="mini-mark question">?</span><span>36问</span></button><button><span class="mini-mark hands">✌︎</span><span>猜拳</span></button><button><span class="mini-mark dice">⚄</span><span>掷骰子</span></button><button class="truth-game" data-action="open-intro" data-owner="${role}"><span class="mini-mark truth">真</span><span>真心话大冒险</span></button></div></section>`;
  }
  if (state.sheet.type === 'intro') {
    return `<div class="scrim" data-action="close-sheet"></div><section class="sheet intro-sheet"><button class="sheet-close" data-action="close-sheet">${icon('close')}</button><div class="intro-stack"><b>真</b><i>冒</i></div><h2>真心话大冒险</h2><p>每回合由当前玩家选择真心话或大冒险，系统随机抽题。</p><div class="intro-tags"><span>轮流进行</span><span>仅双方可见</span><span>随时结束</span></div><button class="wide-purple" data-action="send-invite">邀请 ${name('them')} 一起玩</button></section>`;
  }
  if (state.sheet.type === 'choice') {
    return `<div class="scrim"></div><section class="sheet choice-sheet"><button class="sheet-close" data-action="close-game-sheet">${icon('close')}</button><span class="sheet-kicker">${name(role)}的回合</span><h2>选真心话，还是大冒险？</h2><p>你只选类型，系统会随机抽一题</p><div class="choice-grid" id="target-choice"><button class="truth-choice" data-action="pick-truth" data-owner="${role}"><b>真</b><span><strong>真心话</strong><small>说说真实的你</small></span></button><button class="dare-choice" data-action="pick-dare" data-owner="${role}"><b>冒</b><span><strong>大冒险</strong><small>完成一个小挑战</small></span></button></div><button class="end-game choice-end" data-action="end-game">结束本局</button></section>`;
  }
  if (state.sheet.type === 'prompt') {
    const prompt = currentPrompt();
    return `<div class="scrim"></div><section class="sheet prompt-sheet"><button class="sheet-close" data-action="close-game-sheet">${icon('close')}</button><span class="sheet-kicker">轮到 ${name(role)} ${state.type === 'truth' ? '回答真心话' : '完成大冒险'}</span><h2>${prompt}</h2><p>由 ${name(role)} ${state.type === 'truth' ? '回答' : '完成'}，完成后自动交换给 ${name(other(role))}</p>${promptAnswerArea(role)}<button class="end-game" data-action="end-game">结束本局</button></section>`;
  }
  return '';
}

function phone(role) {
  const counterpart = other(role);
  return `<article class="phone" aria-label="${name(role)}的聊天视角"><div class="statusbar"><b>14:28</b><span class="status-icons">${icon('signal')}${icon('wifi')}${icon('battery')}</span></div><header class="thread-header"><button>${icon('back')}</button><div class="thread-identity"><div><strong>${name(counterpart)}</strong><span class="vip-badge">VIP+</span><span class="profile-badge">✦</span></div><small>14:28</small></div><span class="header-space"></span><button>${icon('phone')}</button><button>${icon('dots')}</button></header><section class="messages"><div class="time">今天 15:56</div>${conversation(role)}</section>${gameDock(role)}${composer(role)}${sheet(role)}</article>`;
}

function review() {
  if (!state.review) return '';
  const rules = Object.keys(ruleMap).map((rule) => `<button class="rule ${state.selectedRule === rule ? 'selected' : ''}" data-rule="${rule}">${rule}<small>${({ 'FR-001/1': '游戏入口', 'FR-002/2': '邀请同步', 'FR-003/1': '回合交替', 'FR-003/2': '选择题型', 'FR-003/4': '不想回答' })[rule]}</small></button>`).join('');
  return `<aside class="review-panel"><strong>PRD 追溯</strong>${rules}</aside>`;
}

function render() {
  app.innerHTML = `<main class="demo"><header class="demo-header"><div><b>真心话大冒险</b><span>双角色同步预览</span></div><p>林凡视角与 L10 视角共享同一局状态</p><label><input type="checkbox" data-action="toggle-review" ${state.review ? 'checked' : ''}/> Review traceability</label><button class="reset" data-action="reset">重置</button></header><section class="role-labels"><span>发起人 · 林凡</span><i>双方状态实时同步</i><span>受邀人 · L10</span></section><section class="phones">${phone('me')}${phone('them')}</section>${review()}</main>`;
  document.querySelectorAll('.messages').forEach((list) => { list.scrollTop = list.scrollHeight; });
  if (state.review) {
    Object.entries(ruleMap).forEach(([rule, id]) => {
      const target = document.getElementById(id);
      if (target) target.insertAdjacentHTML('beforeend', `<button class="review-dot" data-rule="${rule}">${rule.split('/')[0].replace('FR-', '')}</button>`);
    });
    if (state.selectedRule) document.getElementById(ruleMap[state.selectedRule])?.classList.add('review-focus');
  }
}

function startGame() {
  state.game = 'playing';
  state.active = 'me';
  state.turn = 1;
  state.type = null;
  state.completedRounds = 0;
  state.currentChallenge = null;
  state.usedPromptIds = { truth: [], dare: [] };
  state.messages = state.messages.map((message) => message.kind === 'invite' ? { kind: 'session' } : message);
}

function complete(answer, declined = false) {
  const challenge = state.currentChallenge;
  if (!challenge) return;
  if (declined) {
    state.messages.push({ kind: 'text', sender: challenge.player, text: `选择跳过本回合${typeName(challenge.type)}`, gameRound: state.turn, gameType: challenge.type, gamePrompt: challenge.text });
  } else if (challenge.responseType === 'voice') {
    state.messages.push({ kind: 'voice', sender: challenge.player, duration: state.voice?.duration || 0, gameRound: state.turn, gameType: challenge.type, gamePrompt: challenge.text });
  } else {
    state.messages.push({ kind: 'text', sender: challenge.player, text: answer, gameRound: state.turn, gameType: challenge.type, gamePrompt: challenge.text });
  }
  state.answerDrafts[challenge.player] = '';
  state.emojiSelections[challenge.player] = [];
  state.completedRounds += 1;
  state.active = other(state.active);
  state.turn += 1;
  state.type = null;
  state.currentChallenge = null;
  clearVoice();
  state.sheet = null;
}

function reset() {
  clearVoice();
  Object.assign(state, { game: 'idle', active: null, type: null, usedPromptIds: { truth: [], dare: [] }, turn: 0, completedRounds: 0, currentChallenge: null, drafts: { me: '', them: '' }, answerDrafts: { me: '', them: '' }, emojiSelections: { me: [], them: [] }, toolsOwner: 'me', sheet: null, selectedRule: null, messages: [{ kind: 'text', sender: 'them', text: 'Hi! I just finished my work. How was your day?' }, { kind: 'text', sender: 'me', text: 'Pretty good! I was thinking about the weekend.' }] });
}

function drawPrompt(type) {
  const used = new Set(state.usedPromptIds[type]);
  let candidates = prompts[type].filter((item) => !used.has(item.id));
  if (!candidates.length) {
    state.usedPromptIds[type] = [];
    candidates = prompts[type];
  }
  const prompt = candidates[Math.floor(Math.random() * candidates.length)];
  state.usedPromptIds[type].push(prompt.id);
  return prompt;
}

app.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const owner = event.target.closest('[data-owner]')?.dataset.owner;
  const rule = event.target.closest('[data-rule]')?.dataset.rule;
  if (rule && !action) { state.selectedRule = rule; render(); return; }
  if (!action) return;
  if (action === 'toggle-tools') state.toolsOwner = state.toolsOwner === owner ? null : owner;
  if (action === 'open-mini') { state.toolsOwner = null; state.sheet = { type: 'mini', owner }; }
  if (action === 'open-intro') state.sheet = { type: 'intro', owner };
  if (action === 'close-sheet') state.sheet = null;
  if (action === 'send-invite') { state.sheet = null; state.game = 'invited'; state.messages.push({ kind: 'invite', status: '等待接受' }); }
  if (action === 'accept') startGame();
  if (action === 'decline') { state.game = 'declined'; state.messages = state.messages.map((message) => message.kind === 'invite' ? { ...message, status: '暂不开始' } : message); }
  if (action === 'open-choice') state.sheet = { type: 'choice', owner };
  if (action === 'close-game-sheet') { if (state.sheet?.type === 'prompt') clearVoice(); state.sheet = null; }
  if (action === 'open-prompt') state.sheet = { type: 'prompt', owner };
  if (action === 'pick-truth' || action === 'pick-dare') { state.type = action === 'pick-truth' ? 'truth' : 'dare'; const prompt = drawPrompt(state.type); state.currentChallenge = { player: state.active, type: state.type, ...prompt }; state.sheet = { type: 'prompt', owner }; }
  if (action === 'select-emoji') { const emoji = event.target.closest('[data-emoji]')?.dataset.emoji; const selected = state.emojiSelections[owner]; const index = selected.indexOf(emoji); if (index >= 0) selected.splice(index, 1); else if (selected.length < 3) selected.push(emoji); updatePromptAnswerArea(); return; }
  if (action === 'start-voice') { state.voice = { status: 'recording', duration: 0, owner }; startVoiceTicker(); updatePromptAnswerArea(); return; }
  if (action === 'pause-voice') { state.voice.status = 'paused'; stopVoiceTicker(); updatePromptAnswerArea(); return; }
  if (action === 'resume-voice') { state.voice.status = 'recording'; startVoiceTicker(); updatePromptAnswerArea(); return; }
  if (action === 'cancel-voice' || action === 'discard-voice') { clearVoice(); updatePromptAnswerArea(); return; }
  if (action === 'send-voice') { complete(''); render(); return; }
  if (action === 'submit') { const responseType = state.currentChallenge?.responseType; const answer = responseType === 'emoji_3' ? state.emojiSelections[owner].join(' ') : state.answerDrafts[owner].trim(); if (!answer) return; complete(answer); }
  if (action === 'decline-prompt') complete('', true);
  if (action === 'send-chat' && state.drafts[owner].trim()) { state.messages.push({ kind: 'text', sender: owner, text: state.drafts[owner].trim() }); state.drafts[owner] = ''; }
  if (action === 'end-game') { clearVoice(); state.messages.push({ kind: 'system', text: `真心话大冒险已结束 · 共 ${state.completedRounds} 回合` }); state.game = 'ended'; state.type = null; state.currentChallenge = null; state.sheet = null; }
  if (action === 'restart') { state.game = 'playing'; state.active = 'me'; state.type = null; state.turn = 1; state.completedRounds = 0; state.currentChallenge = null; state.usedPromptIds = { truth: [], dare: [] }; state.sheet = null; state.messages.push({ kind: 'session' }); }
  if (action === 'toggle-review') { state.review = !state.review; state.selectedRule = null; }
  if (action === 'reset') reset();
  render();
});

app.addEventListener('input', (event) => {
  const owner = event.target.dataset.chatOwner;
  const answerOwner = event.target.dataset.answerOwner;
  if (!owner && !answerOwner) return;
  if (answerOwner) {
    state.answerDrafts[answerOwner] = event.target.value;
    const submit = event.target.closest('#answer-area')?.querySelector('[data-action="submit"]');
    if (submit) submit.disabled = !event.target.value.trim();
    return;
  }
  if (owner) state.drafts[owner] = event.target.value;
  render();
  if (owner) document.querySelector(`[data-chat-owner="${owner}"]`)?.focus();
});

app.addEventListener('keydown', (event) => {
  const owner = event.target.dataset.chatOwner;
  if (!owner || event.key !== 'Enter' || !state.drafts[owner].trim()) return;
  event.preventDefault();
  state.messages.push({ kind: 'text', sender: owner, text: state.drafts[owner].trim() });
  state.drafts[owner] = '';
  render();
});

render();
