import { onMounted, onUnmounted, ref } from "vue";

/**
 * The open state of a header dropdown (the season and music buttons): bind
 * `container` to the element that holds the button and its panel, and a click
 * anywhere outside it closes the panel.
 */
export function useDropdown() {
  const isOpen = ref(false);
  const container = ref<HTMLElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (container.value && !container.value.contains(event.target as Node)) {
      isOpen.value = false;
    }
  };

  onMounted(() => document.addEventListener("click", handleClickOutside));
  onUnmounted(() => document.removeEventListener("click", handleClickOutside));

  return { isOpen, container };
}
