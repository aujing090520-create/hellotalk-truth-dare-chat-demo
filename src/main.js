import './styles.css';
import './voice-message.css';
import { runtimePromptBank } from './question-store.js';

const app = document.querySelector('#app');

const players = {
  me: { name: '林凡', avatar: '/assets/avatar-linfan.png' },
  them: { name: 'L10', avatar: '/assets/avatar-l10-person.png' },
};

const prompts = runtimePromptBank();
const VOICE_MAX_SECONDS = 60;

const emojiChoices = ['😁', '😊', '😃', '😌', '😉', '😍', '😘', '😙', '😳', '🥳', '😄', '😜', '😇', '😒', '😏', '😰', '😔', '😞', '🥹', '😥', '😨', '😂', '😮', '😱', '😠', '😡', '😤', '😪', '😎', '🤗', '😈', '👽', '❤', '💔', '💕', '💞', '💓', '✨', '💫', '🎵', '🧡', '💛', '💚', '💙', '💜', '🩷', '🖤', '🤍', '🤎', '❣️', '💗', '💖', '💘', '💝', '💟', '🥰', '😚', '🫶', '🤝', '🙌', '👏', '🎉', '🌹', '🌷', '🌻', '🍀', '☀️', '🌙', '⭐️', '🫧', '🎈', '👍', '👎', '🙏', '💪', '👋', '🤚', '✋', '🖐', '👌', '🤌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '☝️', '👆', '👇', '✍️', '💅', '🫰', '🤳', '🙆', '🙋', '🙇', '🤦', '🤷', '💁', '🧏', '🫡', '🫵', '👐', '🫱', '🫲', '☕️', '🎬', '📚', '🎮', '⚽️', '🏀', '🎨', '📷', '✈️', '🚗', '🚲', '🌍', '🏝', '🏔', '🏙', '🍜', '🍕', '🍰', '🍉', '🐱', '🐶', '🐼', '🦊', '🌿', '🌸', '🌈', '🔥', '💧', '❄️', '🌞', '🎁', '🎀', '🧩', '🪄', '🎯', '💤'];
const roundReactionChoices = [
  { emoji: '👏', label: '鼓掌', tone: 'positive' },
  { emoji: '❤️', label: '爱心', tone: 'positive' },
  { emoji: '🩴', label: '丢拖鞋', tone: 'negative' },
  { emoji: '🥚', label: '扔鸡蛋', tone: 'negative' },
];
const photoChoices = [
  { id: 'selfie', label: '自拍', className: 'photo-selfie' },
  { id: 'city', label: '城市', className: 'photo-city' },
  { id: 'food', label: '美食', className: 'photo-food' },
];

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
  roundHistory: [],
  voice: null,
  voicePlayback: { me: false, them: false },
  reactionEffect: null,
  answerDrafts: { me: '', them: '' },
  emojiSelections: { me: [], them: [] },
  photoSelections: { me: null, them: null },
  photoPickerOpen: { me: false, them: false },
  drafts: { me: '', them: '' },
  toolsOwner: 'me',
  sheet: null,
  gameSheet: null,
  gameSheetOpen: { me: false, them: false },
  gameSheetMinimized: { me: false, them: false },
  historyOpen: { me: false, them: false },
  entered: { me: false, them: false },
  ready: { me: false, them: false },
  exitBy: null,
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
let reactionEffectTimer = null;
let voicePlaybackTimer = null;
const floatOffsets = { me: { x: 0, y: 0 }, them: { x: 0, y: 0 } };
let floatDrag = null;
let suppressFloatClick = null;

function resetFloatOffsets() {
  Object.values(floatOffsets).forEach((offset) => { offset.x = 0; offset.y = 0; });
}

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
    gamepad: '<path d="M7.2 7.3h9.6c2.1 0 3.7 1.6 4.1 3.6l.9 4.4c.4 2-1.9 3.4-3.2 1.8l-1.8-2.1H7.2l-1.8 2.1c-1.3 1.6-3.6.2-3.2-1.8l.9-4.4c.4-2 2-3.6 4.1-3.6Z" fill="currentColor" stroke="none"/><path d="M8 10.5v4m-2-2h4M16.5 12.3h.01M19 14h.01" stroke="#fff" stroke-width="1.8"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4m-3 0h6"/>',
    minimize: '<path d="M5 15h14"/>',
    history: '<path d="M6 5h12M6 12h12M6 19h12"/>',
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
  if (responseType === 'photo') return photoComposer(role);
  if (responseType === 'voice') return `<button class="voice-task-start" data-action="start-voice" data-owner="${role}">${icon('mic')}<span>录制短语音</span></button>`;
  const placeholder = state.type === 'truth' ? '说说你的答案…' : '把你的回应写在这里…';
  return `<div class="answer-box"><input data-answer-owner="${role}" value="${state.answerDrafts[role]}" placeholder="${placeholder}" /></div>`;
}

