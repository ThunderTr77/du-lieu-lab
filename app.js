'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const cases = [
  ['Ảnh rõ, nhãn đúng', 'Phân biệt cốc và chai. Mẫu có nhiều kiểu đồ vật, nhãn đúng và ảnh rõ.', 0, 'Các mẫu phù hợp với nhiệm vụ. Bước tiếp theo vẫn là kiểm tra bằng ảnh mới.'],
  ['Một chiếc chai mang nhãn Cốc', 'Mô hình sẽ được học từ ảnh và nhãn đi kèm. Nhận xét bộ mẫu đang có.', 1, 'Đổi nhãn của ảnh chai thành Chai. Ảnh rõ vẫn là ví dụ sai nếu nhãn bị nhầm.'],
  ['Bộ ảnh chỉ có nền sáng', 'Mô hình sẽ được dùng trên cả nền sáng và nền tối. Bộ huấn luyện chỉ có nền sáng.', 2, 'Bổ sung cả cốc và chai trên nền tối. Ảnh nền sáng không sai, nhưng còn thiếu điều kiện sẽ gặp.'],
  ['Chữ trên bảng bị nhòe', 'Nhiệm vụ là đọc chữ trên bảng. Ảnh mờ đến mức không đọc được các chữ.', 1, 'Chụp lại ảnh rõ hơn hoặc bỏ ảnh không đọc được. Chất lượng cần được đánh giá theo nhiệm vụ đọc chữ.'],
  ['Tin nhắn không dấu', 'Ứng dụng cần hiểu tin nhắn người dùng thường gõ không dấu. Các ý định đã được gắn nhãn đúng.', 0, 'Không dấu không tự động là dữ liệu xấu. Các mẫu này phù hợp với cách người dùng viết.'],
  ['Một ảnh được sao chép nhiều lần', 'Cần nhận biết nhiều chiếc cốc. Bộ dữ liệu chỉ lặp đi lặp lại một ảnh cốc.', 2, 'Thêm các kiểu cốc, góc chụp và nền khác. Bản sao không tạo thêm góc nhìn mới.'],
  ['Chỉ có giọng người lớn', 'Ứng dụng nhận lệnh của cả trẻ em và người lớn. Bộ ghi âm chỉ có người lớn.', 2, 'Bổ sung giọng trẻ em rồi kiểm tra. Mô hình vẫn có thể nhận đúng một số trường hợp, nhưng cần đánh giá nhóm còn thiếu.'],
  ['Ảnh học cũng là ảnh kiểm tra', 'Cần đo khả năng nhận ảnh chưa gặp. Bộ kiểm tra lại dùng đúng các ảnh đã huấn luyện.', 1, 'Giữ riêng ảnh mới để kiểm tra. Dùng lại ảnh đã học không đánh giá đúng khả năng xử lý ảnh mới.'],
  ['Mỗi nhãn chỉ đi với một màu nền', 'Cần phân loại cốc và chai trên nhiều nền. Hiện tại cốc chỉ ở nền xanh, chai chỉ ở nền hồng.', 2, 'Thêm cốc trên nền hồng và chai trên nền xanh. Như vậy màu nền không luôn đi kèm một nhãn.'],
  ['Tiếng ồn nhẹ trong lớp', 'Ứng dụng nhận lệnh trong lớp có tiếng ồn nhẹ. Lời nói vẫn nghe rõ và nhãn đúng.', 0, 'Mẫu phản ánh môi trường sử dụng. Thử thêm nhiều giọng và mức ồn phù hợp để kiểm tra độ ổn định.']
];
let ci = 0, answered = false, quizAnswers = Array(10).fill(null), qualityDone = false, hasTrained = false;
try { qualityDone = localStorage.getItem('datalab-quality-done') === 'true'; } catch {}

