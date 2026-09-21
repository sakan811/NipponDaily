<template>
  <div class="seasonal-effects" aria-hidden="true">
    <span
      v-for="particle in sakuraParticles"
      :key="`sakura-${particle.id}`"
      class="seasonal-particle seasonal-particle--sakura"
      :style="particle.style"
      >🌸</span
    >
    <span
      v-for="particle in autumnParticles"
      :key="`autumn-${particle.id}`"
      class="seasonal-particle seasonal-particle--autumn"
      :style="particle.style"
      >🍁</span
    >
  </div>
</template>

<script setup lang="ts">
/**
 * Purely decorative, season-matched falling graphic (sakura petals / autumn
 * leaves) layered over every page. Both particle groups always render —
 * which one is actually visible is decided in CSS by the [data-season] on
 * <html> (see app/assets/css/tailwind.css) — so this component needs no
 * knowledge of the active season and never causes a hydration mismatch.
 *
 * Per-particle placement is a fixed function of its index rather than
 * Math.random(), so server and client render byte-identical inline styles.
 */

const PARTICLE_COUNT = 18;

interface Particle {
  id: number;
  style: Record<string, string>;
}

/**
 * Three fixed "depth" layers (far/mid/near) give the effect parallax-like
 * variety — smaller, dimmer, blurrier, slower particles read as further
 * away, so the layer doesn't look like one repeating sprite. Layer is a
 * pure function of index, so server/client output stays byte-identical.
 */
const DEPTH_LAYERS = [
  { scale: 0.7, opacity: 0.45, opacityEnd: 0.3, blur: 1.2, durationBoost: 6 },
  { scale: 0.9, opacity: 0.65, opacityEnd: 0.45, blur: 0.4, durationBoost: 2 },
  { scale: 1.15, opacity: 0.9, opacityEnd: 0.65, blur: 0, durationBoost: 0 },
];

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const left = (i * 37) % 100;
    const delay = ((i * 1.7) % 12).toFixed(1);
    const duration = (9 + ((i * 2.3) % 7)).toFixed(1);
    const driftSign = i % 2 === 0 ? 1 : -1;
    const drift = driftSign * (50 + ((i * 13) % 70));
    const size = 14 + ((i * 5) % 10);
    const layer = DEPTH_LAYERS[i % DEPTH_LAYERS.length];

    return {
      id: i,
      style: {
        left: `${left}%`,
        fontSize: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${(Number(duration) + layer.durationBoost).toFixed(1)}s`,
        "--seasonal-drift": `${drift}px`,
        "--seasonal-scale": `${layer.scale}`,
        "--seasonal-opacity": `${layer.opacity}`,
        "--seasonal-opacity-end": `${layer.opacityEnd}`,
        "--seasonal-blur": `${layer.blur}px`,
      },
    };
  });
}

const sakuraParticles = buildParticles(PARTICLE_COUNT);
const autumnParticles = buildParticles(PARTICLE_COUNT);
</script>
