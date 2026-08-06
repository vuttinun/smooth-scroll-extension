(() => {
  const defaults = {
    enabled: true,
    speed: 120,
    stepSize: 120,
    smoothness: 16,
    acceleration: 120,
    horizontal: true,
    ignoreTouchpad: true,
    respectReducedMotion: true,
    nestedScroll: true,
    excludedHosts: []
  };

  let settings = defaults;
  let frame = 0;
  let scrollNode = null;
  let targetX = 0;
  let targetY = 0;
  let lastWheelTime = 0;
  let repeatedWheels = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function isDisabled() {
    const host = location.hostname.toLowerCase();
    const excluded = settings.excludedHosts.some(item => host === item || host.endsWith('.' + item));
    return !settings.enabled || excluded || (settings.respectReducedMotion && reducedMotion.matches);
  }

  function isScrollable(element, horizontal, delta) {
    if (!element || element === document.body || element === document.documentElement) return false;
    const style = getComputedStyle(element);
    if (horizontal) {
      return /(auto|scroll|overlay)/.test(style.overflowX) && element.scrollWidth > element.clientWidth && (delta < 0 ? element.scrollLeft > 0 : element.scrollLeft + element.clientWidth < element.scrollWidth);
    }
    return /(auto|scroll|overlay)/.test(style.overflowY) && element.scrollHeight > element.clientHeight && (delta < 0 ? element.scrollTop > 0 : element.scrollTop + element.clientHeight < element.scrollHeight);
  }

  function getScroller(start, horizontal, delta) {
    if (!settings.nestedScroll) return document.scrollingElement;
    let element = start instanceof Element ? start : document.body;
    while (element && element !== document.body) {
      if (isScrollable(element, horizontal, delta)) return element;
      element = element.parentElement;
    }
    return document.scrollingElement;
  }

  function animate() {
    if (!scrollNode || isDisabled()) {
      frame = 0;
      return;
    }
    const factor = Math.max(0.05, Math.min(0.35, settings.smoothness / 100));
    const nextX = scrollNode.scrollLeft + (targetX - scrollNode.scrollLeft) * factor;
    const nextY = scrollNode.scrollTop + (targetY - scrollNode.scrollTop) * factor;
    scrollNode.scrollLeft = nextX;
    scrollNode.scrollTop = nextY;
    if (Math.abs(targetX - nextX) < 0.5 && Math.abs(targetY - nextY) < 0.5) {
      scrollNode.scrollLeft = targetX;
      scrollNode.scrollTop = targetY;
      frame = 0;
      repeatedWheels = 0;
      return;
    }
    frame = requestAnimationFrame(animate);
  }

  function move(element, dx, dy) {
    if (scrollNode !== element) {
      scrollNode = element;
      targetX = element.scrollLeft;
      targetY = element.scrollTop;
    }
    targetX = Math.max(0, Math.min(element.scrollWidth - element.clientWidth, targetX + dx));
    targetY = Math.max(0, Math.min(element.scrollHeight - element.clientHeight, targetY + dy));
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function looksLikeTouchpad(event) {
    return event.deltaMode === 0 && ((Math.abs(event.deltaY) > 0 && Math.abs(event.deltaY) < 40) || Math.abs(event.deltaX) > 0);
  }

  function onWheel(event) {
    if (isDisabled() || event.ctrlKey || (settings.ignoreTouchpad && looksLikeTouchpad(event))) return;
    const horizontal = settings.horizontal && (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY));
    let raw = horizontal ? (event.deltaX || event.deltaY) : event.deltaY;
    if (!raw) return;
    if (event.deltaMode === 1) raw *= 16;
    if (event.deltaMode === 2) raw *= innerHeight;

    const now = performance.now();
    repeatedWheels = now - lastWheelTime < 180 ? Math.min(repeatedWheels + 1, 6) : 0;
    lastWheelTime = now;
    const acceleration = 1 + repeatedWheels * ((settings.acceleration - 100) / 500);
    const distance = Math.sign(raw) * Math.max(Math.abs(raw), settings.stepSize) * (settings.speed / 100) * acceleration;
    const element = getScroller(event.target, horizontal, raw);
    event.preventDefault();
    move(element, horizontal ? distance : 0, horizontal ? 0 : distance);
  }

  function apply(values) {
    settings = Object.assign({}, defaults, values);
    settings.excludedHosts = Array.isArray(settings.excludedHosts) ? settings.excludedHosts : [];
  }

  chrome.storage.sync.get(defaults, apply);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    const next = Object.assign({}, settings);
    Object.keys(changes).forEach(key => { next[key] = changes[key].newValue; });
    apply(next);
  });
  addEventListener('wheel', onWheel, { passive: false });
})();