function emojiComposer(role) {
  const selected = state.emojiSelections[role];
  return `<div class="emoji-composer"><div class="emoji-status"><span>${selected.length ? selected.join(' ') : '从下面选择 3 个表情'}</span><small>${selected.length}/3</small></div><div class="emoji-grid">${emojiChoices.map((emoji, index) => `<button class="emoji-option ${selected.includes(emoji) ? 'selected' : ''}" data-action="select-emoji" data-owner="${role}" data-emoji="${emoji}" data-emoji-key="${index}" aria-label="选择 ${emoji}">${emoji}</button>`).join('')}</div></div>`;
}

function photoComposer(role) {
  const selected = state.photoSelections[role];
  const hasSelection = Boolean(selected?.dataUrl);
  const input = `<input class="photo-file-input" type="file" accept="image/*" data-photo-input="${role}" aria-label="选择照片" />`;
  if (!hasSelection) {
    return `<div class="photo-composer"><div class="photo-status"><span>选择 1 张照片</span><small>未选择</small></div>${input}<button class="photo-open" data-action="open-photo-picker" data-owner="${role}">打开相册</button></div>`;
  }
  return `<div class="photo-composer"><div class="photo-status"><span>已选择 1 张照片</span><small>已选</small></div>${input}<div class="photo-selected"><span class="photo-thumb photo-uploaded"><img src="${selected.dataUrl}" alt="已选择的照片" /></span><span class="photo-selected-name">已选择照片</span><button data-action="replace-photo" data-owner="${role}">更换</button><button class="photo-remove" data-action="remove-photo" data-owner="${role}">删除</button></div></div>`;
}

function answerValue(item, role) {
  if (item.answerKind === 'voice') {
    const playing = state.voicePlayback[role];
    const bars = [7, 12, 18, 10, 15, 22, 13, 19, 9, 16].map((height) => `<i style="--wave-height:${height}px"></i>`).join('');
    return `<button class="voice-answer-player ${playing ? 'is-playing' : ''}" data-action="play-round-voice" data-owner="${role}" data-round-index="${state.roundHistory.length - 1}" aria-label="${playing ? '暂停语音' : '播放语音'}"><span class="voice-answer-play">${icon(playing ? 'pause' : 'play')}</span><span class="voice-answer-wave">${bars}</span><span class="voice-answer-duration">${voiceDuration(item.duration || 0)}</span></button>`;
  }
  if (item.answerKind === 'photo') {
    const choice = photoChoices.find((entry) => entry.id === item.photoId);
    const image = item.photoData || '/assets/avatar-l10.png';
    const className = choice?.className || 'photo-uploaded';
    return `<div class="photo-answer-value"><span class="photo-thumb ${className}"><img src="${image}" alt="已发送照片" /></span><span>已发送 1 张照片</span></div>`;
  }
  return `<div class="handoff-answer-value">${item.answer}</div>`;
}

function promptAnswerArea(role) {
  const challenge = state.currentChallenge;
  if (!challenge || challenge.player !== role) {
    const actionWord = challenge?.type === 'truth' ? '回答' : '完成';
    return `<div class="answer-observer"><span>等待 ${challenge ? name(challenge.player) : '对方'} ${actionWord}…</span></div>`;
  }
  const recording = state.voice?.status === 'recording' || state.voice?.status === 'paused';
  const responseType = challenge.responseType;
  const ready = responseType === 'emoji_3' ? state.emojiSelections[role].length === 3 : responseType === 'photo' ? Boolean(state.photoSelections[role]) : state.answerDrafts[role].trim();
  const actions = recording ? '' : responseType === 'voice'
    ? `<div class="prompt-actions" id="target-actions"><button data-action="decline-prompt">不想回答</button></div>`
    : `<div class="prompt-actions" id="target-actions"><button data-action="decline-prompt">不想回答</button><button class="purple" data-action="submit" data-owner="${role}" ${ready ? '' : 'disabled'}>完成并继续</button></div>`;
  return `<div id="answer-area" data-answer-area-role="${role}">${answerComposer(role)}${actions}</div>`;
}

