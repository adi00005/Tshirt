import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCpu,
  FiZap,
  FiLayers,
  FiFeather,
  FiPlay,
  FiActivity,
  FiUpload,
  FiType,
  FiDroplet,
  FiChevronRight,
  FiSliders,
  FiShoppingCart,
  FiSave,
  FiRefreshCcw,
  FiSearch,
  FiShield
} from 'react-icons/fi';
import './DesignStudio.css';

const ENGINE_MODES = [
  { id: 'manual', label: 'Manual precision', meta: 'Pixel-perfect control' },
  { id: 'hybrid', label: 'Hybrid co-create', meta: 'AI + human workflows' },
  { id: 'autopilot', label: 'Autopilot', meta: 'Prompt to mockup' }
];

const PRINT_TECH = [
  { id: 'screen', label: 'Screen Print', upcharge: 0 },
  { id: 'embroidery', label: '3D Embroidery', upcharge: 320 },
  { id: 'uv', label: 'UV Foil', upcharge: 460 },
  { id: 'puff', label: 'Puff Ink', upcharge: 280 }
];

const SERVICE_BLOCKS = [
  { title: 'Ops concierge', body: 'Art directors monitor every milestone and prep files for press runs.' },
  { title: 'Secure deliverables', body: 'Exports include layered PSD, vector outlines, and color notes.' },
  { title: 'Fulfilment bridge', body: 'Push approvals into warehouses or on-demand partners instantly.' }
];

const CANVAS_PRESETS = [
  'Front · Classic fit',
  'Back · Classic fit',
  'Front · Oversized',
  'Sleeve · Custom patch'
];

const PALETTE = ['#111111', '#ffffff', '#d6d0ff', '#ffe0cc', '#ffc6c7', '#5f5aff', '#5dd9c1'];
const FONT_STACK = ['Space Grotesk', 'Neue Montreal', 'Playfair Display', 'Futura', 'Maison Neue'];

const MATERIALS = [
  { id: 'organic', label: 'Organic Luxe', detail: '220 GSM combed cotton', accent: '#c4f0d3', eta: '72h' },
  { id: 'tech-knit', label: 'Tech knit', detail: 'Moisture mapped mesh', accent: '#d6d0ff', eta: '96h' },
  { id: 'heavyweight', label: 'Heavyweight', detail: '400 GSM loopback', accent: '#ffd4e5', eta: '120h' }
];

const AI_ASSISTS = [
  { id: 'pattern', title: 'Pattern evolve', copy: 'Iterates geometry and spacing per size set.' },
  { id: 'colorize', title: 'Adaptive colorize', copy: 'Maps palette to Pantone-safe equivalents.' },
  { id: 'stitch', title: 'Stitch density', copy: 'Balances embroidery runs for puff + metallic.' }
];

const INSIGHTS = [
  { label: 'Complexity score', value: '7.2/10', meta: 'Foil + embroidery layering', icon: <FiCpu /> },
  { label: 'AI confidence', value: '82%', meta: 'Prompt coherence', icon: <FiZap /> },
  { label: 'Per piece cost', value: '₹1,939', meta: 'Including finish', icon: <FiDroplet /> }
];

const QA_CHECKLIST = [
  'Bleed + seam allowance locked',
  'Pantone bridges exported',
  'Mock + tech-pack bundled'
];

const TIMELINE = [
  { stage: 'Upload moodboard', time: '09:20', status: 'done' },
  { stage: 'AI sketch pass', time: '09:24', status: 'done' },
  { stage: 'Refine typography', time: '09:32', status: 'active' },
  { stage: 'Prep production files', time: '—', status: 'up next' }
];

