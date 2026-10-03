<template>
  <figure class="doc-figure">
    <div class="doc-figure-scroll">
      <svg
        class="dg"
        role="img"
        :aria-label="label"
        :viewBox="`${laid.x} ${laid.y} ${laid.width} ${laid.height}`"
        :style="{ maxWidth: `${laid.width}px`, minWidth: `${minWidth}px` }"
      >
        <defs>
          <marker
            v-for="kind in MARKERS"
            :id="`${uid}-${kind}`"
            :key="kind"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0 1 L10 5 L0 9z" :class="`dg-arrow dg-arrow-${kind}`" />
          </marker>
        </defs>

        <g v-for="g in laid.groups" :key="g.label">
          <rect
            class="dg-group"
            :x="g.x"
            :y="g.y"
            :width="g.w"
            :height="g.h"
            rx="6"
          />
          <text class="dg-group-label" :x="g.x + 10" :y="g.y + 14">
            {{ g.label }}
          </text>
        </g>

        <g v-for="(e, i) in laid.edges" :key="`e${i}`">
          <path
            :class="`dg-edge dg-edge-${e.kind ?? 'solid'}`"
            :d="e.d"
            fill="none"
            :marker-end="`url(#${uid}-${e.kind ?? 'solid'})`"
          />
          <template v-if="e.label">
            <text
              v-for="(line, j) in e.label.split('\n')"
              :key="j"
              :class="`dg-edge-label dg-edge-label-${e.kind ?? 'solid'}`"
              v-bind="labelPos(e, j)"
            >
              {{ line }}
            </text>
          </template>
        </g>

        <g v-for="n in laid.nodes" :key="n.id">
          <rect
            :class="`dg-node dg-node-${n.kind ?? 'code'}`"
            :x="n.x"
            :y="n.y"
            :width="n.w"
            :height="n.h"
            :rx="n.kind === 'actor' ? n.h / 2 : 6"
          />
          <text
            v-for="(line, j) in n.lines"
            :key="j"
            class="dg-label"
            :x="n.x + n.w / 2"
            :y="n.y + 20 + j * 16"
            text-anchor="middle"
          >
            {{ line }}
          </text>
          <text
            v-if="n.sub"
            class="dg-sub"
            :x="n.x + n.w / 2"
            :y="n.y + 20 + n.lines.length * 16"
            text-anchor="middle"
          >
            {{ n.sub }}
          </text>
        </g>
      </svg>
    </div>
    <figcaption>{{ label }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import {
  layoutDiagram,
  type DiagramSpec,
  type LaidEdge,
} from "../utils/diagram";

/**
 * A flow diagram drawn as inline SVG (server-rendered, themed by the season's
 * colour tokens, no script loaded). `label` is both the caption and the
 * accessible name.
 */
const props = defineProps<DiagramSpec & { label: string }>();

const MARKERS = ["solid", "dashed", "never"] as const;
const uid = useId();

const laid = computed(() => layoutDiagram(props));

/** A label sits above a horizontal arrow and beside a vertical one. */
function labelPos(e: LaidEdge, line: number) {
  const n = e.label!.split("\n").length;
  return e.horizontalLabel
    ? { x: e.lx, y: e.ly - 6 - (n - 1 - line) * 12, "text-anchor": "middle" }
    : {
        x: e.lx + 7,
        y: e.ly + (line - (n - 1) / 2) * 12 + 4,
        "text-anchor": "start",
      };
}
// Wide diagrams scroll sideways on a phone instead of shrinking past reading.
const minWidth = computed(() => Math.min(laid.value.width, 560));
</script>

<style scoped>
.dg {
  display: block;
  width: 100%;
  height: auto;
  margin-inline: auto;
  font-family: var(--font-sans);
  --dg-paper: var(--paper, #fffdf8);
  --dg-ink: currentColor;
  --dg-line: color-mix(in srgb, currentColor 55%, transparent);
  --dg-never: var(--error-500);
}

.dg-node {
  stroke-width: 1.25;
  fill: var(--dg-paper);
  stroke: var(--dg-line);
}
.dg-node-actor {
  fill: color-mix(in srgb, var(--secondary-500) 14%, var(--dg-paper));
  stroke: var(--secondary-500);
}
.dg-node-store {
  fill: color-mix(in srgb, var(--secondary-500) 8%, var(--dg-paper));
  stroke: var(--secondary-500);
  stroke-dasharray: 0;
  stroke-width: 2;
}
.dg-node-check {
  fill: color-mix(in srgb, var(--primary-500) 13%, var(--dg-paper));
  stroke: var(--primary-500);
  stroke-width: 1.75;
}
.dg-node-ghost {
  stroke-dasharray: 4 3;
  fill: transparent;
}

.dg-label {
  font-size: 13px;
  font-weight: 600;
  fill: var(--dg-ink);
}
.dg-sub {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  fill: var(--dg-ink);
  opacity: 0.7;
}

.dg-edge {
  stroke: var(--dg-line);
  stroke-width: 1.5;
  stroke-linejoin: round;
}
.dg-edge-dashed {
  stroke-dasharray: 5 4;
}
.dg-edge-never {
  stroke: var(--dg-never);
  stroke-dasharray: 5 4;
}
.dg-arrow {
  fill: var(--dg-line);
}
.dg-arrow-never {
  fill: var(--dg-never);
}
.dg-edge-label {
  font-size: 10.5px;
  fill: var(--dg-ink);
  opacity: 0.85;
  paint-order: stroke;
  stroke: var(--dg-paper);
  stroke-width: 4px;
  stroke-linejoin: round;
}
.dg-edge-label-never {
  fill: var(--dg-never);
  opacity: 1;
  font-weight: 600;
}

.dg-group {
  fill: color-mix(in srgb, var(--primary-500) 4%, transparent);
  stroke: color-mix(in srgb, var(--primary-500) 40%, transparent);
  stroke-dasharray: 3 4;
}
.dg-group-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: var(--dg-ink);
  opacity: 0.6;
}

.doc-figure {
  margin: 2rem 0;
}
.doc-figure-scroll {
  overflow-x: auto;
}
.doc-figure figcaption {
  margin-top: 0.6rem;
  text-align: center;
  font-size: 0.8rem;
  font-style: italic;
  opacity: 0.7;
}
.doc-figure figcaption::before {
  counter-increment: figure;
  content: "Figure " counter(figure) ". ";
  font-style: normal;
  font-weight: 600;
}
</style>
