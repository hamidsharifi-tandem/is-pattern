# is-pattern.js

**Attribute-driven formatting for inputs and text nodes.**  
Write the pattern exactly as you want it to appear — no config, no presets, no dependencies.

```html
<span is-pattern="(000) 000-0000">3361234567</span>
<!-- renders: (336) 123-4567 -->

<input is-pattern="0000 0000 0000 0000" placeholder="4111 1111 1111 1111">
<!-- formats in real-time as user types -->
```

---

## Features

- **Text nodes** — formats instantly on page load
- **Inputs** — real-time formatting as the user types
- **Smart backspace** — skips past literal characters naturally
- **Paste handling** — strips existing formatting before re-applying
- **Validation** — adds `is-pattern-valid` / `is-pattern-invalid` classes automatically
- **Form unformat** — strips formatting before submit so the server gets clean data
- **MutationObserver** — auto-formats elements added after load (Webflow CMS, modals, dynamic content)
- **Manual API** — call `IsPattern.format()` from your own scripts
- Zero dependencies · ~120 lines · ES5 compatible

---

## Installation

**Drop-in (recommended for Webflow / plain HTML):**
```html
<script src="is-pattern.js"></script>
```

**CDN (once published):**
```html
<script src="https://cdn.jsdelivr.net/gh/hamidsharifi-tandem/is-pattern/is-pattern.js"></script>
```

---

## Pattern Tokens

| Token | Matches |
|-------|---------|
| `0` | Digit (0–9) |
| `A` | Letter (a–z, A–Z) |
| `*` | Any character |
| anything else | Literal — inserted as-is |

---

## Examples

### Text nodes
```html
<!-- Phone -->
<span is-pattern="(000) 000-0000">3361234567</span>
<!-- → (336) 123-4567 -->

<!-- Currency -->
<span is-pattern="$0,000.00">98765</span>
<!-- → $987.65 -->

<!-- Credit card -->
<span is-pattern="0000 0000 0000 0000">4111111122223333</span>
<!-- → 4111 1111 1111 1111 -->

<!-- Date -->
<span is-pattern="00/00/0000">12252026</span>
<!-- → 12/25/2026 -->

<!-- SSN -->
<span is-pattern="000-00-0000">123456789</span>
<!-- → 123-45-6789 -->

<!-- ZIP+4 -->
<span is-pattern="00000-0000">123456789</span>
<!-- → 12345-6789 -->
```

### Inputs
```html
<input type="text" is-pattern="(000) 000-0000" placeholder="(555) 867-5309">
<input type="text" is-pattern="0000 0000 0000 0000" placeholder="4111 1111 1111 1111">
<input type="text" is-pattern="00/00/0000" placeholder="MM/DD/YYYY">
<input type="text" is-pattern="$0,000.00" placeholder="$1,234.56">
```

### Validation messages
Add a sibling element with class `is-pattern-msg` to show live feedback:
```html
<input type="text" is-pattern="(000) 000-0000">
<span class="is-pattern-msg"></span>
<!-- shows "3 characters remaining" or "✓ valid" automatically -->
```

CSS classes added to the input:
- `is-pattern-invalid` — incomplete
- `is-pattern-valid` — fully matched

### Form submit (auto-unformat)
Formatted values are automatically stripped before the form submits:
```html
<form>
  <input type="text" is-pattern="(000) 000-0000" name="phone">
  <!-- user sees: (336) 123-4567 -->
  <!-- server receives: 3361234567 -->
</form>
```

### Manual API
```js
// Format a value
IsPattern.format('3361234567', '(000) 000-0000')
// → "(336) 123-4567"

// Unformat a value
IsPattern.unformat('(336) 123-4567')
// → "3361234567"

// Re-run on a specific container (e.g. after injecting HTML)
IsPattern.init(document.getElementById('my-container'))
```

---

## Webflow Setup

1. Go to **Page Settings → Custom Code → Before `</body>`**
2. Paste:
```html
<script src="https://cdn.jsdelivr.net/gh/hamidsharifi-tandem/is-pattern/is-pattern.js"></script>
```
3. In the Designer, add `is-pattern` as a custom attribute on any element with the pattern as the value.

MutationObserver handles Webflow CMS list rendering automatically — no extra setup needed.

---

## License

MIT © Hamid Sharifi
