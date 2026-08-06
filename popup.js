const enabled = document.querySelector('#enabled');
chrome.storage.sync.get({ enabled: true }, ({ enabled: value }) => { enabled.checked = value; });
enabled.addEventListener('change', () => chrome.storage.sync.set({ enabled: enabled.checked }));
document.querySelector('#options').addEventListener('click', () => chrome.runtime.openOptionsPage());
