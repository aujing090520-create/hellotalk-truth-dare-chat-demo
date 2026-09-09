import './admin.css';
import './admin-overrides.css';
import { nextQuestionId, readQuestionRecords, saveQuestionRecords } from './question-store.js';

const app = document.querySelector('#app');
const state = {
  records: readQuestionRecords(),
  keyword: '',
  type: 'all',
  responseType: 'all',
  status: 'all',
  editor: null,
  toast: '',
};

const typeName = (type) => type === 'truth' ? '真心话' : '大冒险';
const responseName = (type) => ({ text: '文字输入', voice: '短语音', emoji_3: '选 3 个表情', photo: '系统相册·单张照片' })[type] || '—';
const now = () => '2026-08-31 14:28';
const escapeHtml = (text = '') => String(text).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

function filteredRecords() {
  const keyword = state.keyword.trim().toLowerCase();
  return state.records.filter((item) => {
    const keywordMatch = !keyword || item.id.toLowerCase().includes(keyword) || item.text.toLowerCase().includes(keyword);
    return keywordMatch
      && (state.type === 'all' || item.type === state.type)
      && (state.responseType === 'all' || item.responseType === state.responseType)
      && (state.status === 'all' || String(item.enabled) === state.status);
  });
}

function editorTemplate() {
  if (!state.editor) return '';
  const item = state.editor;
  const isTruth = item.type === 'truth';
  const responseField = isTruth
    ? `<div class="form-field fixed-component"><span>回答组件</span><div class="fixed-value"><b>文字输入</b><small>真心话固定使用文字输入</small></div></div>`
    : `<label class="form-field"><span>回答组件 <i>*</i></span><select data-field="responseType"><option value="text" ${item.responseType === 'text' ? 'selected' : ''}>文字输入</option><option value="voice" ${item.responseType === 'voice' ? 'selected' : ''}>短语音（最多 60 秒）</option><option value="emoji_3" ${item.responseType === 'emoji_3' ? 'selected' : ''}>选 3 个表情</option><option value="photo" ${item.responseType === 'photo' ? 'selected' : ''}>系统相册·单张照片</option></select></label>`;
  return `<div class="admin-mask" data-action="close-editor"></div>
    <section class="editor-modal" role="dialog" aria-modal="true" aria-label="${item._new ? '新增题目' : '编辑题目'}">
      <header><strong>${item._new ? '新增题目' : '编辑题目'}</strong><button class="modal-close" data-action="close-editor" aria-label="关闭">×</button></header>
      <div class="editor-body">
        <label class="form-field full"><span>题目内容 <i>*</i></span><textarea data-field="text" maxlength="120" placeholder="请输入题目或挑战内容">${escapeHtml(item.text)}</textarea><small>建议为一句可在单聊中完成的轻社交表达，不含性、身体、隐私追问或线下见面要求。</small></label>
        <label class="form-field"><span>题目类型 <i>*</i></span><select data-field="type"><option value="truth" ${item.type === 'truth' ? 'selected' : ''}>真心话</option><option value="dare" ${item.type === 'dare' ? 'selected' : ''}>大冒险</option></select></label>
        ${responseField}
        <label class="form-field full"><span>备注</span><input data-field="note" value="${escapeHtml(item.note || '')}" maxlength="80" placeholder="仅后台可见，例如适用语种或运营说明" /></label>
        <div class="switch-line"><div><b>启用状态</b><small>关闭后，聊天中的随机抽题不会命中本题。</small></div><button class="switch ${item.enabled ? 'on' : ''}" data-action="toggle-editor-status" role="switch" aria-checked="${item.enabled}"><i></i></button></div>
      </div>
      <footer><button class="secondary-btn" data-action="close-editor">取消</button><button class="primary-btn" data-action="save-editor">保存</button></footer>
    </section>`;
}