function openTab(id, focus = true) {
  $$('[data-tab]').forEach(b => { const active = b.dataset.tab === id; b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1; });
  $$('.tab').forEach(t => { t.hidden = t.id !== id; });
  if (focus) { $('#' + id + ' h2').focus({ preventScroll: true }); $('#workspace').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
}
$$('[data-tab]').forEach((b, i) => {
  b.onclick = () => openTab(b.dataset.tab);
  b.onkeydown = event => { const buttons = $$('[data-tab]'); let j; if (event.key === 'ArrowRight') j = (i + 1) % buttons.length; if (event.key === 'ArrowLeft') j = (i + buttons.length - 1) % buttons.length; if (event.key === 'Home') j = 0; if (event.key === 'End') j = buttons.length - 1; if (j !== undefined) { event.preventDefault(); openTab(buttons[j].dataset.tab, false); buttons[j].focus(); } };
});
$('#startQuality').onclick = () => openTab('quality');
$('#startModel').onclick = $('#backToModel').onclick = () => openTab('model');
$('#viewReport').onclick = () => openTab('report');

function photo(c, r, label, background = false) {
  return '<div class="sample-photo"><div role="img" aria-label="Ảnh minh họa ' + label + '" style="background-image:url(assets/' + (background ? 'backgrounds' : 'objects') + '.jpg);background-position:' + (c / 3 * 100) + '% ' + (r * 100) + '%"></div><span>' + label + '</span></div>';
}
const wave = '<div class="wave" aria-hidden="true">' + '<i></i>'.repeat(14) + '</div>';
function caseVisual(index) {
  let s = '';
  if (index === 0) s = '<div class="sample-grid">' + photo(0, 0, 'Cốc') + photo(2, 0, 'Cốc') + photo(1, 1, 'Chai') + photo(3, 1, 'Chai') + '</div>';
  if (index === 1) s = '<div class="sample-grid">' + photo(0, 0, 'Cốc') + photo(0, 1, 'Cốc') + '</div>';
  if (index === 2) s = '<div class="mini-pair"><div><b>Ảnh đang có</b>' + photo(0, 0, 'Nền sáng') + photo(1, 1, 'Nền sáng') + '</div><div class="condition-label"><b>Khi sử dụng</b>Cả nền sáng<br>và nền tối</div></div>';
  if (index === 3) s = '<div class="text-board" role="img" aria-label="Minh họa chữ trên bảng bị mờ, không đọc rõ"><span>AI HỌC TỪ<br>DỮ LIỆU</span></div>';
  if (index === 4) s = '<div class="text-samples"><div>“mo nhac”<small>Nhãn: Phát nhạc</small></div><div>“bat den”<small>Nhãn: Bật đèn</small></div></div>';
  if (index === 5) s = '<div class="sample-grid six">' + Array.from({ length: 6 }, () => photo(0, 0, 'Cùng một ảnh')).join('') + '</div>';
  if (index === 6) s = '<div class="voice-grid">' + Array.from({ length: 6 }, () => '<div class="voice-sample">' + wave + 'Người lớn</div>').join('') + '</div>';
  if (index === 7) s = '<div class="mini-pair"><div><b>Huấn luyện</b>' + photo(0, 0, 'Ảnh A') + photo(0, 1, 'Ảnh B') + '</div><div><b>Kiểm tra</b>' + photo(0, 0, 'Ảnh A') + photo(0, 1, 'Ảnh B') + '</div></div>';
  if (index === 8) s = '<div class="sample-grid">' + photo(0, 0, 'Cốc', true) + photo(1, 0, 'Cốc', true) + photo(2, 0, 'Chai', true) + photo(3, 0, 'Chai', true) + '</div>';
  if (index === 9) s = '<div class="noise-sample"><span>Môi trường lớp học · ồn nhẹ</span>' + wave + '<b>“Đặt hẹn giờ 5 phút”</b><small>Nhãn: Đặt hẹn giờ</small></div>';
  return s + '<span class="visual-caption">Hình minh họa tình huống</span>';
}
function updateQuizProgress() {
  $('#caseCounter').innerHTML = String(ci + 1).padStart(2, '0') + ' <span>/ 10</span>';
  const dots = $('#quizDots'); dots.replaceChildren();
  quizAnswers.forEach((a, i) => { const d = el('i', a !== null ? 'done' : i === ci ? 'current' : ''); dots.append(d); });
  $('#caseProgress').textContent = 'Đã nhận xét ' + quizAnswers.filter(a => a !== null).length + '/10 tình huống';
}
function renderCase() {
  answered = false; $('#caseFeedback').replaceChildren(); $('#caseFeedback').className = ''; $('#nextCase').hidden = true;
    const c = cases[ci];
  $('#case').innerHTML = '<div class="case-layout"><div class="case-copy"><p class="eyebrow">QUAN SÁT & NHẬN XÉT</p><h3></h3><p class="case-description"></p></div><div class="case-visual"></div></div><div class="choices"></div>';
  $('#case h3').textContent = c[0]; $('#case .case-description').textContent = c[1]; $('#case .case-visual').innerHTML = caseVisual(ci);
  ['Phù hợp với nhiệm vụ', 'Cần sửa', 'Cần bổ sung'].forEach((text, i) => {
    const b = el('button', 'secondary', text); b.onclick = () => {
      if (answered) return; answered = true; quizAnswers[ci] = i;
      const ok = i === c[2]; b.classList.add('selected');
      $$('#case .choices button').forEach((n, j) => { n.disabled = true; if (j === c[2]) n.classList.add('correct-choice'); });
      $('#caseFeedback').className = ok ? '' : 'revisit';
      $('#caseFeedback').replaceChildren(el('strong', '', ok ? 'Nhận xét phù hợp' : 'Cùng xem lại nhiệm vụ'), el('p', '', c[3]));
      $('#nextCase').hidden = false; $('#nextCase').textContent = ci === 9 ? 'Xem tổng kết →' : 'Tình huống tiếp theo →'; updateQuizProgress();
    }; $('#case .choices').append(b);
  }); updateQuizProgress();
}
function finishQuiz() {
  qualityDone = true; try { localStorage.setItem('datalab-quality-done', 'true'); } catch {}
  const correct = quizAnswers.filter((a, i) => a === cases[i][2]).length;
  $('#case').innerHTML = '<div class="case-summary"><span class="summary-mark" aria-hidden="true">✓</span><h3>Đã hoàn thành 10 tình huống</h3><p class="summary-score"></p><p>Thử tự chụp ảnh để xem mô hình của em học từ dữ liệu thế nào.</p><div class="summary-actions"><button id="quizToModel">Vào phòng huấn luyện →</button><button id="restartQuiz" class="secondary">Làm lại thử thách</button></div></div>';
  $('#case .summary-score').textContent = correct + '/10 nhận xét phù hợp ngay lần đầu.';
  $('#caseFeedback').replaceChildren(); $('#nextCase').hidden = true; $('#caseProgress').textContent = 'Nhiệm vụ chọn dữ liệu đã hoàn thành.';
  $('#quizToModel').onclick = () => openTab('model'); $('#restartQuiz').onclick = () => { ci = 0; quizAnswers = Array(10).fill(null); renderCase(); };
  updateJourney();
}
$('#nextCase').onclick = () => { if (ci < 9) { ci++; renderCase(); } else finishQuiz(); };

let samples = [[], []], model = null, modelInfo = null, tests = [], pending = null, dirty = true;
let demoMode = false, demoCounter = 0, version = 0, rounds = [], testBank = [], uploadJobs = 0, testRequest = 0, roundSaved = false;
try { const stored = JSON.parse(localStorage.getItem('datalab-rounds') || '[]'); if (Array.isArray(stored)) rounds = stored.filter(r => Array.isArray(r.names) && Array.isArray(r.counts) && Array.isArray(r.tests) && r.total > 0 && r.correct >= 0 && r.correct <= r.total); $('#conclusion').value = localStorage.getItem('datalab-conclusion') || ''; } catch {}
const names = () => [$('#name0').value.trim() || 'Nhãn A', $('#name1').value.trim() || 'Nhãn B'];
function keyFor(url) { let h = 2166136261; for (let i = 0; i < url.length; i++) { h ^= url.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }
function invalidateModel() { dirty = true; pending = null; testRequest++; $('#mark').hidden = true; }
function vector(img) { const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, 16, 16); x.drawImage(img, 0, 0, 16, 16); const data = x.getImageData(0, 0, 16, 16).data, v = []; for (let i = 0; i < data.length; i += 4) v.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255); return v; }
function readData(url) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => { try { const c = document.createElement('canvas'), s = Math.min(1, 384 / Math.max(img.width, img.height)); c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s)); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); const data = c.toDataURL('image/jpeg', .8); resolve({ url: data, v: vector(img), key: keyFor(data) }); } catch { reject(Error('Không xử lý được ảnh. Hãy thử ảnh JPG hoặc PNG.')); } }; img.onerror = () => reject(Error('Không đọc được ảnh. Hãy thử ảnh JPG hoặc PNG.')); img.src = url; }); }
async function fromFile(f) { if (!f.type.startsWith('image/')) throw Error('Hãy chọn tệp ảnh.'); if (f.size > 25 * 1024 * 1024) throw Error('Ảnh quá lớn. Hãy dùng ảnh dưới 25 MB.'); const u = URL.createObjectURL(f); try { return await readData(u); } finally { URL.revokeObjectURL(u); } }
function updateJourney() {
  const done = [qualityDone, hasTrained || rounds.length > 0, rounds.length >= 2 && $('#conclusion').value.trim().length > 0];
  ['quality', 'model', 'report'].forEach((id, i) => { const b = $('#badge-' + id); b.textContent = done[i] ? '✓' : '0' + (i + 1); b.classList.toggle('complete', done[i]); b.setAttribute('aria-label', done[i] ? 'Nhiệm vụ đã hoàn thành' : 'Nhiệm vụ ' + (i + 1)); });
  $('#missionCount').textContent = done.filter(Boolean).length + '/3 hoàn thành';
}
function renderBank() {
  const g = $('#bankGallery'); g.replaceChildren();
  if (!testBank.length) g.append(el('div', 'bank-empty', 'Chưa có ảnh. Bộ ảnh này tách riêng với ảnh huấn luyện.'));
  testBank.forEach((s, i) => { const checked = tests.some(t => t.key === s.key), b = el('button', 'bank-item' + (checked ? ' checked' : '')); const img = new Image(); img.src = s.url; img.alt = 'Ảnh kiểm tra ' + (i + 1); b.append(img, el('span', '', 'Ảnh ' + (i + 1) + (checked ? ' · đã ghi' : ' · kiểm tra'))); b.setAttribute('aria-label', 'Kiểm tra ảnh ' + (i + 1) + (checked ? ', đã ghi kết quả' : '')); b.disabled = !model || dirty || uploadJobs > 0 || roundSaved; b.onclick = () => predict(s); g.append(b); });
  $('#bankStatus').textContent = testBank.length ? testBank.length + '/8 ảnh được giữ riêng. Bấm vào ảnh để kiểm tra.' : 'Mục tiêu: 4 ảnh, có cả hai đồ vật.'; $('#clearBank').hidden = !testBank.length;
}
function update() {
  const n = names();
  samples.forEach((a, i) => { const g = $('#gallery' + i); g.replaceChildren(); if (!a.length) { const empty = el('div', 'gallery-empty'); empty.append(el('span', '', '＋'), el('span', '', 'Thêm vài góc chụp khác nhau')); g.append(empty); }
    a.forEach((s, j) => { const f = el('figure', 'sample-thumb'), img = new Image(), remove = el('button', 'remove-photo', '×'); img.src = s.url; img.alt = 'Ảnh ' + (j + 1) + ' của nhãn ' + n[i]; remove.setAttribute('aria-label', 'Xóa ảnh ' + (j + 1) + ' của nhãn ' + n[i]); remove.disabled = uploadJobs > 0; remove.onclick = () => { samples[i].splice(j, 1); invalidateModel(); update(); }; f.append(img, remove); g.append(f); });
    $('#count' + i).textContent = a.length + ' ảnh'; $('#goal' + i).textContent = a.length >= 6 ? 'Đã có ' + a.length + ' ảnh · Có thể bổ sung góc chụp' : 'Thêm ' + (6 - a.length) + ' ảnh để đạt mục tiêu'; $('#fill' + i).style.width = Math.min(100, a.length / 6 * 100) + '%'; });
  $('#train').disabled = uploadJobs > 0; $$('input[type=file]').forEach(n => { n.disabled = uploadJobs > 0; }); $('#clearBank').disabled = uploadJobs > 0;
  $('#trainStatus').textContent = !samples[0].length && !samples[1].length ? 'Thêm ảnh cho cả hai nhãn để bắt đầu.' : dirty ? 'Dữ liệu đã thay đổi. Huấn luyện để dùng bộ ảnh hiện tại.' : 'Đã lưu ' + model.length + ' ảnh vào mô hình. Sẵn sàng thử ảnh mới.';
  [0, 1].forEach(i => { $('#truth' + i).textContent = modelInfo ? modelInfo.names[i] : n[i]; });
  const right = tests.filter(t => t.ok).length; $('#testCount').textContent = tests.length + ' ảnh đã thử'; $('#score').textContent = tests.length ? 'Đúng ' + right + '/' + tests.length + ' ảnh đã kiểm tra' : 'Chưa ghi kết quả kiểm tra.';
  $('#saveRound').disabled = roundSaved; const trail = $('#testTrail'); trail.replaceChildren(); tests.forEach((t, i) => trail.append(el('span', t.ok ? '' : 'incorrect', 'Ảnh ' + (i + 1) + ' ' + (t.ok ? '✓' : '×')))); renderBank(); updateJourney();
}
async function addTrainingFiles(input) {
  const i = Number(input.dataset.class); uploadJobs++; update(); $('#modelMessage').textContent = 'Đang đọc ảnh…'; let added = 0;
  try { for (const f of [...input.files]) { if (samples[i].length >= 36) throw Error('Mỗi nhãn tối đa 36 ảnh. Có thể xóa ảnh không cần dùng.'); const s = await fromFile(f); if (samples[i].length >= 36) throw Error('Mỗi nhãn tối đa 36 ảnh.'); samples[i].push(s); added++; invalidateModel(); } if (added) { demoMode = false; $('#demoTest').hidden = true; } $('#modelMessage').textContent = 'Đã thêm ' + added + ' ảnh. Huấn luyện khi sẵn sàng.'; }
  catch (e) { if (added) { demoMode = false; $('#demoTest').hidden = true; } $('#modelMessage').textContent = (added ? 'Đã thêm ' + added + ' ảnh. ' : '') + e.message; }
  finally { input.value = ''; uploadJobs--; update(); }
}
$$('[data-class]').forEach(input => { input.onchange = () => addTrainingFiles(input); });
$$('[data-clear]').forEach(b => { b.onclick = () => { if (uploadJobs) return; samples[Number(b.dataset.clear)] = []; invalidateModel(); update(); }; });
['#name0', '#name1'].forEach(s => { $(s).oninput = () => { invalidateModel(); update(); }; });
function train() {
  if (uploadJobs) return;
  if (names()[0].toLocaleLowerCase() === names()[1].toLocaleLowerCase()) { $('#trainStatus').textContent = 'Hai nhãn cần có tên khác nhau.'; return; }
  if (samples.some(a => a.length < 3)) { $('#trainStatus').textContent = 'Cần ít nhất 3 ảnh mỗi nhãn. Mục tiêu của bài là 6 ảnh mỗi nhãn.'; return; }
  model = samples.flatMap((a, i) => a.map(s => ({ v: s.v.slice(), label: i, url: s.url, key: s.key })));
  version++; modelInfo = { names: names(), counts: samples.map(a => a.length), demo: demoMode }; dirty = false; tests = []; pending = null; roundSaved = false; hasTrained = true; testRequest++; $('#mark').hidden = true;
  $('#prediction').innerHTML = '<div class="prediction-empty"><span aria-hidden="true">✓</span><p>Mô hình đã sẵn sàng.<br>Hãy chọn một ảnh kiểm tra.</p></div>'; $('#modelMessage').textContent = 'Đã huấn luyện. Dùng ảnh chưa có trong bộ học.'; update();
}
$('#train').onclick = train;
function predict(sample) {
  if (!model || dirty || uploadJobs) { $('#modelMessage').textContent = 'Hãy huấn luyện với dữ liệu hiện tại trước khi kiểm tra.'; return false; }
  if (roundSaved) { $('#modelMessage').textContent = 'Lượt này đã lưu. Bấm Bắt đầu lượt kiểm tra mới để tiếp tục.'; return false; }
  if (model.some(s => s.url === sample.url)) { $('#modelMessage').textContent = 'Ảnh này đã có trong bộ huấn luyện. Hãy chọn một ảnh mới.'; return false; }
  const key = sample.key || keyFor(sample.url);
  if (tests.some(t => t.key === key)) { $('#modelMessage').textContent = 'Ảnh này đã được ghi trong lượt hiện tại. Hãy chọn ảnh khác.'; return false; }
  const near = model.map(s => ({ label: s.label, url: s.url, d: s.v.reduce((sum, value, i) => sum + (value - sample.v[i]) ** 2, 0) })).sort((a, b) => a.d - b.d).slice(0, 3);
  const votes0 = near.filter(s => s.label === 0).length, label = votes0 >= 2 ? 0 : 1;
  pending = { key, label, version, votes: Math.max(votes0, 3 - votes0) };
  const result = el('div', 'predictionResult'), img = new Image(), info = el('div'); img.src = sample.url; img.alt = 'Ảnh đang kiểm tra';
  info.append(el('p', 'eyebrow', 'DỰ ĐOÁN CỦA MÔ HÌNH'), el('p', 'resultLabel', modelInfo.names[label]), el('p', 'vote', pending.votes + '/3 ví dụ gần nhất thuộc nhãn này. Không phải xác suất chắc chắn đúng.')); result.append(img, info);
  const neighbors = el('div', 'neighbors'), list = el('div', 'neighbor-list'); neighbors.append(el('p', '', 'Ba ảnh mẫu gần nhất mà mô hình đã dùng:'));
  near.forEach((s, i) => { const f = el('figure', 'neighbor'), im = new Image(); im.src = s.url; im.alt = 'Ảnh mẫu gần thứ ' + (i + 1); f.append(im, el('figcaption', '', modelInfo.names[s.label])); list.append(f); }); neighbors.append(list);
  $('#prediction').replaceChildren(result, neighbors); $('#mark').hidden = false; $('#modelMessage').textContent = 'Chọn nhãn thật để ghi kết quả.'; return true;
}
[0, 1].forEach(i => { $('#truth' + i).onclick = () => {
  if (!pending) return;
  if (dirty || pending.version !== version) { pending = null; $('#mark').hidden = true; $('#modelMessage').textContent = 'Dữ liệu đã đổi. Hãy huấn luyện lại trước khi kiểm tra tiếp.'; return; }
  const item = { key: pending.key, truth: modelInfo.names[i], prediction: modelInfo.names[pending.label], ok: i === pending.label, version: pending.version }; tests.push(item); pending = null; $('#mark').hidden = true; $('#modelMessage').textContent = item.ok ? 'Đã ghi: dự đoán đúng. Thử ảnh tiếp theo.' : 'Đã ghi: dự đoán sai. Ghi lại nền, góc chụp hoặc đồ vật trong ảnh này.'; update();
}; });
['#testFile', '#testCapture'].forEach(s => { $(s).onchange = async event => { const token = ++testRequest; try { if (event.target.files[0]) { const sample = await fromFile(event.target.files[0]); if (token === testRequest) predict(sample); } } catch (e) { $('#modelMessage').textContent = e.message; } event.target.value = ''; }; });
$('#bankFiles').onchange = async event => {
  uploadJobs++; update(); let added = 0;
  try { for (const f of [...event.target.files]) { if (testBank.length >= 8) throw Error('Bộ kiểm tra tối đa 8 ảnh.'); const s = await fromFile(f); if (!testBank.some(x => x.key === s.key)) { testBank.push(s); added++; } } $('#modelMessage').textContent = 'Đã giữ riêng ' + added + ' ảnh kiểm tra.'; } catch (e) { $('#modelMessage').textContent = e.message; }
  finally { uploadJobs--; event.target.value = ''; update(); }
};
$('#clearBank').onclick = () => { if (uploadJobs) return; testBank = []; renderBank(); };

