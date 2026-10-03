/**
 * Lays out the docs' flow diagrams. A diagram is a grid of boxes (`col`, `row`)
 * joined by orthogonal arrows; this turns that spec into coordinates and SVG
 * path strings, so `DocDiagram.vue` only draws. Pure, so it is unit-tested.
 */

export type DiagramSide = "t" | "r" | "b" | "l";

export interface DiagramNode {
  id: string;
  /** Lines separated by `\n`. */
  label: string;
  /** A smaller, monospaced second line (a file, a route, a command). */
  sub?: string;
  col: number;
  row: number;
  /** Box width; defaults to one column's worth. */
  w?: number;
  kind?: "actor" | "code" | "store" | "check" | "ghost";
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  /** `dashed` for a soft link; `never` for something that must not happen. */
  kind?: "solid" | "dashed" | "never";
  /** Force the side the arrow leaves and enters by. */
  out?: DiagramSide;
  into?: DiagramSide;
}

export interface DiagramGroup {
  label: string;
  ids: string[];
}

export interface DiagramSpec {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
}

export interface LaidNode extends DiagramNode {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
}

export interface LaidEdge extends DiagramEdge {
  d: string;
  /** Where the label sits, and whether it runs along a horizontal segment. */
  lx: number;
  ly: number;
  horizontalLabel: boolean;
}

export interface LaidGroup {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LaidDiagram {
  /** The viewBox origin: negative when an arrow loops outside the boxes. */
  x: number;
  y: number;
  width: number;
  height: number;
  nodes: LaidNode[];
  edges: LaidEdge[];
  groups: LaidGroup[];
}

export const COL_W = 214;
export const ROW_H = 84;
export const NODE_W = 150;
const PAD = 14;
const LINE = 16;
const GROUP_PAD = 10;
const GROUP_LABEL = 18;
const LOOP = 40;

type Point = [number, number];

function nodeHeight(lines: number, sub: boolean): number {
  return 18 + (lines + (sub ? 1 : 0)) * LINE;
}

function sidePoint(n: LaidNode, side: DiagramSide): Point {
  const cx = n.x + n.w / 2;
  const cy = n.y + n.h / 2;
  if (side === "t") return [cx, n.y];
  if (side === "b") return [cx, n.y + n.h];
  if (side === "l") return [n.x, cy];
  return [n.x + n.w, cy];
}

const horizontal = (s: DiagramSide) => s === "l" || s === "r";

/** The points of an orthogonal route from one side of a box to a side of another. */
function route(
  from: LaidNode,
  to: LaidNode,
  out: DiagramSide,
  into: DiagramSide,
): Point[] {
  const s = sidePoint(from, out);
  const e = sidePoint(to, into);
  if (out === into) {
    // Leave and enter by the same side: loop round the outside.
    const sign = out === "r" || out === "b" ? 1 : -1;
    const pick = sign > 0 ? Math.max : Math.min;
    if (horizontal(out)) {
      const x = pick(s[0], e[0]) + sign * LOOP;
      return [s, [x, s[1]], [x, e[1]], e];
    }
    const y = pick(s[1], e[1]) + sign * LOOP;
    return [s, [s[0], y], [e[0], y], e];
  }
  if (horizontal(out) !== horizontal(into)) {
    // One horizontal and one vertical side: a single corner.
    const corner: Point = horizontal(out) ? [e[0], s[1]] : [s[0], e[1]];
    return [s, corner, e];
  }
  if (horizontal(out)) {
    if (s[1] === e[1]) return [s, e];
    const mid = (s[0] + e[0]) / 2;
    return [s, [mid, s[1]], [mid, e[1]], e];
  }
  if (s[0] === e[0]) return [s, e];
  const mid = (s[1] + e[1]) / 2;
  return [s, [s[0], mid], [e[0], mid], e];
}

function defaultSides(
  from: LaidNode,
  to: LaidNode,
): [DiagramSide, DiagramSide] {
  const dy = to.y + to.h / 2 - (from.y + from.h / 2);
  const dx = to.x + to.w / 2 - (from.x + from.w / 2);
  if (Math.abs(dy) < 1) return dx >= 0 ? ["r", "l"] : ["l", "r"];
  return dy > 0 ? ["b", "t"] : ["t", "b"];
}

/** The midpoint of the longest segment, where an edge's label sits. */
function labelPoint(points: Point[]): [number, number, boolean] {
  let best: [Point, Point] = [points[0]!, points[1]!];
  let bestLen = -1;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const len = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    if (len > bestLen) {
      bestLen = len;
      best = [a, b];
    }
  }
  return [
    (best[0][0] + best[1][0]) / 2,
    (best[0][1] + best[1][1]) / 2,
    best[0][1] === best[1][1],
  ];
}

export function layoutDiagram(spec: DiagramSpec): LaidDiagram {
  const groups = spec.groups ?? [];
  const top = groups.length ? GROUP_LABEL + GROUP_PAD : 0;

  const nodes: LaidNode[] = spec.nodes.map((n) => {
    const lines = n.label.split("\n");
    const w = n.w ?? NODE_W;
    const h = nodeHeight(lines.length, Boolean(n.sub));
    const cx = PAD + n.col * COL_W + NODE_W / 2;
    const cy = PAD + top + n.row * ROW_H + 26;
    return { ...n, lines, w, h, x: cx - w / 2, y: cy - h / 2 };
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const node = (id: string) => {
    const found = byId.get(id);
    if (!found) throw new Error(`diagram: unknown node "${id}"`);
    return found;
  };

  const routed: Point[] = [];
  const edges: LaidEdge[] = spec.edges.map((e) => {
    const from = node(e.from);
    const to = node(e.to);
    const [out, into] = defaultSides(from, to);
    const points = route(from, to, e.out ?? out, e.into ?? into);
    const [lx, ly, horizontalLabel] = labelPoint(points);
    routed.push(...points);
    return {
      ...e,
      d: points.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" "),
      lx,
      ly,
      horizontalLabel,
    };
  });

  const laidGroups: LaidGroup[] = groups.map((g) => {
    const members = g.ids.map(node);
    const x1 = Math.min(...members.map((n) => n.x)) - GROUP_PAD;
    const y1 = Math.min(...members.map((n) => n.y)) - GROUP_PAD - GROUP_LABEL;
    const x2 = Math.max(...members.map((n) => n.x + n.w)) + GROUP_PAD;
    const y2 = Math.max(...members.map((n) => n.y + n.h)) + GROUP_PAD;
    return { label: g.label, x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  });

  const xs = [
    ...nodes.flatMap((n) => [n.x, n.x + n.w]),
    ...laidGroups.flatMap((g) => [g.x, g.x + g.w]),
    ...routed.map((p) => p[0]),
  ];
  const ys = [
    ...nodes.flatMap((n) => [n.y, n.y + n.h]),
    ...laidGroups.flatMap((g) => [g.y, g.y + g.h]),
    ...routed.map((p) => p[1]),
  ];
  const x = Math.floor(Math.min(...xs) - PAD);
  const y = Math.floor(Math.min(...ys) - PAD);

  return {
    x,
    y,
    width: Math.ceil(Math.max(...xs) + PAD) - x,
    height: Math.ceil(Math.max(...ys) + PAD) - y,
    nodes,
    edges,
    groups: laidGroups,
  };
}
