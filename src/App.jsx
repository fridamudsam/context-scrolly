import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Users, Compass, Eye, Layers3, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend, ReferenceLine,
} from "recharts";
import "./App.css";



// ─── Story sections ───────────────────────────────────────────
const sections = [
  {
    id: "intro", step: "01", kicker: "The question",
    title: "Can the same visualization be recieved differently depending on where its encountered?",
    body: "The same choropleth map was shown to 630 participants across three subreddit contexts (r/Democrats, r/Republicans, and r/Maps) with only the surrounding community cues and title changed.",
    viz: "overview",
  },
  {
    id: "design", step: "02", kicker: "Key concept",
    title: "How aligned are you with the community around you?",
    body: ["When you encounter a visualization on social media, you're viewing it within the context where it was encountered. ", <strong key="b">This study examines how the ideological distance between a viewer and the context of a visualization changes how it is percieved and trusted. </strong>, " Alignment is measured as the gap between the participant's own ideology and their perception of the subreddit's ideology, both rated on a 0–100 scale."],
    viz: "design",
  },
  {
    id: "finding1", step: "03", kicker: "Finding 1",
    title: "Credibility falls as ideological distance grows for the poltical topic",
    body: "For the political topic, all six credibility measures (trustworthiness, accuracy, fairness, completeness, bias, and creator intent) declined as viewers felt farther from the surrounding community. The effect was strongest at full misalignment, but largely absent for the non-political topic.",
    viz: "credibility",
  },
  {
    id: "finding2", step: "04", kicker: "Finding 2",
    title: "Misalignment can actually increase support",
    body: "Despite rating the chart as less credible, misaligned viewers of the political topic were the most likely to say their support for it increased after viewing. 27% of misaligned viewers reported much stronger support, compared to 17% of aligned viewers.",
    viz: "support",
  },
  {
    id: "finding3", step: "05", kicker: "Finding 3",
    title: "Political topics prompt deeper interpretation",
    body: "Political topic viewers were far more likely to produce contextual, domain-specific takeaways (L4) and situating the chart in broader social or political meaning. Non-political viewers gave more perceptual or statistical summaries.",
    viz: "takeaways",
  },
  {
    id: "finding4", step: "06", kicker: "Finding 4",
    title: "Misalignment increases recall of the context for the non-political topic",
    body: "For the non-political topic, misaligned viewers recalled the subreddit at a 43% rate, almost 14 points higher than aligned viewers. For the political topic, recall was generally flat across all groups, suggesting attention may have been directed inward toward the data.",
    viz: "recall",
  },
  {
    id: "finding5", step: "07", kicker: "Finding 5",
    title: "Layers of context",
    body: "About a third of participants explicitly reflected on context when judging credibility. Some pointed to the subreddit, others to Reddit as a platform, and a select few to the research study. Yet despite all this, perceived bias in the chart itself was the measure least affected by alignment.",
    viz: "objectivity",
  },
  {
    id: "implications", step: "08", kicker: "Why it matters",
    title: "Where a chart lives is part of what it communicates.",
    body: ["Data has often been seen as a neutral or objective conveyer of information and that a well designed visualization can speak for itself. This study suggests otherwise. ", <strong key="b">The same visualization, unchanged, can be trusted or doubted, and internalized or dismissed, depending entirely on the community around it.</strong>, "In digital spaces, visualizations circulate freely across ideologically charged spaces, raising a challenge for how we communicate with data."],
    viz: "implications",
  },
];

// ─── Data ─────────────────────────────────────────────────────
const supportData = [
  { group: "Aligned",          political: 17, nonPolitical: 15 },
  { group: "Somewhat aligned", political: 13, nonPolitical: 8  },
  { group: "Misaligned",       political: 27, nonPolitical: 13 },
];

const recallData = [
  { group: "Aligned",          political: 30, nonPolitical: 30 },
  { group: "Somewhat aligned", political: 30, nonPolitical: 22 },
  { group: "Misaligned",       political: 34, nonPolitical: 43 },
];

const takeawayData = [
  { level: "L4 Contextual",  political: 51, nonPolitical: 31 },
  { level: "L3 Perceptual",  political: 15, nonPolitical: 31 },
  { level: "L2 Statistical", political: 34, nonPolitical: 31 },
  { level: "L1 Elemental",   political:  5, nonPolitical:  5 },
];

