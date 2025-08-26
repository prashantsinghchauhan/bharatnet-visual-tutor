'use client';
// BharatNetVisualTutor.tsx
import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Server,
  Home,
  Cable,
  Map,
  Route as RouteIcon,
  Boxes,
  Info,
  Search,
  Layers,
} from "lucide-react";

// ===========================
// Types
// ===========================
type NodeType = {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  ratio?: string;
};

type TermType = typeof TERMS[number];

type SelectedInfo =
  | { node: NodeType; term?: TermType }
  | { term: TermType }
  | null;

// ===========================
// Static Data (TERMS, NODES, EDGES, LAYERS)
// ===========================
const TERMS = [
  {
    key: "PON",
    display: "PON",
    readAs: "Pee‑O‑En (Passive Optical Network)",
    full: "Passive Optical Network",
    simple:
      "Bijli ke bina chalne wala fiber system: OLT → Splitters → ONT (beech me koi powered device nahi).",
    function:
      "Low OPEX distribution; passive splitters se ek line ko kai users tak baantte hain.",
    example:
      "Ek bada tank (OLT) se pani nikalta hai, raste me sirf T‑junctions (Splitters) hain, fir har ghar (ONT) tak.",
  },
  {
    key: "OLT",
    display: "OLT",
    readAs: "Oh‑El‑Tee (Optical Line Terminal)",
    full: "Optical Line Terminal",
    simple: "Head‑office / bada tank jahan se poori fiber nikalti hai.",
    function:
      "Har OLT port se ek feeder fiber nikal kar pehle splitter (F1S) tak jata hai.",
    example:
      "‘THUNAG OLT’ se Port‑01 → Feeder fiber → Splitter F1Sa (1:4).",
  },
  {
    key: "ONT",
    display: "ONT",
    readAs: "Oh‑En‑Tee (Optical Network Terminal)",
    full: "Optical Network Terminal",
    simple: "Ghar/GP ka nal: yahin se service use hoti hai.",
    function:
      "Last point jahan fiber terminate hoti; yahin modem/Router connect hote.",
    example: "‘THACHI GP’ building par ONT lagta hai; drop fiber F2S se aati.",
  },
  {
    key: "SPLITTER",
    display: "Splitter (F1S/F2S/F3S)",
    readAs: "F1S: ‘F one S’; F2S: ‘F two S’; F3S: ‘F three S’",
    full: "Passive Optical Splitter",
    simple: "T‑junction jo 1 fiber ko kai fibers me baantta (power nahi lagti).",
    function:
      "Stage wise baantna: F1S (first), F2S (second), F3S (third). Ratios: 1:2, 1:4, 1:8, 1:16…",
    example:
      "F1Sa (1:4) ka matlab: 1 input → 4 outputs. F2Sb (1:2): 1 input → 2 outputs.",
  },
];

const NODES: NodeType[] = [
  { id: "OLT1", type: "OLT", label: "THUNAG OLT", x: 60, y: 60 },
  { id: "F1Sa", type: "SPLITTER", label: "F1Sa", ratio: "1:4", x: 260, y: 60 },
  { id: "JB19", type: "JB", label: "JB‑19 (BJC)", x: 460, y: 60 },
  { id: "F2Sb", type: "SPLITTER", label: "F2Sb", ratio: "1:2", x: 660, y: 60 },
  { id: "ONT1", type: "ONT", label: "THACHI GP — ONT", x: 860, y: 30 },
  { id: "ONT2", type: "ONT", label: "DEVdhar GP — ONT", x: 860, y: 100 },
];

const EDGES = [
  { from: "OLT1", to: "F1Sa", label: "4F / 6.18KM (Feeder)" },
  { from: "F1Sa", to: "JB19", label: "4F / 1.50KM (Distribution)" },
  { from: "JB19", to: "F2Sb", label: "2F / 1.10KM (Distribution)" },
  { from: "F2Sb", to: "ONT1", label: "1F / 0.24KM (Drop)" },
  { from: "F2Sb", to: "ONT2", label: "1F / 0.30KM (Drop)" },
];

const LAYERS = [
  { id: "OFC", label: "OFC Segments (labels)", defaultOn: true },
  { id: "SPLITTER", label: "Splitters (F1S/F2S)", defaultOn: true },
  { id: "JB", label: "Joint Boxes (JB)", defaultOn: true },
  { id: "ONT", label: "ONTs (GP endpoints)", defaultOn: true },
  { id: "ANNOT", label: "Helper annotations", defaultOn: true },
];

// ===========================
// Helper Functions
// ===========================

