const crypto = require("crypto");

// Excludes visually-confusable characters (0/O, 1/l/I) like the reference design.
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 6;
const WIDTH = 150;
const HEIGHT = 50;

function randomInt(min, max) {
  return crypto.randomInt(min, max);
}

function generateCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[randomInt(0, CHARSET.length)];
  }
  return code;
}

function randomColor() {
  const palette = ["#1f3864", "#2e2e2e", "#33475b", "#4a2545"];
  return palette[randomInt(0, palette.length)];
}

// Renders the code as an SVG image with a pale-pink background, per-glyph
// rotation/offset jitter, and a couple of red squiggles crossing the text —
// the same visual noise pattern as the reference "I am not a robot" widget.
function renderSvg(code) {
  const glyphWidth = WIDTH / code.length;
  const glyphs = code
    .split("")
    .map((ch, i) => {
      const x = glyphWidth * i + glyphWidth / 2;
      const y = HEIGHT / 2 + randomInt(-4, 5);
      const rotate = randomInt(-20, 21);
      const fontSize = randomInt(24, 30);
      return `<text x="${x}" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="${fontSize}" fill="${randomColor()}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rotate} ${x} ${y})">${ch}</text>`;
    })
    .join("");

  const noiseLines = Array.from({ length: 3 }, () => {
    const y1 = randomInt(5, HEIGHT - 5);
    const y2 = randomInt(5, HEIGHT - 5);
    const midX = randomInt(WIDTH / 3, (2 * WIDTH) / 3);
    const midY = randomInt(5, HEIGHT - 5);
    return `<path d="M0,${y1} Q${midX},${midY} ${WIDTH},${y2}" stroke="#d9364f" stroke-width="1.5" fill="none" opacity="0.75"/>`;
  }).join("");

  const noiseDots = Array.from({ length: 20 }, () => {
    const cx = randomInt(0, WIDTH);
    const cy = randomInt(0, HEIGHT);
    return `<circle cx="${cx}" cy="${cy}" r="1" fill="#c99" opacity="0.6"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#f0cccc"/>
  ${noiseDots}
  ${glyphs}
  ${noiseLines}
</svg>`;
}

function generate() {
  const code = generateCode();
  const svg = renderSvg(code);
  return { code, svg };
}

module.exports = { generate, CODE_LENGTH };
