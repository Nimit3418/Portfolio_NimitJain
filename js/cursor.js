/* Cursor: Custom pointer with click burst effect */
(() => {
  // Add custom cursor CSS
  const style = document.createElement('style');
  const b64 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBkPSJNMCAwIEwwIDIyIEw3IDE2IEwxNyAxNiBaIiBmaWxsPSIjMGMwYzBjIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==";
  style.innerHTML = `
    html, body {
      cursor: url("data:image/svg+xml;base64,${b64}") 0 0, auto !important;
    }
    a, button, input, textarea, summary, label, .fchip, .prow, [role="button"], .pal-row, .res-head {
      cursor: url("data:image/svg+xml;base64,${b64}") 0 0, pointer !important;
    }
    .click-burst {
      position: fixed;
      pointer-events: none;
      z-index: 99999;
      width: 0;
      height: 0;
    }
    .click-burst-line {
      position: absolute;
      width: 2.5px;
      height: 10px;
      border-radius: 2px;
      transform-origin: 50% 15px;
      opacity: 0;
      animation: click-burst-anim 0.35s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }
    @keyframes click-burst-anim {
      0% {
        transform: rotate(var(--rot)) translateY(-8px);
        opacity: 1;
      }
      100% {
        transform: rotate(var(--rot)) translateY(-24px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Helper to detect if background is dark
  function isDarkBackground(x, y) {
    let el = document.elementFromPoint(x, y);
    while (el && el !== document.body && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness < 128;
        }
      }
      el = el.parentElement;
    }
    return false;
  }

  // Add click event listener for the burst
  window.addEventListener('mousedown', (e) => {
    // Left clicks only
    if (e.button !== 0) return;

    const burst = document.createElement('div');
    burst.className = 'click-burst';
    
    // Position burst exactly at the cursor tip
    burst.style.left = e.clientX + 'px';
    burst.style.top = e.clientY + 'px';

    const isDark = isDarkBackground(e.clientX, e.clientY);
    const lineColor = isDark ? '#ffffff' : '#0c0c0c';

    // Lines radiating upwards and leftwards (-90 to 0 degrees)
    const angles = [-90, -67.5, -45, -22.5, 0];
    
    angles.forEach(angle => {
      const line = document.createElement('div');
      line.className = 'click-burst-line';
      line.style.setProperty('--rot', angle + 'deg');
      line.style.backgroundColor = lineColor;
      burst.appendChild(line);
    });

    document.body.appendChild(burst);

    setTimeout(() => {
      burst.remove();
    }, 400);
  });
})();
