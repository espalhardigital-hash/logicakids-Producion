const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.resolve(__dirname, '..', 'resultados');
const HISTORIAL_BUGS_PATH = path.resolve(__dirname, '..', 'reportes_bugs', 'historial_bugs.md');
const PROGRESO_SRE_PATH = path.resolve(__dirname, '..', 'progreso_sre.json');
const INDEX_HTML = path.resolve(RESULTS_DIR, 'index.html');
const REPORTE_HTML = path.resolve(RESULTS_DIR, 'reporte.html');

function parseMarkdownToBugs(mdContent) {
  const sections = mdContent.split(/\n## /g);
  const bugs = [];

  for (let i = 1; i < sections.length; i++) {
    const rawSection = sections[i].trim();
    if (!rawSection) continue;

    const lines = rawSection.split('\n');
    const headerLine = lines[0];
    const isResolved = headerLine.includes('✅') || headerLine.toLowerCase().includes('resuelto') || headerLine.toLowerCase().includes('completado');
    const bugId = headerLine.replace(/[✅❌]/g, '').trim();

    const tableMatch = rawSection.match(/\|[\s\S]*?\|/g);
    let fechaDeteccion = 'N/A';
    let fechaResolucion = 'N/A';
    let estado = isResolved ? 'RESUELTO' : 'PENDIENTE';

    if (tableMatch) {
      const tableText = tableMatch.join('\n');
      const detMatch = tableText.match(/\*\*Fecha detección\*\*\s*\|\s*([^|\n]+)/);
      const resMatch = tableText.match(/\*\*Fecha resolución\*\*\s*\|\s*([^|\n]+)/);
      const estMatch = tableText.match(/\*\*Estado\*\*\s*\|\s*([^|\n]+)/);
      
      if (detMatch) fechaDeteccion = detMatch[1].trim();
      if (resMatch) fechaResolucion = resMatch[1].trim();
      if (estMatch) {
        const estVal = estMatch[1].trim();
        if (estVal.includes('PENDIENTE') || estVal.includes('🔴')) estado = 'PENDIENTE';
        else estado = 'RESUELTO';
      }
    }

    const probMatch = rawSection.match(/### Problema\s*([\s\S]*?)(?=###|$|---)/);
    const solMatch = rawSection.match(/### Solución Aplicada\s*([\s\S]*?)(?=###|$|---)/);
    const filesMatch = rawSection.match(/### Archivos Modificados\s*([\s\S]*?)(?=###|$|---)/);

    const problema = probMatch ? probMatch[1].trim() : 'No especificado.';
    const solucion = solMatch ? solMatch[1].trim() : 'Pendiente de resolución.';
    const archivos = filesMatch ? filesMatch[1].trim() : '';

    bugs.push({
      id: bugId,
      estado,
      fechaDeteccion,
      fechaResolucion,
      problema,
      solucion,
      archivos
    });
  }

  return bugs;
}

function generateDashboardHtml(bugs, sreData) {
  // Generate Bug Cards
  const bugCardsHtml = bugs.map(bug => {
    const statusClass = bug.estado === 'RESUELTO' ? 'status-resolved' : 'status-pending';
    const statusText = bug.estado === 'RESUELTO' ? 'Resuelto' : 'Pendiente';
    
    const formatText = (text) => {
      return text
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    };

    const formattedProblema = formatText(bug.problema);
    const formattedSolucion = formatText(bug.solucion);
    
    let formattedArchivos = '';
    if (bug.archivos) {
      const fileLines = bug.archivos.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);
      formattedArchivos = fileLines.map(f => `<li><code>${f.replace(/`/g, '')}</code></li>`).join('');
    }

    return `
    <div class="bug-card" data-status="${bug.estado}" data-id="${bug.id.toLowerCase()}" data-info="${(bug.problema + ' ' + bug.solucion).toLowerCase()}">
      <div class="bug-header">
        <span class="bug-id">${bug.id}</span>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>
      <div class="bug-meta">
        <div><strong>Detección:</strong> ${bug.fechaDeteccion}</div>
        <div><strong>Resolución:</strong> ${bug.fechaResolucion}</div>
      </div>
      <div class="bug-section">
        <div class="section-title">Problema</div>
        <p>${formattedProblema}</p>
      </div>
      <div class="bug-section">
        <div class="section-title">Solución</div>
        <p>${formattedSolucion}</p>
      </div>
      ${formattedArchivos ? `
      <div class="bug-section">
        <div class="section-title">Archivos Modificados</div>
        <ul class="file-list">${formattedArchivos}</ul>
      </div>
      ` : ''}
    </div>
    `;
  }).join('\n');

  // Generate SRE Progress Checklist Html
  let sreHtml = '';
  let totalTasks = 0;
  let completedTasks = 0;

  if (sreData) {
    sreHtml += `<div class="sre-dashboard">`;
    
    // First, calculate totals
    Object.keys(sreData).forEach(stage => {
      const data = sreData[stage];
      if (data && data.tareas) {
        totalTasks += data.tareas.length;
        completedTasks += data.tareas.filter(t => t.completado).length;
      }
    });

    const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Header progress bar
    sreHtml += `
      <div class="sre-overall-progress">
        <div class="progress-info">
          <h2>Progreso Global SRE</h2>
          <span class="progress-percentage">${overallPercent}% (${completedTasks}/${totalTasks} Checkpoints)</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${overallPercent}%"></div>
        </div>
      </div>
      <div class="sre-stages-grid">
    `;

    // Render each stage
    Object.keys(sreData).forEach(stage => {
      const data = sreData[stage];
      const stageTasks = data.tareas || [];
      const stageCompleted = stageTasks.filter(t => t.completado).length;
      const stagePercent = stageTasks.length > 0 ? Math.round((stageCompleted / stageTasks.length) * 100) : 0;

      sreHtml += `
        <div class="sre-stage-card">
          <div class="stage-header">
            <h3>${stage}</h3>
            <span class="stage-badge">${stagePercent}%</span>
          </div>
          <p class="stage-desc">${data.descripcion}</p>
          <div class="stage-progress-bar-container">
            <div class="stage-progress-bar" style="width: ${stagePercent}%"></div>
          </div>
          <div class="tasks-list">
      `;

      stageTasks.forEach(task => {
        sreHtml += `
            <div class="task-item ${task.completado ? 'task-done' : 'task-pending'}">
              <div class="task-checkbox">${task.completado ? '✓' : '✗'}</div>
              <div class="task-details">
                <span class="task-name">${task.nombre}</span>
                <span class="task-desc">${task.descripcion}</span>
              </div>
            </div>
        `;
      });

      sreHtml += `
          </div>
        </div>
      `;
    });

    sreHtml += `</div></div>`;
  } else {
    sreHtml = `<p>No se encontró información de progreso SRE.</p>`;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LogicaKids - QA & SRE Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0f111a;
      --bg-card: #181b28;
      --bg-input: #222638;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent-cyan: #06b6d4;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --border: #2e354f;
      --resolved: #10b981;
      --pending: #f59e0b;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    /* Header & Navigation */
    header {
      background-color: rgba(24, 27, 40, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      background: linear-gradient(135deg, var(--primary), var(--accent-cyan));
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
    }

    h1 {
      font-size: 1.25rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff, var(--text-muted));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tabs {
      display: flex;
      gap: 8px;
    }

    .tab-button {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-button:hover {
      background-color: rgba(99, 102, 241, 0.1);
      color: var(--text-main);
    }

    .tab-button.active {
      background-color: var(--primary);
      color: #fff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    /* Content Area */
    .content-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .tab-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    /* Playwright Report Tab */
    iframe {
      width: 100%;
      height: 100%;
      border: none;
      background-color: #fff;
    }

    /* Bug History Tab */
    .history-layout {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 24px;
      overflow-y: auto;
    }

    /* Search & Filter Controls */
    .controls-panel {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    .input-group {
      flex: 1;
      min-width: 200px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .input-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .controls-panel input, .controls-panel select {
      background-color: var(--bg-input);
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 10px 14px;
      border-radius: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .controls-panel input:focus, .controls-panel select:focus {
      border-color: var(--primary);
    }

    /* Bug Cards Grid */
    .bug-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      padding-bottom: 40px;
    }

    @media (max-width: 480px) {
      .bug-grid {
        grid-template-columns: 1fr;
      }
    }

    .bug-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .bug-card:hover {
      transform: translateY(-2px);
      border-color: rgba(99, 102, 241, 0.4);
    }

    .bug-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .bug-id {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--accent-cyan);
      background-color: rgba(6, 182, 212, 0.08);
      padding: 4px 8px;
      border-radius: 6px;
    }

    .badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .status-resolved {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--resolved);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .status-pending {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--pending);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .bug-meta {
      display: flex;
      gap: 16px;
      font-size: 0.85rem;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .bug-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .section-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bug-section p {
      font-size: 0.95rem;
      line-height: 1.5;
      color: #d1d5db;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      color: #ec4899;
    }

    .file-list {
      list-style-type: none;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .file-list li code {
      color: #38bdf8;
      display: inline-block;
      max-width: 100%;
      overflow-x: auto;
      white-space: nowrap;
    }

    /* SRE Dashboard Styling */
    .sre-dashboard {
      padding: 24px;
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sre-overall-progress {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .progress-percentage {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--accent-cyan);
    }

    .progress-bar-container {
      background-color: var(--bg-input);
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-bar {
      background: linear-gradient(90deg, var(--primary), var(--accent-cyan));
      height: 100%;
      border-radius: 6px;
      transition: width 0.4s ease;
    }

    .sre-stages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .sre-stage-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .stage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stage-badge {
      background-color: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: bold;
    }

    .stage-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .stage-progress-bar-container {
      background-color: var(--bg-input);
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
    }

    .stage-progress-bar {
      background-color: var(--primary);
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }

    .task-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: background-color 0.2s ease;
    }

    .task-item:hover {
      background-color: rgba(255, 255, 255, 0.02);
    }

    .task-checkbox {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 800;
    }

    .task-done {
      color: var(--text-main);
    }

    .task-done .task-checkbox {
      background-color: rgba(16, 185, 129, 0.15);
      border: 1px solid var(--resolved);
      color: var(--resolved);
    }

    .task-pending {
      color: var(--text-muted);
    }

    .task-pending .task-checkbox {
      background-color: rgba(245, 158, 11, 0.15);
      border: 1px solid var(--pending);
      color: var(--pending);
    }

    .task-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .task-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .task-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <header>
    <div class="logo-container">
      <div class="logo-icon">LK</div>
      <h1>QA Panel & Reports</h1>
    </div>
    <div class="tabs">
      <button class="tab-button active" onclick="switchTab('playwright')">📊 Reporte de Pruebas E2E</button>
      <button class="tab-button" onclick="switchTab('bugs')">🐛 Historial de Bugs</button>
      <button class="tab-button" onclick="switchTab('sre')">🚀 Progreso SRE & Calidad</button>
    </div>
  </header>

  <main class="content-container">
    <!-- Playwright Report -->
    <div id="playwright-tab" class="tab-content active">
      <iframe src="reporte.html"></iframe>
    </div>

    <!-- Bug History -->
    <div id="bugs-tab" class="tab-content">
      <div class="history-layout">
        <div class="controls-panel">
          <div class="input-group" style="flex: 2;">
            <label for="search">Buscador</label>
            <input type="text" id="search" placeholder="Buscar por ID, descripción, archivos, soluciones..." oninput="filterBugs()">
          </div>
          <div class="input-group">
            <label for="status-filter">Estado</label>
            <select id="status-filter" onchange="filterBugs()">
              <option value="ALL">Todos los Estados</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
        </div>

        <div class="bug-grid" id="bug-grid">
          ${bugCardsHtml}
        </div>
      </div>
    </div>

    <!-- SRE Progress Tab -->
    <div id="sre-tab" class="tab-content">
      ${sreHtml}
    </div>
  </main>

  <script>
    function switchTab(tabId) {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      if (tabId === 'playwright') {
        document.querySelector('button[onclick="switchTab(\\'playwright\\')"]').classList.add('active');
        document.getElementById('playwright-tab').classList.add('active');
      } else if (tabId === 'bugs') {
        document.querySelector('button[onclick="switchTab(\\'bugs\\')"]').classList.add('active');
        document.getElementById('bugs-tab').classList.add('active');
      } else {
        document.querySelector('button[onclick="switchTab(\\'sre\\')"]').classList.add('active');
        document.getElementById('sre-tab').classList.add('active');
      }
    }

    function filterBugs() {
      const query = document.getElementById('search').value.toLowerCase();
      const statusFilter = document.getElementById('status-filter').value;
      const cards = document.querySelectorAll('.bug-card');

      cards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');
        const cardId = card.getAttribute('data-id');
        const cardInfo = card.getAttribute('data-info');

        const matchesStatus = statusFilter === 'ALL' || cardStatus === statusFilter;
        const matchesQuery = cardId.includes(query) || cardInfo.includes(query);

        if (matchesStatus && matchesQuery) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
`;
}

function run() {
  console.log('Generating dashboard...');
  
  if (!fs.existsSync(HISTORIAL_BUGS_PATH)) {
    console.error(`Historial file not found at ${HISTORIAL_BUGS_PATH}`);
    return;
  }

  // Ensure resultados dir exists
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  // Rename index.html to reporte.html if it's the original playwright report
  if (fs.existsSync(INDEX_HTML)) {
    const content = fs.readFileSync(INDEX_HTML, 'utf-8');
    if (!content.includes('QA Panel & Reports')) {
      if (fs.existsSync(REPORTE_HTML)) {
        fs.unlinkSync(REPORTE_HTML);
      }
      fs.renameSync(INDEX_HTML, REPORTE_HTML);
      console.log('Renamed original Playwright index.html to reporte.html');
    }
  }

  const mdContent = fs.readFileSync(HISTORIAL_BUGS_PATH, 'utf-8');
  const bugs = parseMarkdownToBugs(mdContent);

  // Read SRE data
  let sreData = null;
  if (fs.existsSync(PROGRESO_SRE_PATH)) {
    try {
      sreData = JSON.parse(fs.readFileSync(PROGRESO_SRE_PATH, 'utf-8'));
    } catch (e) {
      console.error('Error reading progreso_sre.json:', e);
    }
  }

  const dashboardHtml = generateDashboardHtml(bugs, sreData);

  if (sreData) {
    fs.writeFileSync(path.resolve(RESULTS_DIR, 'progreso_sre.json'), JSON.stringify(sreData, null, 2), 'utf-8');
    console.log('Saved public progreso_sre.json in results folder.');
  }

  fs.writeFileSync(INDEX_HTML, dashboardHtml, 'utf-8');
  console.log('Generated index.html dashboard with SRE tab successfully!');
}

run();
