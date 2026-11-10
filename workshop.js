'use strict';
let libraryData = null, labelAnswers = {}, duplicateItems = [], removedCopies = new Set();
function shuffled(items) { const a = items.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function saveWorkshop() { try { localStorage.setItem('datalab-workshop', JSON.stringify(workshopProgress)); } catch {} updateJourney(); }
function selectWorkshop(id, focus = false) {
  if (!['labels', 'duplicates'].includes(id)) id = 'labels';
  $$('[data-workshop]').forEach(b => { const active = b.dataset.workshop === id; b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1; });
  $('#label-lab').hidden = id !== 'labels'; $('#duplicate-lab').hidden = id !== 'duplicates';
  if (focus) $('#ws-' + id).focus();
}
$$('[data-workshop]').forEach((b, i) => { b.onclick = () => { selectWorkshop(b.dataset.workshop); history.replaceState(null, '', '#workshop-' + b.dataset.workshop); }; b.onkeydown = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const other = i ? 'labels' : 'duplicates'; selectWorkshop(other, true); history.replaceState(null, '', '#workshop-' + other); } }; });
addEventListener('lab-workshop-route', event => selectWorkshop(event.detail));

function renderLabeling() {
  const grid = $('#labelGrid'); grid.replaceChildren();
  shuffled(libraryData.train).forEach((sample, i) => {
    const card = el('article', 'label-card'); card.dataset.sample = sample.id;
    const img = new Image(); img.src = sample.src; img.alt = sample.name; img.loading = 'lazy';
    const buttons = el('div', 'label-options');
    ['Cốc', 'Chai'].forEach((name, label) => { const b = el('button', 'secondary', name); b.setAttribute('aria-label', 'Gán ảnh ' + (i + 1) + ' vào nhãn ' + name); b.setAttribute('aria-pressed', 'false'); b.onclick = () => { labelAnswers[sample.id] = label; [...buttons.children].forEach((button, j) => { button.classList.toggle('picked', j === label); button.setAttribute('aria-pressed', String(j === label)); }); card.classList.remove('label-error', 'label-correct'); $('#labelCount').textContent = Object.keys(labelAnswers).length + '/12 ảnh có nhãn'; $('#labelFeedback').textContent = ''; $('#useLabeledData').disabled = true; }; buttons.append(b); });
    card.append(img, el('span', 'sample-index', 'Ảnh ' + (i + 1)), buttons); grid.append(card);
  });
  $('#labelCount').textContent = '0/12 ảnh có nhãn'; $('#labelFeedback').textContent = ''; $('#useLabeledData').disabled = true;
}
$('#checkLabels').onclick = () => {
  if (!libraryData) return;
  let correct = 0;
  libraryData.train.forEach(s => { const card = $('#labelGrid [data-sample="' + s.id + '"]'); const ok = labelAnswers[s.id] === s.label; correct += Number(ok); card.classList.toggle('label-correct', ok); card.classList.toggle('label-error', !ok); });
  $('#labelFeedback').textContent = correct + '/12 nhãn đúng.' + (correct === 12 ? ' Bộ ảnh đã sẵn sàng để huấn luyện.' : ' Sửa các thẻ viền đỏ rồi kiểm tra lại.');
  $('#useLabeledData').disabled = correct !== 12;
  if (correct === 12) { workshopProgress.labels = true; saveWorkshop(); }
};
$('#resetLabels').onclick = () => { if (!libraryData) return; labelAnswers = {}; renderLabeling(); };