function updatePromptAnswerArea() {
  document.querySelectorAll('[data-answer-area-role]').forEach((area) => {
    area.outerHTML = promptAnswerArea(area.dataset.answerAreaRole);
  });
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

function inviteMessage(message, role) {
  const own = message.sender === role;
  const owner = role;
  const status = state.game === 'ended' ? '本局已结束' : state.game === 'invited' ? own ? `等待 ${name('them')} 进入游戏` : '邀请你一起玩' : '已进入游戏';
  return `<div class="game-message-row ${own ? 'own' : 'peer'}">${own ? '' : avatar(message.sender, 'small')}<article class="invite-card"><div class="card-top"><span class="game-logo">真</span><div><strong>真心话大冒险</strong><p>${status}</p></div></div><div class="card-line">邀请你一起玩，双方在弹窗内实时互动</div><button class="card-open" data-action="open-game-sheet" data-owner="${owner}">${state.game === 'ended' ? '查看结果' : '打开游戏'}</button></article></div>`;
}

function endMessage(message) {
  return `<div class="system-message">${message.text}</div>`;
}

function conversation(role) {
  return state.messages.map((message) => {
    if (message.kind === 'text') return textMessage(message, role);
    if (message.kind === 'game-invite') return inviteMessage(message, role);
    if (message.kind === 'game-end') return endMessage(message);
    return '';
  }).join('');
}

function gamePlayers() {
  return `<div class="game-players">${['me', 'them'].map((role, index) => {
    const status = state.game === 'ended'
      ? state.exitBy === role ? '已退出' : '本局结束'
      : state.game === 'playing' ? '已进入' : state.ready[role] ? '已准备' : state.entered[role] ? '已进入' : '等待进入';
    return `<div class="game-player ${state.ready[role] ? 'is-ready' : ''} ${state.game === 'ended' && state.exitBy === role ? 'is-exited' : ''}">${avatar(role)}<strong>${name(role)}</strong><small>${status}</small></div>${index === 0 ? '<span class="game-player-link">×</span>' : ''}`;
  }).join('')}</div>`;
}

function gameHistory(role) {
  if (!state.roundHistory.length) return '';
  return `<section class="game-history"><span class="game-history-title">已完成 ${state.completedRounds} 回合</span>${state.roundHistory.map((item, index) => {
    const reaction = item.reaction;
    const canReact = role && role !== item.player && !reaction;
    const reactionContent = reaction
      ? `<span class="game-reaction-result">${name(reaction.from)} 送来 ${reaction.emoji}</span>`
      : canReact
        ? `<div class="game-reaction-picker"><span>给个回应（可选）</span><div>${roundReactionChoices.map((choice) => `<button class="reaction-${choice.tone}" data-action="react-round" data-owner="${role}" data-round-index="${index}" data-reaction="${choice.emoji}" aria-label="发送回应：${choice.label}">${choice.emoji}</button>`).join('')}</div></div>`
        : '';
    return `<article class="game-history-item"><b>第 ${item.round} 回合 · ${name(item.player)} · ${typeName(item.type)}</b><p>${item.prompt}</p><span>${item.answer}</span>${reactionContent ? `<div class="game-reaction-row">${reactionContent}</div>` : ''}</article>`;
  }).join('')}</section>`;
}

function handoffSheet(role, close, sheetActions) {
  const item = state.roundHistory[state.roundHistory.length - 1];
  if (!item) return '';
  const recipient = other(item.player);
  const recipientHere = role === recipient;
  const reaction = item.reaction;
  const history = state.historyOpen[role] ? gameHistory(role) : '';
  const reactionContent = reaction
    ? `<span class="game-reaction-result">${name(reaction.from)} 送来 ${reaction.emoji}</span>`
    : recipientHere
      ? `<div class="game-reaction-picker"><span>给个回应（可选）</span><div>${roundReactionChoices.map((choice) => `<button class="reaction-${choice.tone}" data-action="react-round" data-owner="${role}" data-round-index="${state.roundHistory.length - 1}" data-reaction="${choice.emoji}" aria-label="发送回应：${choice.label}">${choice.emoji}</button>`).join('')}</div></div>`
      : `<span class="handoff-reaction-hint">等待对方回应（可选）</span>`;
  const effectKind = state.reactionEffect?.emoji === '🥚' ? 'egg' : state.reactionEffect?.emoji === '🩴' ? 'slipper' : 'positive';
  const effect = state.reactionEffect?.owner === role
    ? `<div class="reaction-effect-overlay reaction-effect-${effectKind}" role="status" aria-live="polite"><span class="reaction-effect-spark spark-a">✦</span><span class="reaction-effect-spark spark-b">✧</span><span class="reaction-effect-spark spark-c">✦</span>${effectKind !== 'positive' ? `<span class="reaction-impact-burst" aria-hidden="true"></span><span class="reaction-impact-ring" aria-hidden="true"></span><span class="reaction-effect-debris" aria-hidden="true"></span>` : ''}<div class="reaction-effect-emoji">${state.reactionEffect.emoji}</div><strong>${name(state.reactionEffect.from)} 送来回应</strong><span>给你一个回应</span></div>`
    : '';
  return `<div class="scrim game-scrim" data-action="close-game-sheet" data-owner="${role}"></div><section class="sheet game-sheet handoff-game-sheet">${close}${sheetActions}${effect}<div class="game-modal-head"><span class="sheet-kicker">第 ${item.round} 回合</span><strong>${recipientHere ? `${name(item.player)}已完成` : '你已完成'}</strong></div><p class="handoff-state">${recipientHere ? `先看完 ${name(item.player)} 的回答，再轮到你选题` : `等待 ${name(recipient)} 查看你的回答…`}</p><article class="handoff-answer-card"><span class="game-question-meta">${name(item.player)}的${typeName(item.type)}</span><p>${item.prompt}</p>${answerValue(item, role)}<div class="game-reaction-row">${reactionContent}</div></article>${history}${recipientHere ? `<button class="purple handoff-continue" data-action="continue-after-handoff" data-owner="${role}">轮到我了，选题</button>` : '<div class="game-waiting handoff-waiting">等待对方接棒…</div>'}<button class="end-game" data-action="end-game" data-owner="${role}">结束本局</button></section>`;
}

function gameDock(role) {
  if (state.game === 'idle' || state.gameSheetOpen[role]) return '';
  return state.gameSheetMinimized[role] ? gameFloating(role) : '';
}

function historyToggle(role) {
  if (!state.completedRounds) return '';
  const label = state.historyOpen[role] ? '收起记录' : '查看记录';
  return `<button class="sheet-history ${state.historyOpen[role] ? 'is-open' : ''}" data-action="toggle-history" data-owner="${role}" aria-label="${label}">${icon('history')}</button>`;
}

function historySheet(role, close, sheetActions) {
  return `<div class="scrim game-scrim" data-action="close-history" data-owner="${role}"></div><section class="sheet game-sheet history-sheet">${close}${sheetActions}<span class="sheet-kicker">真心话大冒险</span><h2>游戏记录</h2><p>查看已完成的回合与双方回应</p><div class="history-scroll">${gameHistory(role)}</div></section>`;
}

function gameFloating(role) {
  const ended = state.game === 'ended';
  const declined = state.game === 'declined';
  const waiting = state.game === 'invited' || (state.game === 'playing' && state.active && state.active !== role);
  const status = waiting ? 'waiting' : ended ? 'ended' : declined ? 'idle' : 'active';
  const label = ended ? '查看游戏结果' : waiting ? '等待对方操作' : declined ? '查看游戏状态' : '恢复游戏弹窗';
  const offset = floatOffsets[role];
  return `<section class="game-float ${waiting ? 'is-waiting' : ''} ${ended ? 'is-ended' : ''}" data-float-owner="${role}" style="transform:translate3d(${offset.x}px,${offset.y}px,0)" aria-label="${label}">
    <button class="game-float-content" data-action="restore-game-sheet" data-owner="${role}" aria-label="${label}">
      <span class="game-float-icon">${icon('gamepad')}</span><i class="game-float-status is-${status}" aria-hidden="true"></i>
    </button>
  </section>`;
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

function gameSheet(role) {
  if (!state.gameSheet || !state.gameSheetOpen[role]) return '';
  const close = `<button class="sheet-close" data-action="exit-game" data-owner="${role}" aria-label="退出游戏">${icon('close')}</button>`;
  const minimize = `<button class="sheet-minimize" data-action="minimize-game-sheet" data-owner="${role}" aria-label="最小化游戏">${icon('minimize')}</button>`;
  const sheetActions = `<div class="game-sheet-actions">${state.completedRounds ? historyToggle(role) : ''}${minimize}</div>`;
  if (state.historyOpen[role]) return historySheet(role, `<button class="sheet-close history-back" data-action="close-history" data-owner="${role}" aria-label="返回游戏">${icon('back')}</button>`, '');
  if (state.gameSheet === 'invite') {
    const recipient = role === 'them';
    if (state.game === 'declined') return `<div class="scrim game-scrim" data-action="close-game-sheet" data-owner="${role}"></div><section class="sheet game-sheet invite-game-sheet">${close}${sheetActions}<div class="game-modal-icon">真</div><span class="sheet-kicker">真心话大冒险</span><h2>暂不开始</h2><p>${name('them')}暂时没有加入这局游戏</p><div class="invite-preview">${avatar('me')}<span>×</span>${avatar('them')}</div><button class="end-game" data-action="exit-game" data-owner="${role}">退出游戏</button></section>`;
    return `<div class="scrim game-scrim" data-action="close-game-sheet" data-owner="${role}"></div><section class="sheet game-sheet invite-game-sheet">${close}${sheetActions}<div class="game-modal-icon">真</div><span class="sheet-kicker">真心话大冒险</span><h2>${recipient ? '邀请你一起玩' : '已发出邀请'}</h2><p>${recipient ? `${name('me')} 邀请你一起玩` : `等待 ${name('them')} 进入游戏…`}</p><div class="invite-preview">${avatar('me')}<span>×</span>${recipient ? '<span class="avatar placeholder">?</span>' : avatar('them')}</div><small class="game-modal-note">进入后直接开始第一回合。</small>${recipient ? `<div class="game-modal-actions"><button class="ghost" data-action="decline" data-owner="${role}">暂不玩</button><button class="purple" data-action="accept" data-owner="${role}">进入游戏</button></div>` : '<div class="game-waiting">等待对方进入游戏…</div>'}<button class="end-game" data-action="end-game" data-owner="${role}">结束本局</button></section>`;
  }
  if (state.gameSheet === 'choice') {
    const activeHere = state.active === role;
    const history = state.historyOpen[role] ? gameHistory(role) : '';
    return `<div class="scrim game-scrim" data-action="close-game-sheet" data-owner="${role}"></div><section class="sheet game-sheet choice-game-sheet">${close}${sheetActions}<div class="game-modal-head"><span class="sheet-kicker">第 ${state.turn} 回合</span><strong>${activeHere ? `轮到 ${name(state.active)} 选择` : `等待 ${name(state.active)} 选择`}</strong></div>${gamePlayers()}${activeHere ? `<p>选择真心话或大冒险，系统会随机抽题</p><div class="choice-grid" id="target-choice"><button class="truth-choice" data-action="pick-truth" data-owner="${role}"><b>真</b><span><strong>真心话</strong><small>说说真实的你</small></span></button><button class="dare-choice" data-action="pick-dare" data-owner="${role}"><b>冒</b><span><strong>大冒险</strong><small>完成一个小挑战</small></span></button></div>` : `<div class="game-waiting large">${name(state.active)}正在选择真心话或大冒险…</div>`}${history}<button class="end-game" data-action="end-game" data-owner="${role}">结束本局</button></section>`;
  }
  if (state.gameSheet === 'handoff') return handoffSheet(role, close, sheetActions);
  if (state.gameSheet === 'prompt') {
    const prompt = currentPrompt();
    const activeHere = state.currentChallenge?.player === role;
    const challengePlayer = name(state.currentChallenge.player);
    const turnTitle = activeHere ? `到你啦，${challengePlayer}` : `等 ${challengePlayer} 完成`;
    const turnHint = activeHere ? '这一题交给你' : '对方答完，下一题到你';
    const history = state.historyOpen[role] ? gameHistory(role) : '';
    return `<div class="scrim game-scrim" data-action="close-game-sheet" data-owner="${role}"></div><section class="sheet game-sheet prompt-game-sheet">${close}${sheetActions}<div class="game-modal-head prompt-head"><span class="sheet-kicker">第 ${state.turn} 回合</span><strong>${turnTitle}</strong><small>${turnHint}</small></div><article class="prompt-question-card"><div class="game-question-meta">${challengePlayer}的${typeName(state.type)}</div><h2>${prompt}</h2><p>${activeHere ? `答完就交给 ${name(other(role))}` : '答完就轮到你'}</p></article>${promptAnswerArea(role)}${history}<button class="end-game" data-action="end-game" data-owner="${role}">结束本局</button></section>`;
  }
  if (state.gameSheet === 'ended') {
    const endedNote = state.exitBy && state.exitBy !== role
      ? `${name(state.exitBy)}已退出本局，游戏已结束`
      : state.exitBy === role ? '你已退出本局，游戏已结束' : '游戏已结束';
    return `<div class="scrim game-scrim" data-action="close-game-sheet" data-owner="${role}"></div><section class="sheet game-sheet ended-game-sheet">${close}${sheetActions}<span class="sheet-kicker">真心话大冒险</span><h2>本局已结束</h2><p class="ended-sync-note">${endedNote}</p>${gamePlayers()}${gameHistory(role)}<button class="wide-purple" data-action="restart" data-owner="${role}">再玩一次</button></section>`;
  }
  return '';
}

function sheet(role) {
  const modal = gameSheet(role);
  if (modal) return modal;
  if (!state.sheet || state.sheet.owner !== role) return '';
  if (state.sheet.type === 'mini') {
    return `<div class="scrim" data-action="close-sheet"></div><section class="sheet mini-sheet"><button class="sheet-close" data-action="close-sheet">${icon('close')}</button><h2>小游戏</h2><div class="mini-list"><button><span class="mini-mark question">?</span><span>36问</span></button><button><span class="mini-mark hands">✌︎</span><span>猜拳</span></button><button><span class="mini-mark dice">⚄</span><span>掷骰子</span></button><button class="truth-game" data-action="open-intro" data-owner="${role}"><span class="mini-mark truth">真</span><span>真心话大冒险</span></button></div></section>`;
  }
  if (state.sheet.type === 'intro') {
    return `<div class="scrim" data-action="close-sheet"></div><section class="sheet intro-sheet"><button class="sheet-close" data-action="close-sheet">${icon('close')}</button><div class="intro-stack"><b>真</b><i>冒</i></div><h2>真心话大冒险</h2><p>每回合由当前玩家选择真心话或大冒险，系统随机抽题。</p><div class="intro-tags"><span>轮流进行</span><span>仅双方可见</span><span>随时结束</span></div><button class="wide-purple" data-action="send-invite">邀请 ${name('them')} 一起玩</button></section>`;
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
  clearTimeout(reactionEffectTimer);
  reactionEffectTimer = null;
  state.game = 'playing';
  state.active = 'me';
  state.turn = 1;
  state.type = null;
  state.completedRounds = 0;
  state.currentChallenge = null;
  state.reactionEffect = null;
  state.voicePlayback = { me: false, them: false };
  state.roundHistory = [];
  state.usedPromptIds = { truth: [], dare: [] };
  state.ready = { me: true, them: true };
  state.gameSheet = 'choice';
  state.gameSheetOpen = { me: true, them: true };
  state.gameSheetMinimized = { me: false, them: false };
  state.historyOpen = { me: false, them: false };
}

function complete(answer, declined = false) {
  const challenge = state.currentChallenge;
  if (!challenge) return;
  const voiceSeconds = challenge.responseType === 'voice' ? state.voice?.duration || 0 : 0;
  const photoSelection = challenge.responseType === 'photo' ? state.photoSelections[challenge.player] : null;
  const photoId = photoSelection?.id || null;
  const photoData = photoSelection?.dataUrl || null;
  const result = declined ? `选择跳过本回合${typeName(challenge.type)}` : challenge.responseType === 'voice' ? `语音 ${voiceDuration(voiceSeconds)}` : challenge.responseType === 'photo' ? '已发送照片' : answer;
  state.roundHistory.push({ round: state.turn, player: challenge.player, type: challenge.type, prompt: challenge.text, answer: result, answerKind: challenge.responseType, duration: voiceSeconds, photoId, photoData, reaction: null });
  state.answerDrafts[challenge.player] = '';
  state.emojiSelections[challenge.player] = [];
  state.photoSelections[challenge.player] = null;
  state.photoPickerOpen[challenge.player] = false;
  state.voicePlayback = { me: false, them: false };
  state.completedRounds += 1;
  state.active = other(state.active);
  state.turn += 1;
  state.type = null;
  state.currentChallenge = null;
  clearVoice();
  state.gameSheet = 'handoff';
  state.gameSheetOpen = { me: true, them: true };
  state.gameSheetMinimized = { me: false, them: false };
  state.historyOpen = { me: false, them: false };
}

function exitGame(role = null) {
  clearVoice();
  if (state.game === 'ended') {
    if (role) {
      state.gameSheetOpen[role] = false;
      state.gameSheetMinimized[role] = false;
    }
    return;
  }
  if (role) state.messages.push({ kind: 'game-end', sender: role, text: `真心话大冒险已结束 · 共${state.completedRounds}回合` });
  state.game = 'ended';
  state.exitBy = role;
  state.active = null;
  state.type = null;
  state.currentChallenge = null;
  state.gameSheet = 'ended';
  state.gameSheetOpen = { me: true, them: true };
  state.gameSheetMinimized = { me: false, them: false };
}

function reset() {
  clearVoice();
  clearTimeout(reactionEffectTimer);
  reactionEffectTimer = null;
  clearTimeout(voicePlaybackTimer);
  voicePlaybackTimer = null;
  resetFloatOffsets();
  Object.assign(state, { game: 'idle', active: null, type: null, usedPromptIds: { truth: [], dare: [] }, turn: 0, completedRounds: 0, currentChallenge: null, reactionEffect: null, voicePlayback: { me: false, them: false }, roundHistory: [], entered: { me: false, them: false }, ready: { me: false, them: false }, exitBy: null, gameSheet: null, gameSheetOpen: { me: false, them: false }, gameSheetMinimized: { me: false, them: false }, historyOpen: { me: false, them: false }, drafts: { me: '', them: '' }, answerDrafts: { me: '', them: '' }, emojiSelections: { me: [], them: [] }, photoSelections: { me: null, them: null }, photoPickerOpen: { me: false, them: false }, toolsOwner: 'me', sheet: null, selectedRule: null, messages: [{ kind: 'text', sender: 'them', text: 'Hi! I just finished my work. How was your day?' }, { kind: 'text', sender: 'me', text: 'Pretty good! I was thinking about the weekend.' }] });
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
  if (action === 'restore-game-sheet' && suppressFloatClick === owner) {
    suppressFloatClick = null;
    return;
  }
  if (rule && !action) { state.selectedRule = rule; render(); return; }
  if (!action) return;
  if (action === 'toggle-tools') state.toolsOwner = state.toolsOwner === owner ? null : owner;
  if (action === 'open-mini') { state.toolsOwner = null; state.sheet = { type: 'mini', owner }; }
  if (action === 'open-intro') state.sheet = { type: 'intro', owner };
  if (action === 'close-sheet') state.sheet = null;
  if (action === 'send-invite') {
    const inviter = owner || 'me';
    state.sheet = null;
    state.messages.push({ kind: 'game-invite', sender: inviter });
    state.game = 'invited';
    state.exitBy = null;
    state.entered = { me: true, them: false };
    state.ready = { me: false, them: false };
    state.gameSheet = 'invite';
    state.gameSheetOpen = { me: inviter === 'me', them: inviter === 'them' };
    state.gameSheetMinimized = { me: false, them: false };
  }
  if (action === 'accept') { state.entered = { me: true, them: true }; startGame(); }
  if (action === 'decline') { state.game = 'declined'; state.gameSheet = 'invite'; state.gameSheetOpen = { me: true, them: true }; state.gameSheetMinimized = { me: false, them: false }; }
  if (action === 'open-game-sheet' || action === 'restore-game-sheet') { state.gameSheetOpen[owner] = true; state.gameSheetMinimized[owner] = false; }
  if (action === 'minimize-game-sheet') { state.gameSheetOpen[owner] = false; state.gameSheetMinimized[owner] = true; }
  if (action === 'close-game-sheet') { state.gameSheetOpen[owner] = false; state.gameSheetMinimized[owner] = false; }
  if (action === 'toggle-history') { state.historyOpen[owner] = true; }
  if (action === 'close-history') { state.historyOpen[owner] = false; }
  if (action === 'open-photo-picker' || action === 'replace-photo') {
    document.querySelector(`input[data-photo-input="${owner}"]`)?.click();
    return;
  }
  if (action === 'remove-photo') {
    state.photoSelections[owner] = null;
    state.photoPickerOpen[owner] = false;
  }
  if (action === 'open-choice') { state.gameSheet = 'choice'; state.gameSheetOpen = { me: true, them: true }; state.gameSheetMinimized = { me: false, them: false }; }
  if (action === 'continue-after-handoff' && state.gameSheet === 'handoff' && owner === state.active) { state.gameSheet = 'choice'; state.gameSheetOpen = { me: true, them: true }; state.gameSheetMinimized = { me: false, them: false }; }
  if (action === 'open-prompt') { state.gameSheet = 'prompt'; state.gameSheetOpen = { me: true, them: true }; state.gameSheetMinimized = { me: false, them: false }; }
  if (action === 'pick-truth' || action === 'pick-dare') { state.type = action === 'pick-truth' ? 'truth' : 'dare'; const prompt = drawPrompt(state.type); state.currentChallenge = { player: state.active, type: state.type, ...prompt }; state.gameSheet = 'prompt'; state.gameSheetOpen = { me: true, them: true }; state.gameSheetMinimized = { me: false, them: false }; }
  if (action === 'select-emoji') { const emoji = event.target.closest('[data-emoji]')?.dataset.emoji; const selected = state.emojiSelections[owner]; const index = selected.indexOf(emoji); if (index >= 0) selected.splice(index, 1); else if (selected.length < 3) selected.push(emoji); updatePromptAnswerArea(); return; }
  if (action === 'react-round') {
    const index = Number(event.target.closest('[data-round-index]')?.dataset.roundIndex);
    const emoji = event.target.closest('[data-reaction]')?.dataset.reaction;
    const item = state.roundHistory[index];
    if (item && emoji && owner && owner !== item.player && !item.reaction) {
      item.reaction = { from: owner, emoji };
      state.reactionEffect = { owner: other(owner), from: owner, emoji, id: `${Date.now()}-${index}` };
      const effectId = state.reactionEffect.id;
      clearTimeout(reactionEffectTimer);
      reactionEffectTimer = setTimeout(() => {
        if (state.reactionEffect?.id === effectId) {
          state.reactionEffect = null;
          render();
        }
      }, 1600);
    }
  }
  if (action === 'play-round-voice') {
    const playbackOwner = owner || 'me';
    state.voicePlayback[playbackOwner] = !state.voicePlayback[playbackOwner];
    clearTimeout(voicePlaybackTimer);
    if (state.voicePlayback[playbackOwner]) {
      voicePlaybackTimer = setTimeout(() => {
        state.voicePlayback[playbackOwner] = false;
        render();
      }, 1800);
    }
  }
  if (action === 'start-voice') { state.voice = { status: 'recording', duration: 0, owner }; startVoiceTicker(); updatePromptAnswerArea(); return; }
  if (action === 'pause-voice') { state.voice.status = 'paused'; stopVoiceTicker(); updatePromptAnswerArea(); return; }
  if (action === 'resume-voice') { state.voice.status = 'recording'; startVoiceTicker(); updatePromptAnswerArea(); return; }
  if (action === 'cancel-voice' || action === 'discard-voice') { clearVoice(); updatePromptAnswerArea(); return; }
  if (action === 'send-voice') { complete(''); render(); return; }
  if (action === 'submit') { const responseType = state.currentChallenge?.responseType; const answer = responseType === 'emoji_3' ? state.emojiSelections[owner].join(' ') : responseType === 'photo' ? '已发送照片' : state.answerDrafts[owner].trim(); if (!answer) return; complete(answer); }
  if (action === 'decline-prompt') complete('', true);
  if (action === 'send-chat' && state.drafts[owner].trim()) { state.messages.push({ kind: 'text', sender: owner, text: state.drafts[owner].trim() }); state.drafts[owner] = ''; }
  if (action === 'exit-game' || action === 'end-game') exitGame(owner);
  if (action === 'restart') { clearVoice(); state.game = 'playing'; state.exitBy = null; state.entered = { me: true, them: true }; state.ready = { me: true, them: true }; state.active = null; state.type = null; state.turn = 0; state.completedRounds = 0; state.currentChallenge = null; state.roundHistory = []; state.usedPromptIds = { truth: [], dare: [] }; startGame(); }
  if (action === 'toggle-review') { state.review = !state.review; state.selectedRule = null; }
  if (action === 'reset') reset();
  render();
});

app.addEventListener('change', (event) => {
  const input = event.target.closest('[data-photo-input]');
  if (!input) return;
  const owner = input.dataset.photoInput;
  const file = input.files?.[0];
  if (!owner || !file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.photoSelections[owner] = { id: `upload-${Date.now()}`, name: file.name, dataUrl: reader.result };
    state.photoPickerOpen[owner] = false;
    render();
  };
  reader.readAsDataURL(file);
});

app.addEventListener('pointerdown', (event) => {
  const content = event.target.closest('.game-float-content');
  const float = content?.closest('.game-float');
  const phone = float?.closest('.phone');
  if (!content || !float || !phone) return;
  const role = float.dataset.floatOwner;
  floatDrag = { content, float, phone, role, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: { ...floatOffsets[role] }, moved: false };
  content.setPointerCapture?.(event.pointerId);
  event.preventDefault();
});

app.addEventListener('pointermove', (event) => {
  if (!floatDrag || event.pointerId !== floatDrag.pointerId) return;
  const { float, phone, role, origin } = floatDrag;
  const dx = event.clientX - floatDrag.startX;
  const dy = event.clientY - floatDrag.startY;
  if (Math.abs(dx) + Math.abs(dy) > 3) floatDrag.moved = true;
  const maxX = Math.max(0, phone.clientWidth - float.offsetWidth);
  const minY = 44 - float.offsetTop;
  const maxY = Math.max(minY, phone.clientHeight - 6 - float.offsetTop - float.offsetHeight);
  const offset = floatOffsets[role];
  offset.x = Math.min(maxX, Math.max(0, origin.x + dx));
  offset.y = Math.min(maxY, Math.max(minY, origin.y + dy));
  float.style.transform = `translate3d(${offset.x}px,${offset.y}px,0)`;
  event.preventDefault();
});

function finishFloatDrag(event) {
  if (!floatDrag || (event.pointerId !== undefined && event.pointerId !== floatDrag.pointerId)) return;
  const drag = floatDrag;
  drag.content.releasePointerCapture?.(drag.pointerId);
  if (drag.moved) suppressFloatClick = drag.role;
  floatDrag = null;
}

app.addEventListener('pointerup', finishFloatDrag);
app.addEventListener('pointercancel', finishFloatDrag);

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
