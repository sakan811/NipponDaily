<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{
  code: string;
  id?: string;
}>();

const container = ref<HTMLElement | null>(null);
const mermaidOutput = ref<HTMLElement | null>(null);
const diagramId =
  props.id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;
interface SvgPanZoomInstance {
  destroy: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  center: () => void;
  fit: () => void;
}

const panZoomInstance = ref<SvgPanZoomInstance | null>(null);
const isLoading = ref(true);
const isMounted = ref(false);

const renderDiagram = async () => {
  if (!mermaidOutput.value || typeof mermaid === "undefined") return;

  try {
    isLoading.value = true;
    // Clear previous content
    mermaidOutput.value.innerHTML = `<div id="${diagramId}-svg-container" class="flex items-center justify-center h-full"></div>`;

    // Render mermaid
    const { svg } = await mermaid.render(`${diagramId}-svg`, props.code);

    if (!isMounted.value) return;

    const svgElementContainer = mermaidOutput.value.querySelector(
      `#${diagramId}-svg-container`,
    );

    if (svgElementContainer) {
      svgElementContainer.innerHTML = svg;
      const svgElement = svgElementContainer.querySelector("svg");

      if (svgElement) {
        svgElement.style.width = "100%";
        svgElement.style.height = "100%";
        svgElement.style.maxWidth = "none";

        if (typeof svgPanZoom !== "undefined") {
          if (panZoomInstance.value) {
            panZoomInstance.value.destroy();
          }

          panZoomInstance.value = svgPanZoom(svgElement, {
            zoomEnabled: true,
            controlIconsEnabled: false, // Disable messy default icons
            fit: true,
            center: true,
            minZoom: 0.1,
            maxZoom: 10,
            mouseWheelZoomEnabled: true,
          });
        }
      }
    }
    isLoading.value = false;
  } catch (error) {
    console.error("Mermaid rendering failed:", error);
    if (isMounted.value) {
      isLoading.value = false;
    }
  }
};

const zoomIn = () => panZoomInstance.value?.zoomIn();
const zoomOut = () => panZoomInstance.value?.zoomOut();
const reset = () => {
  panZoomInstance.value?.resetZoom();
  panZoomInstance.value?.center();
  panZoomInstance.value?.fit();
};

const handleReady = () => {
  if (typeof mermaid !== "undefined" && typeof svgPanZoom !== "undefined") {
    renderDiagram();
  }
};

onMounted(() => {
  isMounted.value = true;
  window.addEventListener("mermaid-ready", handleReady);
  window.addEventListener("svg-pan-zoom-ready", handleReady);
  handleReady();
});

onUnmounted(() => {
  isMounted.value = false;
  window.removeEventListener("mermaid-ready", handleReady);
  window.removeEventListener("svg-pan-zoom-ready", handleReady);
  if (panZoomInstance.value) {
    panZoomInstance.value.destroy();
  }
});

watch(() => props.code, renderDiagram);

defineExpose({ render: renderDiagram });
</script>

<template>
  <div class="mermaid-container mx-auto max-w-3xl">
    <div
      class="relative group rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary-500/30"
    >
      <!-- Diagram Area -->
      <div
        ref="container"
        class="w-full h-[500px] cursor-grab active:cursor-grabbing relative"
      >
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-400 gap-3"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="animate-spin w-8 h-8 text-primary-500"
          />
          <span class="text-sm font-medium">Generating diagram...</span>
        </div>
        <div ref="mermaidOutput" class="w-full h-full" />
      </div>

      <!-- Integrated NuxtUI Controls -->
      <div
        class="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div
          class="flex items-center shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-0.5"
        >
          <UButton
            icon="i-heroicons-minus"
            color="gray"
            variant="ghost"
            class="rounded-r-none"
            aria-label="Zoom out"
            @click="zoomOut"
          />
          <div class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
          <UButton
            icon="i-heroicons-arrow-path-20-solid"
            color="gray"
            variant="ghost"
            label="Reset"
            class="rounded-none"
            @click="reset"
          />
          <div class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
          <UButton
            icon="i-heroicons-plus"
            color="gray"
            variant="ghost"
            class="rounded-l-none"
            aria-label="Zoom in"
            @click="zoomIn"
          />
        </div>
      </div>

      <!-- Interaction Hint -->
      <div class="absolute top-4 right-4 pointer-events-none">
        <UKbd
          size="md"
          class="opacity-40 group-hover:opacity-100 transition-opacity"
          >Scroll to Zoom</UKbd
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.mermaid-container :deep(svg) {
  user-select: none;
}
</style>