function renderDuplicates() {
  const source = [libraryData.train[0], libraryData.train[6], libraryData.train[4], libraryData.train[8], libraryData.train[5], libraryData.train[2]];
  duplicateItems = shuffled([...source, ...source.slice(0, 4)]); removedCopies = new Set();
  const grid = $('#duplicateGrid'); grid.replaceChildren();
  duplicateItems.forEach((s, i) => { const b = el('button', 'duplicate-card'); b.dataset.copy = String(i); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Loại hoặc giữ ảnh ' + (i + 1)); const img = new Image(); img.src = s.src; img.alt = s.name; img.loading = 'lazy'; b.append(img, el('span', '', 'Ảnh ' + (i + 1)), el('strong', 'remove-stamp', 'Đã loại')); b.onclick = () => { if (removedCopies.has(i)) removedCopies.delete(i); else removedCopies.add(i); b.classList.toggle('removed', removedCopies.has(i)); b.setAttribute('aria-pressed', String(removedCopies.has(i))); $('#duplicateCount').textContent = 'Đang giữ ' + (duplicateItems.length - removedCopies.size) + ' ảnh'; $('#duplicateFeedback').textContent = ''; }; grid.append(b); });
  $('#duplicateCount').textContent = 'Đang giữ 10 ảnh'; $('#duplicateFeedback').textContent = '';
}
$('#checkDuplicates').onclick = () => {
  if (!libraryData) return;
  const kept = duplicateItems.filter((_, i) => !removedCopies.has(i)); const all = [...new Set(duplicateItems.map(s => s.id))];
  const count = id => kept.filter(s => s.id === id).length, repeats = all.filter(id => count(id) > 1).length, missing = all.filter(id => count(id) === 0).length;
  if (!repeats && !missing) { $('#duplicateFeedback').textContent = 'Còn 6 ảnh khác nhau. Mỗi ảnh được giữ đúng một lần.'; workshopProgress.duplicates = true; saveWorkshop(); }
  else $('#duplicateFeedback').textContent = 'Còn ' + repeats + ' nhóm ảnh trùng; ' + missing + ' loại ảnh đã bị loại hết. Giữ một ảnh trong mỗi nhóm.';
};
$('#resetDuplicates').onclick = () => { if (libraryData) renderDuplicates(); };

$('#useLabeledData').onclick = async () => {
  if (!libraryData || uploadJobs || !libraryData.train.every(s => labelAnswers[s.id] === s.label)) return;
  if (samples.some(a => a.length) && !confirm('Thay bộ ảnh hiện tại bằng ảnh vừa gán nhãn? Nhật ký đã lưu vẫn được giữ.')) return;
  uploadJobs++; update(); $('#useLabeledData').disabled = true; $('#labelFeedback').textContent = 'Đang chuẩn bị ảnh…';
  try {
    const loaded = await Promise.all(libraryData.train.map(async s => ({ sample: await readData(s.src, 'library'), label: s.label })));
    const held = [libraryData.test[0], libraryData.test[1], libraryData.test[4], libraryData.test[5]];
    const bank = await Promise.all(held.map(s => readData(s.src, 'library')));
    samples = [loaded.filter(s => s.label === 0).map(s => s.sample), loaded.filter(s => s.label === 1).map(s => s.sample)];
    testBank = bank; model = null; modelInfo = null; tests = []; pending = null; roundSaved = false; demoMode = false; invalidateModel();
    $('#name0').value = 'Cốc'; $('#name1').value = 'Chai'; $('#demoTest').hidden = true; $('#mark').hidden = true;
    $('#prediction').innerHTML = '<div class="prediction-empty"><p>Đã có 12 ảnh học và 4 ảnh kiểm tra riêng.<br>Bấm Huấn luyện mô hình để bắt đầu.</p></div>';
    $('#modelMessage').textContent = 'Nguồn: ảnh thư viện minh họa. Bộ kiểm tra được giữ riêng.';
    $('#labelFeedback').textContent = 'Đã chuyển bộ ảnh sang phòng huấn luyện.'; openTab('model');
  } catch { $('#labelFeedback').textContent = 'Chưa tải được ảnh. Kiểm tra Internet rồi thử lại.'; }
  finally { uploadJobs--; update(); $('#useLabeledData').disabled = false; }
};

fetch('library.json?v=4').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => {
  libraryData = data; renderLabeling(); renderDuplicates(); selectWorkshop(location.hash.endsWith('duplicates') ? 'duplicates' : 'labels');
}).catch(() => { $('#labelFeedback').textContent = 'Chưa tải được kho ảnh. Kiểm tra Internet rồi tải lại trang.'; $('#duplicateFeedback').textContent = 'Chưa tải được kho ảnh.'; });