const DesignStudio = () => {
  const navigate = useNavigate();
  const [engine, setEngine] = useState('hybrid');
  const [finish, setFinish] = useState('embroidery');
  const [activePreset, setActivePreset] = useState(CANVAS_PRESETS[0]);
  const [accentColor, setAccentColor] = useState(PALETTE[0]);
  const [font, setFont] = useState(FONT_STACK[0]);
  const [prompt, setPrompt] = useState('Minimal skyline outline with layered metallic gradients.');
  const [quantity, setQuantity] = useState(24);
  const [aiIterations, setAiIterations] = useState(2);
  const [material, setMaterial] = useState(MATERIALS[0].id);
  const [aiConfidence, setAiConfidence] = useState(82);
  const [tokens, setTokens] = useState(180);

  const handleSubmitDesign = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const designData = {
        name: `Custom Design - ${new Date().toLocaleDateString()}`,
        description: prompt,
        designData: {
          engine,
          finish,
          preset: activePreset,
          accentColor,
          font,
          quantity,
          aiIterations,
          material,
          aiConfidence,
          tokens,
          total
        },
        thumbnail: '/api/placeholder/300/300', // Placeholder - would be actual canvas image
        isTemplate: false
      };

      const response = await fetch('http://localhost:4999/api/designs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(designData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Design submitted successfully! Admin will review and add it to the store.');
        navigate('/shop');
      } else {
        alert('Failed to submit design. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting design:', error);
      alert('Error submitting design. Please try again.');
    }
  };

  const finishMeta = useMemo(() => PRINT_TECH.find((item) => item.id === finish), [finish]);
  const selectedMaterial = useMemo(() => MATERIALS.find((mat) => mat.id === material), [material]);
  const baseRate = 1499;

  const total = useMemo(() => {
    const upcharge = finishMeta?.upcharge ?? 0;
    const aiFee = aiIterations > 1 ? (aiIterations - 1) * 120 : 0;
    return (baseRate + upcharge + aiFee) * quantity;
  }, [finishMeta, aiIterations, quantity]);

  return (
    <div className="studio-shell">
      <section className="studio-hero">
        <div className="hero-copy">
          <p className="eyebrow">Minimal tech · Luxe fashion</p>
          <h1>Design studio for runway-grade tees</h1>
          <p>
            Hybrid tooling, AI-assisted ideation, and production-ready exports inside a single
            workspace. Go from napkin sketch to fulfilment in record time.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={handleSubmitDesign}>
              Submit Design <FiChevronRight />
            </button>
            <button className="ghost">
              <FiPlay /> View 90-second tour
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div>
            <span>Avg. turnaround</span>
            <strong>48 hrs priority</strong>
          </div>
          <div>
            <span>Realtime collab</span>
            <strong>Art director slots</strong>
          </div>
          <div>
            <span>Deliverables</span>
            <strong>Mock + print files</strong>
          </div>
        </div>
      </section>

      <section className="engine-panel">
        <header>
          <div>
            <p className="eyebrow">Workflow engines</p>
            <h2>Select creation mode</h2>
          </div>
          <button className="ghost">
            Automation settings <FiSliders />
          </button>
        </header>
        <div className="engine-grid">
          {ENGINE_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`engine-card ${engine === mode.id ? 'active' : ''}`}
              onClick={() => setEngine(mode.id)}
            >
              <div className="tag">{mode.id}</div>
              <h3>{mode.label}</h3>
              <p>{mode.meta}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="service-panel">
        {SERVICE_BLOCKS.map((block) => (
          <article key={block.title}>
            <FiShield />
            <div>
              <h3>{block.title}</h3>
              <p>{block.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="studio-workspace">
        <div className="workspace-left">
          <div className="panel">
            <p className="eyebrow">Canvas presets</p>
            <div className="preset-list">
              {CANVAS_PRESETS.map((preset) => (
                <button
                  key={preset}
                  className={`preset ${activePreset === preset ? 'active' : ''}`}
                  onClick={() => setActivePreset(preset)}
                >
                  <FiLayers /> {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">AI Prompt</p>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <div className="prompt-actions">
              <button className="ghost">
                <FiRefreshCcw /> Remix
              </button>
              <button className="ghost">
                <FiSearch /> Inspiration
              </button>
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Palette & type</p>
            <div className="swatches">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  style={{ backgroundColor: color }}
                  className={`swatch ${accentColor === color ? 'active' : ''}`}
                  onClick={() => setAccentColor(color)}
                  aria-label={`select ${color}`}
                />
              ))}
            </div>
            <div className="field">
              <label>
                <FiType /> Typography
              </label>
              <select value={font} onChange={(e) => setFont(e.target.value)}>
                {FONT_STACK.map((stack) => (
                  <option key={stack} value={stack}>
                    {stack}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Base fabric</p>
            <div className="material-card">
              {MATERIALS.map((mat) => (
                <button
                  key={mat.id}
                  className={`material-pill ${material === mat.id ? 'active' : ''}`}
                  style={{ borderColor: mat.accent }}
                  onClick={() => setMaterial(mat.id)}
                >
                  <span className="dot" style={{ background: mat.accent }} />
                  <div>
                    <strong>{mat.label}</strong>
                    <small>{mat.detail}</small>
                  </div>
                  <span className="eta">ETD {mat.eta}</span>
                </button>
              ))}
            </div>
            <div className="field stacked">
              <label>
                AI confidence <span>{aiConfidence}%</span>
              </label>
              <input
                type="range"
                min="60"
                max="100"
                value={aiConfidence}
                onChange={(e) => setAiConfidence(Number(e.target.value))}
              />
            </div>
            <div className="token-meter">
              <label>Tokens budget</label>
              <div className="token-bar">
                <div style={{ width: `${Math.min(tokens / 200 * 100, 100)}%` }} />
              </div>
              <div className="token-meta">
                <span>{tokens} / 200</span>
                <button onClick={() => setTokens((prev) => Math.min(prev + 20, 220))}>Top up</button>
              </div>
            </div>
          </div>

          <div className="panel ai-lab">
            <p className="eyebrow">AI lab assists</p>
            <div className="assist-grid">
              {AI_ASSISTS.map((assist) => (
                <article key={assist.id}>
                  <h4>{assist.title}</h4>
                  <p>{assist.copy}</p>
                  <button className="ghost">Run pass</button>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">Special finish</p>
            <div className="finish-grid">
              {PRINT_TECH.map((tech) => (
                <button
                  key={tech.id}
                  className={`finish-card ${finish === tech.id ? 'active' : ''}`}
                  onClick={() => setFinish(tech.id)}
                >
                  <div className="tag">+₹{tech.upcharge}</div>
                  <h3>{tech.label}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="workspace-right">
          <div className="viewport" style={{ borderColor: accentColor }}>
            <div className="viewport-header">
              <button className="ghost">
                <FiUpload /> Upload sketch
              </button>
              <button className="ghost">
                <FiFeather /> Stylus mode
              </button>
            </div>
            <div className="viewport-mock" style={{ color: accentColor, fontFamily: font }}>
              <span>STUDIO</span>
              <small>Hybrid creative pipeline</small>
            </div>
          </div>

          <div className="insight-grid">
            {INSIGHTS.map((insight) => (
              <article key={insight.label}>
                <div className="icon">{insight.icon}</div>
                <div>
                  <p>{insight.label}</p>
                  <strong>{insight.value}</strong>
                  <small>{insight.meta}</small>
                </div>
              </article>
            ))}
          </div>

          <div className="panel summary">
            <div>
              <p className="eyebrow">Estimate</p>
              <h2>₹{total.toLocaleString('en-IN')}</h2>
              <p className="muted">Includes finish & AI passes x{aiIterations}</p>
            </div>
            <div className="summary-grid">
              <label>
                Volume
                <div className="stepper">
                  <button onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
                </div>
              </label>
              <label>
                AI passes
                <div className="stepper">
                  <button onClick={() => setAiIterations((prev) => Math.max(1, prev - 1))}>-</button>
                  <span>{aiIterations}</span>
                  <button onClick={() => setAiIterations((prev) => prev + 1)}>+</button>
                </div>
              </label>
            </div>
            <div className="summary-actions">
              <button className="primary">
                <FiShoppingCart /> Push to production
              </button>
              <button className="ghost">
                <FiSave /> Save session
              </button>
            </div>
          </div>

          <div className="panel spec-sheet">
            <header>
              <div>
                <p className="eyebrow">Spec sheet</p>
                <strong>{selectedMaterial?.label}</strong>
                <small>{selectedMaterial?.detail}</small>
              </div>
              <span className="badge">AI ready {aiConfidence}%</span>
            </header>
            <ul>
              {QA_CHECKLIST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="panel timeline">
            <p className="eyebrow">Ops timeline</p>
            <ul>
              {TIMELINE.map((item) => (
                <li key={item.stage} className={item.status}>
                  <div>
                    <strong>{item.stage}</strong>
                    <span>{item.time}</span>
                  </div>
                  <FiActivity />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignStudio;
