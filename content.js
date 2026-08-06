(() => {
  const defaults = {
    enabled: true,
    stepSize: 120,
    smoothness: 0.16,
    acceleration: 1.15,
    keyboard: true,
    excludedHosts: []
  };

  let settings = { ...defaults };
  let state = new WeakMap();

  chrome.storage.sync.get(defaults, (saved) => {
    settings = { ...defaults, ...saved };
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, value] of Object.entries(changes)) settings[key] = value.newValue;
  });

  function isExcluded() {
    return settings.excludedHosts.some((host) => location.hostname === host || location.hostname.endsWith(`.${host}`));
  }

  function isEditable(target) {
    return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
  }

  function scrollableAncestor(start, deltaY) {
    let node = start instanceof Element ? start : document.documentElement;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      const canScroll = /(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
      if (canScroll) {
        const roomDown = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
        const roomUp = node.scrollTop > 1;
        if ((deltaY > 0 && roomDown) || (deltaY < 0 && roomUp)) return node;
      }
      node = node.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  function maxScroll(element) {
    return element === document.scrollingElement || element === document.documentElement
      ? Math.max(0, document.documentElement.scrollHeight - innerHeight)
      : Math.max(0, element.scrollHeight - element.clientHeight);
  }

  function currentTop(element) {
    return element === document.scrollingElement || element === document.documentElement ? scrollY : element.scrollTop;
  }

  function setTop(element, value) {
    if (element === document.scrollingElement || element === document.documentElement) scrollTo(0, value);
    else element.scrollTop = value;
  }

  function animate(element) {
    const item = state.get(element);
    if (!item) return;

    const distance = item.target - item.current;
    item.current += distance * Math.min(0.45, Math.max(0.05, Number(settings.smoothness)));
    setTop(element, item.current);

    if (Math.abs(distance) > 0.6) item.frame = requestAnimationFrame(() => animate(element));
    else {
      setTop(element, item.target);
      item.current = item.target;
      item.frame = null;
    }
  }

  function glide(element, delta) {
    let item = state.get(element);
    const actual = currentTop(element);
    if (!item) item = { current: actual, target: actual, frame: null };
    if (Math.abs(actual - item.current) > 4) item.current = item.target = actual;

    item.target = Math.max(0, Math.min(maxScroll(element), item.target + delta));
    state.set(element, item);
    if (!item.frame) item.frame = requestAnimationFrame(() => animate(element));
  }

  addEventListener("wheel", (event) => {
    if (!settings.enabled || isExcluded() || event.ctrlKey || event.metaKey) return;
    const target = scrollableAncestor(event.target, event.deltaY);
    const direction = Math.sign(event.deltaY);
    const magnitude = event.deltaMode === 1 ? Math.abs(event.deltaY) * 16 : Math.abs(event.deltaY);
    const delta = direction * Math.max(Number(settings.stepSize), magnitude) * Number(settings.acceleration);
    event.preventDefault();
    glide(target, delta);
  }, { passive: false, capture: true });

  addEventListener("keydown", (event) => {
    if (!settings.enabled || !settings.keyboard || isExcluded() || isEditable(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
    const page = Math.max(120, innerHeight * 0.82);
    const keys = {
      ArrowDown: Number(settings.stepSize),
      ArrowUp: -Number(settings.stepSize),
      PageDown: page,
      PageUp: -page,
      " ": event.shiftKey ? -page : page
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    glide(scrollableAncestor(event.target, keys[event.key]), keys[event.key]);
  }, true);
})();
