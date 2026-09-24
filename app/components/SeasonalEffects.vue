<template>
  <div class="seasonal-effects" aria-hidden="true">
    <span
      v-for="particle in particles"
      :key="particle.id"
      class="seasonal-particle"
      :style="particle.style"
    />
    <span class="seasonal-corner-glyph" />
  </div>
</template>

<script setup lang="ts">
/**
 * Purely decorative, season-matched ambient graphic layered over every
 * page: falling sakura petals (spring); rising bubbles by day / blinking
 * fireflies by night plus a furin/hanabi corner glyph (summer); falling
 * momiji (day) / susuki (night) plus a leaf/tsukimi-moon corner glyph
 * (autumn); falling snow (winter).
 *
 * Renders ONE season-agnostic set of empty spans. Everything seasonal — the
 * emoji (via CSS `content`), CSS-dot styling, direction of travel — is set
 * in app/assets/css/tailwind.css, keyed off [data-season] and .dark, so a
 * season switch or light/dark toggle needs no JS and can't cause a
 * hydration mismatch.
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
 * away, so the layer doesn't look like one repeating sprite.
 */
const DEPTH_LAYERS = [
  { scale: 0.7, opacity: 0.45, opacityEnd: 0.3, blur: 1.2, durationBoost: 6 },
  { scale: 0.9, opacity: 0.65, opacityEnd: 0.45, blur: 0.4, durationBoost: 2 },
  { scale: 1.15, opacity: 0.9, opacityEnd: 0.65, blur: 0, durationBoost: 0 },
] as const;

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const layer = DEPTH_LAYERS[i % DEPTH_LAYERS.length]!;
    const duration = 9 + ((i * 2.3) % 7) + layer.durationBoost;
    const drift = (i % 2 === 0 ? 1 : -1) * (50 + ((i * 13) % 70));

    return {
      id: i,
      style: {
        left: `${(i * 37) % 100}%`,
        fontSize: `${14 + ((i * 5) % 10)}px`,
        animationDelay: `${((i * 1.7) % 12).toFixed(1)}s`,
        animationDuration: `${duration.toFixed(1)}s`,
        "--seasonal-drift": `${drift}px`,
        "--seasonal-scale": `${layer.scale}`,
        "--seasonal-opacity": `${layer.opacity}`,
        "--seasonal-opacity-end": `${layer.opacityEnd}`,
        "--seasonal-blur": `${layer.blur}px`,
      },
    };
  });
}

const particles = buildParticles(PARTICLE_COUNT);
</script>
