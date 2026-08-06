const defaults = { stepSize: 120, smoothness: 0.16, acceleration: 1.15, keyboard: true, excludedHosts: [] };
const ids = ['stepSize', 'smoothness', 'acceleration'];

function refreshOutput(id) {
  document.querySelector(`#${id}Value`).textContent = document.querySelector(`#${id}`).value;
}

chrome.storage.sync.get(defaults, (settings) => {
  ids.forEach((id) => {
    document.querySelector(`#${id}`).value = settings[id];
    refreshOutput(id);
  });
  document.querySelector('#keyboard').checked = settings.keyboard;
  document.querySelector('#excludedHosts').value = settings.excludedHosts.join('\n');
});

ids.forEach((id) => document.querySelector(`#${id}`).addEventListener('input', () => refreshOutput(id)));

document.querySelector('#save').addEventListener('click', () => {
  const excludedHosts = document.querySelector('#excludedHosts').value
    .split(/\r?\n/)
    .map((value) => value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
    .filter(Boolean);

  chrome.storage.sync.set({
    stepSize: Number(document.querySelector('#stepSize').value),
    smoothness: Number(document.querySelector('#smoothness').value),
    acceleration: Number(document.querySelector('#acceleration').value),
    keyboard: document.querySelector('#keyboard').checked,
    excludedHosts: [...new Set(excludedHosts)]
  }, () => {
    const status = document.querySelector('#status');
    status.textContent = 'บันทึกแล้ว';
    setTimeout(() => { status.textContent = ''; }, 1500);
  });
});
