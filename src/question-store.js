import { promptBank } from './prompt-bank.js';

const STORAGE_KEY = 'hellotalk-truth-dare-question-bank-v2';

const clone = (value) => JSON.parse(JSON.stringify(value));
const normalizeRecord = (record) => record.responseType === 'voice'
  ? {
    ...record,
    maxSeconds: 60,
    text: String(record.text || '').replace(/不超过\s*\d+\s*秒的语音/g, '语音'),
  }
  : record.id === 'dare_text_04' && /二选一问题/.test(record.text || '')
    ? { ...record, text: '你用一句话夸夸自己，再发给对方。' }
    : record;

export const defaultQuestionRecords = () => Object.entries(promptBank)
  .flatMap(([type, items]) => items.map((item) => ({
    ...clone(item),
    type,
    enabled: true,
    note: '',
    updatedBy: 'Frank',
    updatedAt: '2026-08-31 14:28',
  })));

export function readQuestionRecords() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultQuestionRecords();
    const records = JSON.parse(saved);
    return Array.isArray(records) && records.length ? records.map(normalizeRecord) : defaultQuestionRecords();
  } catch {
    return defaultQuestionRecords();
  }
}

export function saveQuestionRecords(records) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function runtimePromptBank() {
  const bank = { truth: [], dare: [] };
  readQuestionRecords()
    .filter((item) => item.enabled)
    .forEach((item) => bank[item.type]?.push(item));
  return bank;
}

export function nextQuestionId(type, records) {
  const prefix = type === 'truth' ? 'truth' : 'dare';
  const max = records
    .filter((item) => item.type === type)
    .reduce((current, item) => Math.max(current, Number(item.id.match(/_(\d+)$/)?.[1]) || 0), 0);
  return `${prefix}_${String(max + 1).padStart(2, '0')}`;
}