function render() {
  const records = filteredRecords();
  const enabled = state.records.filter((item) => item.enabled).length;
  app.innerHTML = `<main class="admin-app">
    <aside class="admin-sidebar">
      <div class="admin-brand"><span>HT</span><div><b>HelloTalk</b><small>Operation Workbench</small></div></div>
      <p class="side-label">小游戏</p>
      <div class="side-current"><span>▤</span>题库管理</div>
      <div class="side-footer"><b>林凡 Frank</b><small>测试环境</small></div>
    </aside>
    <section class="admin-shell">
      <header class="admin-topbar"><strong>HelloTalk</strong><span>小游戏 / 题库管理</span><div><a href="/?mode=demo">查看聊天预览 ↗</a><b>测试环境 · 林凡 Frank</b></div></header>
      <main class="admin-content">
        <div class="page-title"><div><small>真心话大冒险</small><h1>题库管理</h1></div><button class="primary-btn" data-action="new-question">＋ 新增题目</button></div>
        <section class="filter-card">
          <label>题目 ID / 内容<input data-filter="keyword" value="${escapeHtml(state.keyword)}" placeholder="请输入" /></label>
          <label>题目类型<select data-filter="type"><option value="all">全部</option><option value="truth" ${state.type === 'truth' ? 'selected' : ''}>真心话</option><option value="dare" ${state.type === 'dare' ? 'selected' : ''}>大冒险</option></select></label>
          <label>回答组件<select data-filter="responseType"><option value="all">全部</option><option value="text" ${state.responseType === 'text' ? 'selected' : ''}>文字输入</option><option value="voice" ${state.responseType === 'voice' ? 'selected' : ''}>短语音</option><option value="emoji_3" ${state.responseType === 'emoji_3' ? 'selected' : ''}>选 3 个表情</option><option value="photo" ${state.responseType === 'photo' ? 'selected' : ''}>系统相册·单张照片</option></select></label>
          <label>启用状态<select data-filter="status"><option value="all">全部</option><option value="true" ${state.status === 'true' ? 'selected' : ''}>已启用</option><option value="false" ${state.status === 'false' ? 'selected' : ''}>已停用</option></select></label>
          <div class="filter-actions"><small>筛选结果实时更新</small><button class="clear-btn" data-action="clear">重置</button></div>
        </section>
        <p class="list-meta">共 ${state.records.length} 题，已启用 ${enabled} 题 · 真心话仅支持文字输入；大冒险可配置文字、短语音、表情或系统相册照片组件</p>
        <section class="table-card"><table><thead><tr><th>ID</th><th>题目内容</th><th>类型</th><th>回答组件</th><th>状态</th><th>更新人</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${records.length ? records.map((item) => `<tr><td>${item.id}</td><td class="question-cell"><b>${escapeHtml(item.text)}</b>${item.note ? `<small>${escapeHtml(item.note)}</small>` : ''}</td><td><span class="type-pill ${item.type}">${typeName(item.type)}</span></td><td>${responseName(item.responseType)}</td><td><span class="status-pill ${item.enabled ? 'enabled' : 'disabled'}">${item.enabled ? '启用' : '停用'}</span></td><td>${item.updatedBy || 'Frank'}</td><td>${item.updatedAt || '—'}</td><td class="row-actions"><button data-action="edit" data-id="${item.id}">编辑</button><button data-action="copy" data-id="${item.id}">复制</button><button data-action="toggle" data-id="${item.id}">${item.enabled ? '停用' : '启用'}</button><button class="danger" data-action="remove" data-id="${item.id}">删除</button></td></tr>`).join('') : '<tr><td colspan="8" class="empty-row">暂无符合条件的题目</td></tr>'}</tbody></table></section>
      </main>
    </section>
    ${state.toast ? `<div class="admin-toast">${state.toast}</div>` : ''}
    ${editorTemplate()}
  </main>`;
}

function persist(message) {
  saveQuestionRecords(state.records);
  state.toast = message;
  window.setTimeout(() => { state.toast = ''; render(); }, 1600);
}

app.addEventListener('input', (event) => {
  const filter = event.target.dataset.filter;
  const field = event.target.dataset.field;
  if (filter === 'keyword') { state.keyword = event.target.value; render(); event.target.focus(); }
  if (field) state.editor[field] = event.target.value;
});

app.addEventListener('change', (event) => {
  const filter = event.target.dataset.filter;
  const field = event.target.dataset.field;
  if (filter) { state[filter] = event.target.value; render(); }
  if (field) {
    state.editor[field] = event.target.value;
    if (field === 'type' && event.target.value === 'truth') state.editor.responseType = 'text';
    render();
  }
});

app.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const id = event.target.closest('[data-id]')?.dataset.id;
  if (!action) return;
  if (action === 'new-question') state.editor = { _new: true, id: nextQuestionId('truth', state.records), type: 'truth', text: '', responseType: 'text', enabled: true, note: '' };
  if (action === 'edit') state.editor = { ...state.records.find((item) => item.id === id) };
  if (action === 'copy') { const source = state.records.find((item) => item.id === id); state.editor = { ...source, _new: true, id: nextQuestionId(source.type, state.records), text: `${source.text}（副本）` }; }
  if (action === 'toggle') { const item = state.records.find((record) => record.id === id); item.enabled = !item.enabled; item.updatedAt = now(); persist(`已${item.enabled ? '启用' : '停用'} ${item.id}`); }
  if (action === 'remove') { state.records = state.records.filter((item) => item.id !== id); persist(`已删除 ${id}`); }
  if (action === 'close-editor') state.editor = null;
  if (action === 'toggle-editor-status') state.editor.enabled = !state.editor.enabled;
  if (action === 'save-editor') {
    const text = state.editor.text.trim();
    if (!text) { state.toast = '请填写题目内容'; render(); return; }
    const item = { ...state.editor, text, responseType: state.editor.type === 'truth' ? 'text' : state.editor.responseType, updatedBy: 'Frank', updatedAt: now() };
    delete item._new;
    if (state.editor._new) state.records.unshift(item);
    else state.records = state.records.map((record) => record.id === item.id ? item : record);
    state.editor = null;
    persist('题目已保存，聊天预览将读取最新启用题目');
  }
  if (action === 'clear') Object.assign(state, { keyword: '', type: 'all', responseType: 'all', status: 'all' });
  render();
});

render();