function synthetic(label, variant, background) { const c = document.createElement('canvas'); c.width = c.height = 240; const x = c.getContext('2d'); x.fillStyle = background || '#f4f0e9'; x.fillRect(0, 0, 240, 240); const off = (variant % 3 - 1) * 8; x.fillStyle = '#142d4e'; if (label === 0) { x.fillRect(52 + off, 85, 105, 105); x.lineWidth = 17; x.strokeStyle = '#142d4e'; x.beginPath(); x.arc(164 + off, 133, 34, -Math.PI / 2, Math.PI / 2); x.stroke(); } else { x.fillRect(91 + off, 65, 58, 135); x.fillRect(104 + off, 32, 32, 42); x.fillStyle = '#f28c28'; x.fillRect(102 + off, 24, 36, 16); } return c.toDataURL(); }
$('#demo').onclick = async () => {
  if (uploadJobs) return;
  if (samples.some(a => a.length) && !confirm('Bộ minh họa sẽ thay ảnh huấn luyện và ảnh kiểm tra hiện tại. Nhật ký đã lưu vẫn được giữ. Tiếp tục?')) return;
  uploadJobs++; invalidateModel(); samples = [[], []]; testBank = []; model = null; tests = []; roundSaved = false; update();
  try { for (let i = 0; i < 2; i++) for (let j = 0; j < 6; j++) samples[i].push(await readData(synthetic(i, j))); for (let j = 0; j < 4; j++) testBank.push(await readData(synthetic(j % 2, j + 5, j < 2 ? '#e9edf2' : '#dceae4'))); $('#name0').value = 'Cốc'; $('#name1').value = 'Chai'; demoMode = true; demoCounter = 0; $('#demoTest').hidden = false; $('#modelMessage').textContent = 'Đã nạp hình vẽ minh họa: 12 ảnh học và 4 ảnh kiểm tra riêng. Bấm Huấn luyện để thử.'; } catch { $('#modelMessage').textContent = 'Không tạo được bộ minh họa. Em vẫn có thể thêm ảnh từ thiết bị.'; }
  finally { uploadJobs--; update(); }
};
$('#demoTest').onclick = () => { if (testBank.length) predict(testBank[demoCounter++ % testBank.length]); };
function persist() { try { localStorage.setItem('datalab-rounds', JSON.stringify(rounds)); localStorage.setItem('datalab-conclusion', $('#conclusion').value); } catch { $('#reportStatus').textContent = 'Trình duyệt không cho lưu nhật ký. Hãy tải báo cáo trước khi đóng trang.'; } }
$('#saveRound').onclick = () => {
  if (roundSaved) return;
  if (!tests.length || !modelInfo) { $('#modelMessage').textContent = 'Cần chọn nhãn thật cho ít nhất một ảnh kiểm tra trước khi lưu.'; return; }
  rounds.push({ version, counts: modelInfo.counts.slice(), names: modelInfo.names.slice(), correct: tests.filter(t => t.ok).length, total: tests.length, change: $('#change').value, tests: tests.map(t => ({ ...t })), demo: modelInfo.demo });
  roundSaved = true; persist(); renderRounds(); update(); $('#modelMessage').textContent = 'Đã lưu lượt ' + rounds.length + ' vào nhật ký. Bổ sung dữ liệu rồi huấn luyện lại cho lượt tiếp theo.';
};
$('#resetTests').onclick = () => { tests = []; pending = null; roundSaved = false; testRequest++; $('#mark').hidden = true; $('#prediction').innerHTML = '<div class="prediction-empty"><p>Lượt kiểm tra mới.<br>Bộ ảnh kiểm tra vẫn được giữ riêng.</p></div>'; update(); $('#modelMessage').textContent = 'Đã bắt đầu lượt kiểm tra mới.'; };
function renderRounds() {
  const comparison = $('#comparison'), box = $('#rounds'); comparison.replaceChildren(); box.replaceChildren();
  if (!rounds.length) { const empty = el('div', 'report-empty'); empty.append(el('h3', '', 'Chưa có lượt kiểm tra nào'), el('p', '', 'Huấn luyện, thử ảnh mới và lưu kết quả để tạo nhật ký.')); const go = el('button', '', 'Tạo lượt kiểm tra đầu tiên →'); go.onclick = () => openTab('model'); empty.append(go); comparison.append(empty); updateJourney(); return; }
  const cards = el('div', 'comparison'), start = Math.max(0, rounds.length - 2);
  for (let i = start; i < rounds.length; i++) { const r = rounds[i], card = el('div', 'compare-card'), score = el('strong', '', String(r.correct)); score.append(el('small', '', ' / ' + r.total + ' ảnh')); const bar = el('div', 'compare-bar'), fill = el('i'); fill.style.width = (r.correct / r.total * 100) + '%'; bar.append(fill); card.append(el('p', '', 'LƯỢT ' + (i + 1)), score, bar, el('small', '', r.demo ? 'Bộ hình vẽ minh họa' : 'Bộ ảnh tự chọn')); cards.append(card); } comparison.append(cards);
  rounds.forEach((r, i) => { const sec = el('section', 'round'), left = el('div'), right = el('div'); left.append(el('h3', '', 'Lượt ' + (i + 1)), el('div', 'round-score', r.correct + '/' + r.total)); right.append(el('p', '', r.names.map((n, j) => n + ': ' + r.counts[j] + ' ảnh').join(' · ')), el('p', '', r.change || 'Chưa ghi thay đổi dữ liệu.'), el('small', '', r.demo ? 'Nguồn: hình vẽ minh họa tổng hợp.' : 'Nguồn: ảnh do học sinh chọn.')); sec.append(left, right); box.append(sec); }); updateJourney();
}
$('#conclusion').oninput = () => { persist(); updateJourney(); };
$('#download').onclick = () => {
  const content = 'DỮ LIỆU LAB — NHẬT KÝ THÍ NGHIỆM\n\n' + rounds.map((r, i) => 'Lượt ' + (i + 1) + '\n' + r.names.map((n, j) => n + ': ' + r.counts[j] + ' ảnh').join('\n') + '\nĐúng: ' + r.correct + '/' + r.total + '\nThay đổi: ' + r.change + '\nNguồn: ' + (r.demo ? 'Hình vẽ minh họa tổng hợp' : 'Ảnh tự chọn') + '\n' + r.tests.map((t, j) => 'Ảnh ' + (j + 1) + ': nhãn thật ' + t.truth + ', dự đoán ' + t.prediction + ', ' + (t.ok ? 'đúng' : 'sai')).join('\n')).join('\n\n') + '\n\nKết luận: ' + $('#conclusion').value;
  const u = URL.createObjectURL(new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' })), a = el('a'); a.href = u; a.download = 'nhat-ky-du-lieu.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 10000); $('#reportStatus').textContent = 'Đã tạo báo cáo. Trên iPad, chọn lưu vào Tệp.';
};
$('#resetAll').onclick = () => { if (confirm('Xóa các lượt và kết luận đã lưu trên thiết bị này?')) { rounds = []; $('#conclusion').value = ''; persist(); renderRounds(); $('#reportStatus').textContent = 'Đã xóa nhật ký.'; } };
renderCase(); renderRounds(); update();