const levelDefs = {
  "L4 Contextual":  "Draws on prior knowledge, social and political context, or domain expertise.",
  "L3 Perceptual":  "Captures complex trends, pattern synthesis, and perceptual phenomena.",
  "L2 Statistical": "Captures descriptive statistics, extrema, and point-wise comparisons.",
  "L1 Elemental":   "References basic chart properties such as titles, axes, and visual encodings.",
};

const credMetrics = [
  { label: "Trustworthy",   aligned: 72, somewhat: 63, mis: 48 },
  { label: "Accurate",      aligned: 70, somewhat: 62, mis: 51 },
  { label: "Fair",          aligned: 68, somewhat: 61, mis: 54 },
  { label: "Unbiased",      aligned: 60, somewhat: 58, mis: 55 },
  { label: "Whole story",   aligned: 66, somewhat: 55, mis: 38 },
  { label: "Creator intent",aligned: 69, somewhat: 61, mis: 50 },
];

// ─── Shared chart colors ──────────────────────────────────────
const C_POL  = "#6c4fc4";
const C_NPOL = "#bbb";

// ─── Tooltip ─────────────────────────────────────────────────
function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-box">
      <div className="tooltip-label">{label}</div>
      {payload.map(item => (
        <div key={item.dataKey} className="tooltip-item" style={{ color: item.color }}>
          {item.name}: {item.value}%
        </div>
      ))}
    </div>
  );
}

// ─── Section nav ─────────────────────────────────────────────
function SectionNav({ activeId }) {
  return (
    <nav className="section-nav" aria-label="Sections">
      {sections.map(s => (
        <a key={s.id} href={`#${s.id}`}
          className={`nav-dot${activeId === s.id ? " active" : ""}`}
          aria-label={s.title}
        />
      ))}
    </nav>
  );
}

// ─── Active section hook ──────────────────────────────────────
function useActiveSection() {
  const [activeId, setActiveId] = useState(sections[0].id);
  React.useEffect(() => {
    const obs = sections.map(s => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const o = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(s.id); },
        { rootMargin: "-35% 0px -45% 0px", threshold: 0.1 }
      );
      o.observe(el);
      return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, []);
  return activeId;
}