const nodeIcon = (type: string) => {
  switch (type) {
    case "OLT":
      return <Server className="w-5 h-5" />;
    case "SPLITTER":
      return <GitBranch className="w-5 h-5" />;
    case "JB":
      return <Boxes className="w-5 h-5" />;
    case "ONT":
      return <Home className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

export default function BharatNetVisualTutor() {
  const [selected, setSelected] = useState<SelectedInfo>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, l.defaultOn]))
  );

  const TERMS_MAP = useMemo(() => {
    return Object.fromEntries(TERMS.map((t) => [t.key, t]));
  }, []);

  const termByType = (type: string): TermType | undefined => TERMS_MAP[type];

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter((t) =>
      [t.display, t.full, t.simple, t.function, t.example, t.readAs]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur px-4 py-2 flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Layers className="w-4 h-4" /> <span className="font-semibold">Layers:</span>
        </div>
        {LAYERS.map((l) => (
          <label key={l.id} className="flex items-center gap-2 text-sm mr-3">
            <input
              type="checkbox"
              checked={!!active[l.id]}
              onChange={() =>
                setActive((a) => ({ ...a, [l.id]: !a[l.id] }))
              }
            />
            {l.label}
          </label>
        ))}
        <div className="ml-auto flex gap-2">
          <div className="flex items-center border rounded px-2 text-sm">
            <Search className="w-4 h-4 mr-1" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="outline-none py-1 w-64"
              placeholder="Search terms (e.g., OLT, 1:4, FPOI, drop)"
            />
          </div>
          <Button onClick={() => window.print()} size="sm">Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 p-3">
        {/* LEFT: Abbreviation Tutor */}
        <div className="col-span-12 md:col-span-3 space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Abbreviations Tutor</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {filteredTerms.map((t) => (
                <div
                  key={t.key}
                  className="border rounded p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelected({ term: t })}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{t.display} <span className="text-gray-500">({t.readAs})</span></div>
                    <Badge variant="secondary" className="text-[10px]">Tap for details</Badge>
                  </div>
                  <div className="text-xs text-gray-600">{t.full}</div>
                  <div className="text-sm mt-1">{t.simple}</div>
                  <div className="text-xs mt-1"><b>Example:</b> {t.example}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Diagram */}
        <div className="col-span-12 md:col-span-6">
          <Card className="h-[80vh] relative overflow-auto">
            <CardHeader><CardTitle className="text-base">Interactive PON Diagram</CardTitle></CardHeader>
            <CardContent>
              <div className="relative w-full h-full min-w-[1000px] min-h-[500px] border rounded bg-gradient-to-b from-white to-gray-50 overflow-auto">
                {/* SVG Edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {EDGES.map((e, idx) => {
                    const from = NODES.find(n => n.id === e.from);
                    const to = NODES.find(n => n.id === e.to);
                    if (!from || !to) return null;
                    const x1 = from.x + 60;
                    const y1 = from.y + 20;
                    const x2 = to.x + 10;
                    const y2 = to.y + 20;
                    return (
                      <g key={idx}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth={3} />
                        {active.OFC && (
                          <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} fill="currentColor" className="text-[12px]" textAnchor="middle">
                            {e.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes */}
                {NODES.map((n) => {
                  const t = termByType(n.type);
                  const show = active[n.type as keyof typeof active] ?? true;
                  return (
                    <div
                      key={n.id}
                      onClick={() => setSelected({ node: n, term: t })}
                      className={`absolute -translate-y-1/2 shadow-sm rounded-2xl border bg-white px-3 py-2 w-[180px] hover:shadow cursor-pointer ${show ? '' : 'opacity-30'}`}
                      style={{ left: n.x, top: n.y }}
                    >
                      <div className="flex items-center gap-2">
                        {nodeIcon(n.type)}
                        <div>
                          <div className="font-semibold text-sm">{n.label}</div>
                          <div className="text-[11px] text-gray-600">{t?.full || n.type}</div>
                        </div>
                      </div>
                      {n.type === "SPLITTER" && n.ratio && active.ANNOT && (
                        <div className="mt-1 text-[11px]"><b>Ratio:</b> {n.ratio}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Detail Panel */}
        <div className="col-span-12 md:col-span-3">
          <Card className="sticky top-12">
            <CardHeader><CardTitle className="text-base">Details / Tutor</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              {/* Node info */}
              {"node" in (selected || {}) && selected?.node && (
                <>
                  <div className="text-xs uppercase text-gray-500">Selected Node</div>
                  <div className="text-sm font-semibold">{selected.node.label}</div>
                  <div className="text-xs text-gray-600">Type: {selected.node.type}</div>
                  {selected.node.ratio && (
                    <div className="text-xs"><b>Split Ratio:</b> {selected.node.ratio}</div>
                  )}
                </>
              )}

              {/* Term info */}
              {selected?.term && (
                <>
                  <div className="border-t pt-2 text-sm font-semibold">{selected.term.display} <span className="text-gray-500">({selected.term.readAs})</span></div>
                  <div className="text-xs text-gray-600">{selected.term.full}</div>
                  <div><b>Simple:</b> {selected.term.simple}</div>
                  <div><b>Function:</b> {selected.term.function}</div>
                  <div><b>Example:</b> {selected.term.example}</div>
                </>
              )}

              {!selected && (
                <div className="text-gray-500 text-sm">Click any node or term to view its details.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
