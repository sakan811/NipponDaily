<!-- eslint-disable vue/no-v-html -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="isSolid ? '0 0 20 20' : '0 0 24 24'"
    :fill="isSolid ? 'currentColor' : 'none'"
    :stroke="isSolid ? 'none' : 'currentColor'"
    :stroke-width="isSolid ? undefined : '2'"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="['u-icon inline-block select-none shrink-0', $attrs.class]"
    v-html="iconSvg"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  name: string;
}>();

const isSolid = computed(() => props.name.includes("-solid") || props.name.endsWith("-20-solid"));

const iconSvg = computed(() => {
  const name = props.name.replace(/^i-/, "").replace(/^[a-z]+-/, ""); // strip prefixes like i-heroicons- or i-lucide-
  const key = name.toLowerCase();

  // Mapping of common icons used in the app
  const svgs: Record<string, string> = {
    // User group
    "user-group": `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    
    // CPU / Chip
    "cpu-chip": `<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 15h3"/><path d="M1 9h3"/><path d="M1 15h3"/>`,
    
    // Play circle
    "play-circle": `<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>`,
    
    // Map
    "map": `<polygon points="3 6 9 3 15 6 21 3 21 18 15 15 9 18 3 15 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>`,
    
    // Cake
    "cake": `<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16h16"/><path d="M12 11V7"/><path d="M12 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Z"/>`,
    
    // Shield Exclamation
    "shield-exclamation": `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    
    // Arrow Right
    "arrow-right": `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
    
    // Arrow Left
    "arrow-left": `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,

    // Minus
    "minus": `<line x1="5" y1="12" x2="19" y2="12"/>`,
    
    // Plus
    "plus": `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
    
    // Arrow path (loading / refresh)
    "arrow-path": `<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-2.73"/>`,
    
    // Solid version of Arrow path
    "arrow-path-20-solid": `<path fill-rule="evenodd" d="M15.312 4.124A8 8 0 112.1 10a.75.75 0 011.493-.153 6.5 6.5 0 101.442-3.738l.063.155a.75.75 0 01-1.385.568l-.89-2.17a.75.75 0 01.428-.962l2.17-.89a.75.75 0 01.963.428l.063.156z" clip-rule="evenodd" />`,
    
    // Exclamation Triangle
    "exclamation-triangle": `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    
    // Shield Check
    "shield-check": `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/>`,
    
    // Document Text
    "document-text": `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`,
    
    // Link
    "link": `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
    
    // Globe alt
    "globe-alt": `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
    
    // Calendar solid
    "calendar-days-20-solid": `<path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-2.25 7v6.25c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V9H3.5z" clip-rule="evenodd" />`,
    
    // Fire
    "fire": `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`,
    
    // Clock
    "clock": `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    
    // Home
    "home": `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    
    // Star
    "star": `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
    
    // Building Office
    "building-office-2": `<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M8 6h2"/><path d="M14 6h2"/><path d="M8 10h2"/><path d="M14 10h2"/>`,
    
    // Magnifying Glass
    "magnifying-glass": `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
    
    // Funnel
    "funnel": `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
    
    // Moon
    "moon": `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`,
    
    // Newspaper
    "newspaper": `<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M18 18h-8"/><path d="M16 6H10v4h6V6Z"/>`,
    
    // Map pin
    "map-pin": `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    
    // Arrow top right on square
    "arrow-top-right-on-square": `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>`,
    
    // Sun
    "sun": `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`,
    
    // X mark / close
    "x-mark": `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
    
    // Bars 3 (hamburger menu)
    "bars-3": `<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>`,
    
    // Bars 3 bottom left
    "bars-3-bottom-left": `<line x1="3" y1="12" x2="17" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="13" y2="18"/>`,
  };

  // Fallback if icon not found in dictionary
  const fallback = `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`;

  return svgs[key] || fallback;
});
</script>
