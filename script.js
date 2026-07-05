const canvas = document.querySelector("#matrix-field");
const ctx = canvas.getContext("2d", { alpha: true });
const graphCanvas = document.querySelector("#rgb-graph");
const graphCtx = graphCanvas ? graphCanvas.getContext("2d", { alpha: true }) : null;
const glyphs = "010101101100AI ML DS PY STAT";
let columns = [];
let width = 0;
let height = 0;
let frame = 0;
let graphWidth = 0;
let graphHeight = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.ceil(width / 26);
  columns = Array.from({ length: count }, (_, index) => ({
    x: index * 26,
    y: Math.random() * height,
    speed: 0.55 + Math.random() * 1.35,
    size: 12 + Math.random() * 6
  }));

  if (graphCanvas && graphCtx) {
    const graphRatio = Math.min(window.devicePixelRatio || 1, 2);
    const graphRect = graphCanvas.getBoundingClientRect();
    graphWidth = graphRect.width;
    graphHeight = graphRect.height;
    graphCanvas.width = Math.floor(graphWidth * graphRatio);
    graphCanvas.height = Math.floor(graphHeight * graphRatio);
    graphCtx.setTransform(graphRatio, 0, 0, graphRatio, 0, 0);
  }
}

function draw() {
  frame += 1;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(7, 8, 13, 0.08)";
  ctx.fillRect(0, 0, width, height);

  for (const column of columns) {
    const char = glyphs[Math.floor(Math.random() * glyphs.length)];
    ctx.font = `${column.size}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    ctx.fillStyle = frame % 9 === 0 ? "rgba(217, 170, 80, 0.58)" : "rgba(84, 216, 255, 0.48)";
    ctx.fillText(char, column.x, column.y);
    column.y += column.speed;

    if (column.y > height + 40) {
      column.y = -20;
      column.speed = 0.55 + Math.random() * 1.35;
    }
  }

  if (graphCanvas && graphCtx) {
    drawRgbGraph();
  }
  requestAnimationFrame(draw);
}

function drawGraphLine(points, color, glowColor) {
  graphCtx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      graphCtx.moveTo(point.x, point.y);
    } else {
      graphCtx.lineTo(point.x, point.y);
    }
  });
  graphCtx.lineWidth = 3;
  graphCtx.strokeStyle = color;
  graphCtx.shadowBlur = 18;
  graphCtx.shadowColor = glowColor;
  graphCtx.stroke();
  graphCtx.shadowBlur = 0;
}

function graphPoints(offset, amplitude, lift) {
  const points = [];
  const steps = 76;
  for (let index = 0; index <= steps; index += 1) {
    const x = (index / steps) * graphWidth;
    const wave = Math.sin(index * 0.32 + frame * 0.035 + offset);
    const pulse = Math.cos(index * 0.11 + frame * 0.018 + offset) * 0.5;
    const y = graphHeight * lift + (wave + pulse) * amplitude;
    points.push({ x, y });
  }
  return points;
}

function drawRgbGraph() {
  graphCtx.clearRect(0, 0, graphWidth, graphHeight);
  graphCtx.fillStyle = "rgba(7, 8, 13, 0.64)";
  graphCtx.fillRect(0, 0, graphWidth, graphHeight);

  graphCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  graphCtx.lineWidth = 1;
  for (let x = 0; x < graphWidth; x += graphWidth / 8) {
    graphCtx.beginPath();
    graphCtx.moveTo(x, 0);
    graphCtx.lineTo(x, graphHeight);
    graphCtx.stroke();
  }
  for (let y = 0; y < graphHeight; y += graphHeight / 5) {
    graphCtx.beginPath();
    graphCtx.moveTo(0, y);
    graphCtx.lineTo(graphWidth, y);
    graphCtx.stroke();
  }

  drawGraphLine(graphPoints(0, 30, 0.5), "rgba(255, 85, 115, 0.92)", "rgba(255, 85, 115, 0.8)");
  drawGraphLine(graphPoints(2.1, 38, 0.44), "rgba(109, 255, 178, 0.9)", "rgba(109, 255, 178, 0.72)");
  drawGraphLine(graphPoints(4.2, 46, 0.56), "rgba(84, 216, 255, 0.96)", "rgba(84, 216, 255, 0.82)");

  const x = (frame * 2.2) % graphWidth;
  const gradient = graphCtx.createLinearGradient(x - 80, 0, x + 80, 0);
  gradient.addColorStop(0, "rgba(156, 246, 255, 0)");
  gradient.addColorStop(0.5, "rgba(156, 246, 255, 0.22)");
  gradient.addColorStop(1, "rgba(156, 246, 255, 0)");
  graphCtx.fillStyle = gradient;
  graphCtx.fillRect(x - 80, 0, 160, graphHeight);
}

const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  header.style.background = window.scrollY > 30 ? "rgba(5, 6, 10, 0.86)" : "rgba(5, 6, 10, 0.64)";
});

const revealPanels = document.querySelectorAll(".reveal-panel");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  revealPanels.forEach((panel) => observer.observe(panel));
} else {
  revealPanels.forEach((panel) => panel.classList.add("is-visible"));
}

window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
draw();
