const DEFAULTS = {
  enabled: true,
  preset: "balanced",
  speed: 120,
  stepSize: 120,
  smoothness: 16,
  acceleration: 120,
  momentum: true,
  keyboard: true,
  horizontal: true,
  ignoreTouchpad: true,
  respectReducedMotion: true,
  nestedScroll: true,
  excludedHosts: []
};

const PRESETS = {
  balanced: { speed: 120, stepSize: 120, smoothness: 16, acceleration: 120, momentum: true, ignoreTouchpad: true },
  fast: { speed: 160, stepSize: 150, smoothness: 23, acceleration: 135, momentum: true, ignoreTouchpad: true },
  smooth: { speed: 105, stepSize: 110, smoothness: 10, acceleration: 115, momentum: true, ignoreTouchpad: true },
  native: { speed: 100, stepSize: 80, smoothness: 28, acceleration: 100, momentum: false, ignoreTouchpad: false }
};

const ids = ["speed", "stepSize", "smoothness", "acceleration", "momentum", "keyboard", "horizontal", "ignoreTouchpad", "respectReducedMotion", "nestedScroll", "excludedHosts"];
const numericIds = new Set(["speed", "stepSize", "smoothness", "acceleration"]);
const checkboxIds = new Set(["momentum", "keyboard", "horizontal", "ignoreTouchpad", "respectReducedMotion", "nestedScroll"]);

function updateOutputs() {
  document.querySelector("#speedValue").textContent = `${document.querySelector("#speed").value}%`;
  document.querySelector("#stepSizeValue").textContent = `${document.querySelector("#stepSize").value}px`;
  document.querySelector("#smoothnessValue").textContent = `${document.querySelector("#smoothness").value}%`;
  document.querySelector("#accelerationValue").textContent = `${document.querySelector("#acceleration").value}%`;
}

function setActivePreset(name) {
  document.querySelectorAll(".preset").forEach(button => button.classList.toggle("active", button.dataset.preset === name));
}

function applySettings(settings) {
  const value = { ...DEFAULTS, ...settings };
  ids.forEach(id => {
    const element = document.getElementById(id);
    if (checkboxIds.has(id)) element.checked = Boolean(value[id]);
    else if (id === "excludedHosts") element.value = (value.excludedHosts || []).join("\n");
    else element.value = value[id];
  });
  setActivePreset(value.preset);
  updateOutputs();
}

function collectSettings() {
  const settings = {};
  ids.forEach(id => {
    const element = document.getElementById(id);
    if (checkboxIds.has(id)) settings[id] = element.checked;
    else if (numericIds.has(id)) settings[id] = Number(element.value);
    else if (id === "excludedHosts") settings[id] = element.value.split(/\r?\n/).map(v => v.trim().toLowerCase()).filter(Boolean);
  });
  const active = document.querySelector(".preset.active");
  settings.preset = active?.dataset.preset || "custom";
  return settings;
}

chrome.storage.sync.get(DEFAULTS, applySettings);

document.querySelectorAll('input[type="range"]').forEach(input => {
  input.addEventListener("input", () => {
    updateOutputs();
    setActivePreset("custom");
  });
});

document.querySelectorAll(".preset").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.preset;
    applySettings({ ...collectSettings(), ...PRESETS[name], preset: name });
  });
});

document.getElementById("save").addEventListener("click", async () => {
  const settings = collectSettings();
  await chrome.storage.sync.set(settings);
  const status = document.getElementById("status");
  status.textContent = "บันทึกแล้ว";
  window.setTimeout(() => { status.textContent = ""; }, 1800);
});