// ─── Hero ─────────────────────────────────────────────────────
function Hero() {
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-eyebrow">Research · Data Visualization</div>
        <h1>Context Matters: How Online Communities Shape Trust in Data Visualizations</h1>
        <p className="hero-deck">
          A controlled experiment on how social context shapes visualization credibility.
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <div className="meta-label">Participants</div>
            <div className="meta-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              630
              <svg width="64" height="28" viewBox="0 0 64 28" style={{ marginBottom: 2 }}>
                {[0,1,2].map(i => (
                  <g key={i} transform={`translate(${i * 10}, 0)`}>
                    <circle cx="4" cy="5" r="3" fill="#3b6fd4" />
                    <line x1="4" y1="8" x2="4" y2="19" stroke="#3b6fd4" strokeWidth="2" strokeLinecap="round" />
                    <line x1="4" y1="11" x2="0" y2="16" stroke="#3b6fd4" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="4" y1="11" x2="8" y2="16" stroke="#3b6fd4" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="4" y1="19" x2="1" y2="27" stroke="#3b6fd4" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="4" y1="19" x2="7" y2="27" stroke="#3b6fd4" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                ))}
                {[0,1,2].map(i => (
                  <g key={i} transform={`translate(${34 + i * 10}, 0)`}>
                    <circle cx="4" cy="5" r="3" fill="#d43b3b" />
                    <line x1="4" y1="8" x2="4" y2="19" stroke="#d43b3b" strokeWidth="2" strokeLinecap="round" />
                    <line x1="4" y1="11" x2="0" y2="16" stroke="#d43b3b" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="4" y1="11" x2="8" y2="16" stroke="#d43b3b" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="4" y1="19" x2="1" y2="27" stroke="#d43b3b" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="4" y1="19" x2="7" y2="27" stroke="#d43b3b" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                ))}
              </svg>
            </div>
            <div className="meta-sub">315 Democrats · 315 Republicans</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Design</div>
            <div className="meta-value">2 × 3</div>
            <div className="meta-sub">Topic × community</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Contexts</div>
            <div className="meta-value">3</div>
            <div className="meta-sub">r/Democrats · r/Republicans · r/Maps</div>
          </div>
        </div>
        <div className="hero-stimuli">
          {[
            { src: "/dempolitical.png",       label: "r/Democrats"   },
            { src: "/mapspolitical.png",       label: "r/Maps"        },
            { src: "/republicanpolitical.png", label: "r/Republicans" },
          ].map(({ src, label }) => (
            <div key={label} className="stimuli-item">
              <img src={src} alt={`Stimulus shown in ${label}`} className="stimuli-img" />
              <span className="stimuli-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

// ─── Story card ───────────────────────────────────────────────
function StoryCard({ section, active }) {
  return (
    <motion.section
      id={section.id}
      animate={{ opacity: active ? 1 : 0.45 }}
      transition={{ duration: 0.35 }}
      className="story-section"
    >
      <div className="story-inner">
        <div className="story-kicker">{section.step} · {section.kicker}</div>
        <h2>{section.title}</h2>
        <p>{section.body}</p>
      </div>
    </motion.section>
  );
}

// ─── Panel header ─────────────────────────────────────────────
function PanelHeader({ icon: Icon, eyebrow, title, subtitle }) {
  return (
    <div className="panel-header">
      <div className="panel-icon"><Icon size={16} /></div>
      <div className="panel-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

// ─── Viz panels ───────────────────────────────────────────────
function OverviewPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 20 }}>
      <PanelHeader icon={BarChart3} eyebrow="Overview"
        title="Visualizations are rarely encountered in isolation."
        subtitle="This experiment held the chart constant and varied only the social framing and title, making context visible as a factor in how people judge data visualizations." />

      {/* Row 1: map + two titles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="soft-box" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="soft-title">Same map</div>
          <p className="soft-text" style={{ margin: 0 }}>Identical synthetic choropleth across all 6 conditions.</p>
          <img src="/choropleth.png" alt="The choropleth map used in the study"
            style={{ width: "100%", borderRadius: 3, border: "1px solid #e2e0db", marginTop: "auto" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="soft-box" style={{ flex: 1 }}>
            <div className="soft-title" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", marginBottom: 8 }}>Political topic</div>
            <p className="soft-text" style={{ margin: 0, fontSize: "0.95rem", color: "#1a1a1a", fontFamily: "Georgia, serif", lineHeight: 1.5 }}>
              "Percent of colleges dropping DEI training for staff and students in 2025"
            </p>
          </div>
          <div className="soft-box" style={{ flex: 1 }}>
            <div className="soft-title" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", marginBottom: 8 }}>Non-political topic</div>
            <p className="soft-text" style={{ margin: 0, fontSize: "0.95rem", color: "#1a1a1a", fontFamily: "Georgia, serif", lineHeight: 1.5 }}>
              "Percent of high school students playing a varsity sport in 2025"
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: three communities */}
      <div className="soft-box" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <img src="/reddit.png" alt="Reddit" style={{ width: 22, height: 22 }} />
          <div className="soft-title" style={{ margin: 0 }}>Three communities</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { name: "r/Democrats",   color: "#3b6fd4" },
            { name: "r/Maps",        color: "#888"    },
            { name: "r/Republicans", color: "#d43b3b" },
          ].map(({ name, color }) => (
            <div key={name} className="soft-box" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#fff", borderLeft: `3px solid ${color}` }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a" }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesignPanel() {
  const groups = [
    { label: "Very aligned",     range: "0–13 pts",  color: "#aaa", n: 342 },
    { label: "Somewhat aligned", range: "14–27 pts", color: "#888", n: 65  },
    { label: "Misaligned",       range: "28+ pts",   color: "#444", n: 224 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 24 }}>
      <PanelHeader icon={Users} eyebrow="Study design"
        title="How aligned are you with the community?"
        subtitle="Ideological distance = |your ideology − your perception of the subreddit's ideology|, both rated on a 0–100 liberal-to-conservative scale." />

      {/* Two scales */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 8px" }}>
        {[
          {
            label: "Your ideology",
            icon: (
              <svg width="18" height="22" viewBox="0 0 18 22">
                <circle cx="9" cy="4" r="3.5" fill="#555" />
                <line x1="9" y1="7.5" x2="9" y2="16" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                <line x1="9" y1="10" x2="4" y2="14" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="9" y1="10" x2="14" y2="14" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="9" y1="16" x2="5" y2="22" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="9" y1="16" x2="13" y2="22" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            label: "Community ideology",
            icon: <img src="/reddit.png" alt="Reddit" style={{ width: 18, height: 18 }} />,
          },
        ].map(({ label, icon }) => (
          <div key={label}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              {icon}
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 700, color: "#555", letterSpacing: "0.06em" }}>{label}</span>
            </div>
            <div style={{ position: "relative", height: 8, borderRadius: 99, background: "linear-gradient(to right, #c8d8f5, #e9e7e2, #f5c8c8)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", color: "#999" }}>0 · Liberal</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", color: "#999" }}>100 · Conservative</span>
            </div>
          </div>
        ))}

        {/* Distance arrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "#f7f5f1", borderRadius: 4, borderLeft: "3px solid #ccc" }}>
          <svg width="32" height="16" viewBox="0 0 32 16">
            <line x1="2" y1="8" x2="30" y2="8" stroke="#888" strokeWidth="1.5" />
            <polyline points="6,4 2,8 6,12" fill="none" stroke="#888" strokeWidth="1.5" strokeLinejoin="round" />
            <polyline points="26,4 30,8 26,12" fill="none" stroke="#888" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "#555", lineHeight: 1.5 }}>
            <strong style={{ color: "#1a1a1a" }}>Ideological distance</strong> = the absolute gap between these two ratings
          </span>
        </div>
      </div>

      {/* Group cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, flex: 1 }}>
        {groups.map(({ label, range, color, n, from, to }) => (
          <div key={label} className="soft-box" style={{ borderLeft: `3px solid ${color}`, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color }}>{label}</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{range}</div>
            <p className="soft-text" style={{ margin: 0 }}>apart on the ideology scale</p>
            <div style={{ marginTop: "auto", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#aaa" }}>n = {n} participants</div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#aaa", lineHeight: 1.6 }}>
        Cutpoints anchored to the ANES 7-point ideology scale — each category spans ~14 points on the 0–100 slider.
      </p>
    </div>
  );
}

function CredibilityPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="panel-header" style={{ marginBottom: 12, paddingBottom: 12 }}>
        <div className="panel-icon"><Compass size={16} /></div>
        <div className="panel-eyebrow">Finding 1</div>
        <h3>Credibility falls as distance grows</h3>
      </div>
      <img src="/finding1.png" alt="Credibility ratings across alignment conditions"
        style={{ width: "100%", borderRadius: 4, border: "1px solid #e2e0db" }} />
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <p style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "#888", lineHeight: 1.6 }}>
          Mean credibility ratings with 95% confidence intervals, political topic only. Each row shows one alignment group; dots further left indicate lower credibility.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
          {[
            ["66% lower odds", "of rating the chart as telling the whole story — the most sensitive measure"],
            ["57% lower odds", "of rating the chart as trustworthy at full misalignment"],
          ].map(([stat, desc]) => (
            <div key={stat} className="soft-box" style={{ padding: "12px 14px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{stat}</div>
              <p className="soft-text" style={{ margin: 0, fontSize: "0.78rem" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader icon={BarChart3} eyebrow="Finding 2"
        title="Support rises most in misaligned political contexts"
        subtitle='% of viewers reporting "much more" support after viewing, by alignment and topic.' />
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={supportData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="group" tickLine={false} axisLine={false}
              tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#888" }} />
            <YAxis unit="%" tickLine={false} axisLine={false} domain={[0, 32]}
              tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#888" }} />
            <Tooltip content={<TooltipBox />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter, sans-serif" }} />
            <Line type="monotone" dataKey="political" name="Political" stroke={C_POL}
              strokeWidth={2.5} dot={{ r: 4, fill: C_POL }} />
            <Line type="monotone" dataKey="nonPolitical" name="Non-political" stroke={C_NPOL}
              strokeWidth={2} strokeDasharray="4 3" dot={{ r: 4, fill: C_NPOL }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TakeawayPanel() {
  const [activeLevel, setActiveLevel] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader icon={Layers3} eyebrow="Finding 3"
        title="Political topics prompt deeper interpretation"
        subtitle="Takeaway level by topic. Hover a level label below to see its definition." />

      {/* Hover-able level legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {Object.entries(levelDefs).map(([lvl, def]) => (
          <div key={lvl}
            onMouseEnter={() => setActiveLevel(lvl)}
            onMouseLeave={() => setActiveLevel(null)}
            style={{
              fontFamily: "Inter, sans-serif", fontSize: "0.75rem", fontWeight: 600,
              padding: "4px 10px", borderRadius: 99, cursor: "help",
              background: activeLevel === lvl ? "#1a1a1a" : "#f0ede8",
              color: activeLevel === lvl ? "#fff" : "#555",
              transition: "all 0.15s ease",
            }}>
            {lvl.split(" ")[0]}
          </div>
        ))}
      </div>

      {/* Definition box */}
      <div style={{
        minHeight: 44, marginBottom: 8, padding: "10px 14px",
        background: "#f7f5f1", borderRadius: 4,
        borderLeft: `3px solid ${activeLevel ? "#1a1a1a" : "#e2e0db"}`,
        fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: activeLevel ? "#333" : "#bbb",
        lineHeight: 1.6, transition: "color 0.15s ease, border-color 0.15s ease",
      }}>
        {activeLevel ? <><strong>{activeLevel}:</strong> {levelDefs[activeLevel]}</> : "Hover a level to see its definition"}
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={takeawayData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
            <XAxis type="number" unit="%" tickLine={false} axisLine={false}
              tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#888" }} />
            <YAxis dataKey="level" type="category" tickLine={false} axisLine={false}
              width={90} tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#666" }} />
            <Tooltip content={<TooltipBox />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter, sans-serif" }} />
            <Bar dataKey="political" name="Political" fill={C_POL} radius={[0, 3, 3, 0]} />
            <Bar dataKey="nonPolitical" name="Non-political" fill={C_NPOL} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecallPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader icon={Eye} eyebrow="Finding 4"
        title="Recall changes differently by topic type"
        subtitle="% who correctly recalled the subreddit they saw. Misalignment boosts recall — but only for the non-political topic." />
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={recallData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="group" tickLine={false} axisLine={false}
              tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#888" }} />
            <YAxis unit="%" tickLine={false} axisLine={false} domain={[0, 52]}
              tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#888" }} />
            <Tooltip content={<TooltipBox />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter, sans-serif" }} />
            <ReferenceLine y={30} strokeDasharray="4 3" stroke="#ccc"
              label={{ value: "Baseline", fontSize: 10, fill: "#bbb", fontFamily: "Inter, sans-serif" }} />
            <Line type="monotone" dataKey="political" name="Political" stroke={C_POL}
              strokeWidth={2.5} dot={{ r: 4, fill: C_POL }} />
            <Line type="monotone" dataKey="nonPolitical" name="Non-political" stroke={C_NPOL}
              strokeWidth={2} strokeDasharray="4 3" dot={{ r: 4, fill: C_NPOL }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ObjectivityPanel() {
  const layers = [
    {
      label: "The subreddit",
      example: "The only thing influencing my responses was this chart being shared under the Democrats subreddit on Reddit. They are biased and they lie.",
      note: "Most participants noticed the community — and let it color their judgment.",
    },
    {
      label: "The platform",
      example: "The map seems like it would be accurate but it is posted on what seems like Reddit so I am always cautious about anything I see from there.",
      note: "Some questioned Reddit itself as a source, but still separated the chart from the context.",
    },
    {
      label: "The researcher",
      example: "I think for the fact that this chart was presented by a researcher would make me believe that the chart is accurate.",
      note: "A few participants trusted the chart more because it felt like it came from a study.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16 }}>
      <div className="panel-header" style={{ marginBottom: 0, paddingBottom: 12 }}>
        <div className="panel-icon"><CheckCircle2 size={16} /></div>
        <div className="panel-eyebrow">Finding 5</div>
        <h3>Context operates in nested layers</h3>
        <p style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "0.88rem", color: "#777", lineHeight: 1.6 }}>
          About a third of participants reflected on the community context around the chart. But <em>which</em> layer of context they noticed varied — and so did its effect on trust.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {layers.map(({ label, example, note }) => (
          <div key={label} className="soft-box" style={{ borderLeft: "3px solid #ccc", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a1a1a" }}>{label}</div>
            <blockquote style={{ margin: 0, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "0.88rem", color: "#444", lineHeight: 1.65, borderLeft: "none", padding: 0 }}>
              "{example}"
            </blockquote>
            <p style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#888", lineHeight: 1.5 }}>{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImplicationsPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16 }}>
      <div className="panel-header" style={{ marginBottom: 0, paddingBottom: 12 }}>
        <div className="panel-icon"><Layers3 size={16} /></div>
        <div className="panel-eyebrow">Why it matters</div>
        <h3>Context is not neutral.</h3>
      </div>

      {/* Diagram: one chart → three communities → different reactions */}
      <div style={{ background: "#f7f5f1", borderRadius: 4, padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", alignItems: "center", gap: 4 }}>
          {/* Chart box */}
          <div style={{ background: "#fff", border: "1px solid #e2e0db", borderRadius: 4, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Same chart</div>
            <div style={{ fontSize: "1.4rem" }}>📊</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", fontStyle: "italic", color: "#666", marginTop: 4 }}>DEI topic</div>
          </div>
          {/* Arrow */}
          <svg viewBox="0 0 32 24" style={{ width: 32 }}>
            <line x1="2" y1="12" x2="26" y2="12" stroke="#ccc" strokeWidth="1.5"/>
            <polyline points="20,7 26,12 20,17" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          {/* Three community reactions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { sub: "r/Democrats", reaction: "Trusted", emoji: "✓", align: "aligned" },
              { sub: "r/Maps", reaction: "Neutral", emoji: "–", align: "neutral" },
              { sub: "r/Republicans", reaction: "Doubted", emoji: "✗", align: "misaligned" },
            ].map(({ sub, reaction, emoji, align }) => (
              <div key={sub} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1px solid #e2e0db", borderRadius: 3, padding: "6px 10px" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#555" }}>{sub}</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: align === "aligned" ? "#4a8c4a" : align === "misaligned" ? "#b04a4a" : "#888", fontWeight: 700 }}>{emoji} {reaction}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {[
          {
            who: "For designers",
            insight: "Where a chart is shared may matter as much as how it is designed.",
            detail: " The same visualization can earn very different credibility judgments depending on community context.",
          },
          {
            who: "For platforms",
            insight: "Distribution can be an editorial act.",
            detail: "Visualizations spreading across ideologically diverse spaces may undermine their informational value for the audiences who could most benefit from new perspectives.",
          },
          {
            who: "For researchers",
            insight: "This study is a lower bound.",
            detail: "real environments with comments, reactions, and vote counts likely amplify these effects substantially.",
          },
        ].map(({ who, insight, detail }) => (
          <div key={who} className="soft-box" style={{ borderLeft: "3px solid #1a1a1a", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>{who}</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>{insight}</div>
            <p style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#666", lineHeight: 1.6 }}>{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VizPanel({ viz }) {
  const panels = {
    overview: <OverviewPanel />, design: <DesignPanel />,
    credibility: <CredibilityPanel />, support: <SupportPanel />,
    takeaways: <TakeawayPanel />, recall: <RecallPanel />,
    objectivity: <ObjectivityPanel />, implications: <ImplicationsPanel />,
  };
  return panels[viz] ?? <OverviewPanel />;
}

// ─── Sticky viz ───────────────────────────────────────────────
function StickyViz({ activeId }) {
  const activeSection = useMemo(
    () => sections.find(s => s.id === activeId) ?? sections[0],
    [activeId]
  );
  return (
    <div className="sticky-viz-shell">
      <AnimatePresence mode="wait">
        <motion.div key={activeSection.viz}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="sticky-viz-card"
        >
          <VizPanel viz={activeSection.viz} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const activeId = useActiveSection();
  return (
    <main className="app-shell">
      <Hero />
      <SectionNav activeId={activeId} />
      <div className="main-grid">
        <div className="story-column">
          {sections.map(s => (
            <StoryCard key={s.id} section={s} active={activeId === s.id} />
          ))}
        </div>
        <div className="viz-column">
          <StickyViz activeId={activeId} />
        </div>
      </div>
    </main>
  );
}
