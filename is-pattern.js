/*!
 * is-pattern.js v2.1
 * Attribute-driven formatting for inputs and text nodes.
 * https://github.com/hamidsharifi-tandem/is-pattern
 * MIT License
 */
(function (global) {

  // ── Core formatter ────────────────────────────────────────
  function format(raw, pattern) {
    if (!raw || !pattern) return raw || '';
    var isCurrency = /^\$/.test(pattern) && /[,\.]/.test(pattern);
    if (isCurrency) return formatCurrency(raw, pattern);
    var clean = raw.replace(/[^a-zA-Z0-9]/g, '');
    var out = '', ri = 0;
    for (var pi = 0; pi < pattern.length; pi++) {
      if (ri >= clean.length) break;
      var p = pattern[pi];
      if (p === '0') {
        if (/\d/.test(clean[ri])) { out += clean[ri++]; }
        else { ri++; pi--; }
      } else if (p === 'A') {
        if (/[a-zA-Z]/.test(clean[ri])) { out += clean[ri++]; }
        else { ri++; pi--; }
      } else if (p === '*') {
        out += clean[ri++];
      } else {
        out += p;
      }
    }
    return out;
  }

  function formatCurrency(raw, pattern) {
    var nums = raw.replace(/[^0-9]/g, '');
    if (!nums) return '';
    var decMatch = pattern.match(/\.(0+)/);
    var decimals = decMatch ? decMatch[1].length : 2;
    var num = parseFloat(nums) / Math.pow(10, decimals);
    return '$' + num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // ── Unformat: strips back to raw alphanumeric ─────────────
  function unformat(value) {
    return value.replace(/[^a-zA-Z0-9]/g, '');
  }

  // ── Count token slots in a pattern ───────────────────────
  function patternLength(pattern) {
    var tokens = 0;
    for (var i = 0; i < pattern.length; i++) {
      if ('0A*'.indexOf(pattern[i]) !== -1) tokens++;
    }
    return tokens;
  }

  // ── Apply to a text node ──────────────────────────────────
  function applyText(el) {
    var pattern = el.getAttribute('is-pattern');
    if (!pattern) return;
    var raw = el.textContent.trim();
    if (raw) el.textContent = format(raw, pattern);
  }

  // ── Apply to an input ─────────────────────────────────────
  function applyInput(el) {
    var pattern = el.getAttribute('is-pattern');
    if (!pattern) return;

    function update(val) {
      var pos = el.selectionStart;
      var formatted = format(val, pattern);
      el.value = formatted;
      var newPos = Math.min(pos + (formatted.length - val.length), formatted.length);
      try { el.setSelectionRange(newPos, newPos); } catch (e) {}

      // Validation
      var rawLen = unformat(formatted).length;
      var expected = patternLength(pattern);
      var msg = el.parentNode && el.parentNode.querySelector('.is-pattern-msg');
      if (formatted.length === 0) {
        el.classList.remove('is-pattern-valid', 'is-pattern-invalid');
        if (msg) { msg.textContent = ''; msg.className = 'is-pattern-msg'; }
      } else if (rawLen >= expected) {
        el.classList.add('is-pattern-valid'); el.classList.remove('is-pattern-invalid');
        if (msg) { msg.textContent = '✓ valid'; msg.className = 'is-pattern-msg is-pattern-msg--valid'; }
      } else {
        el.classList.add('is-pattern-invalid'); el.classList.remove('is-pattern-valid');
        var rem = expected - rawLen;
        if (msg) { msg.textContent = rem + ' character' + (rem > 1 ? 's' : '') + ' remaining'; msg.className = 'is-pattern-msg is-pattern-msg--invalid'; }
      }
    }

    // Typing
    el.addEventListener('input', function () { update(el.value); });

    // Paste: strip formatting, re-apply cleanly
    el.addEventListener('paste', function (e) {
      e.preventDefault();
      var pasted = (e.clipboardData || window.clipboardData).getData('text');
      var start = el.selectionStart, end = el.selectionEnd;
      var beforeCursor = unformat(el.value.slice(0, start));
      var afterCursor = unformat(el.value.slice(end));
      var merged = beforeCursor + unformat(pasted) + afterCursor;
      update(format(merged, pattern));
    });

    // Backspace: skip past literals
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'Backspace') return;
      var pos = el.selectionStart;
      if (pos === 0 || el.selectionStart !== el.selectionEnd) return;
      var prev = el.value[pos - 1];
      if (prev && unformat(prev) === '') {
        e.preventDefault();
        el.setSelectionRange(pos - 1, pos - 1);
      }
    });
  }

  // ── Init: scan a root element ─────────────────────────────
  function init(root) {
    root = root || document;
    root.querySelectorAll('[is-pattern]:not(input):not(textarea)').forEach(applyText);
    root.querySelectorAll('input[is-pattern], textarea[is-pattern]').forEach(applyInput);
  }

  // ── Form: auto-unformat on submit ─────────────────────────
  // Add is-pattern-keep attribute to any input to skip unformatting:
  // <input is-pattern="(000) 000-0000" is-pattern-keep>
  document.addEventListener('submit', function (e) {
    var form = e.target;
    form.querySelectorAll('input[is-pattern], textarea[is-pattern]').forEach(function (el) {
      if (el.hasAttribute('is-pattern-keep')) return;
      el.dataset.formatted = el.value;
      el.value = unformat(el.value);
    });
    setTimeout(function () {
      form.querySelectorAll('[data-formatted]').forEach(function (el) {
        el.value = el.dataset.formatted;
        delete el.dataset.formatted;
      });
    }, 100);
  }, true);

  // ── MutationObserver: handle dynamic / CMS content ───────
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.hasAttribute('is-pattern')) {
          if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') applyInput(node);
          else applyText(node);
        }
        node.querySelectorAll && node.querySelectorAll('[is-pattern]').forEach(function (el) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') applyInput(el);
          else applyText(el);
        });
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ── Public API ────────────────────────────────────────────
  global.IsPattern = { format: format, unformat: unformat, init: init };

  // ── Boot ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

})(window);
