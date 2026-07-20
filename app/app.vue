<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  const updateFavicons = (isDark: boolean) => {
    const folder = isDark ? "dark" : "light";
    const links = document.querySelectorAll(
      'link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]',
    );
    links.forEach((link) => {
      const currentHref = link.getAttribute("href");
      if (currentHref) {
        if (
          currentHref.indexOf("/favicon-light.ico") === 0 ||
          currentHref.indexOf("/favicon-dark.ico") === 0
        ) {
          link.setAttribute(
            "href",
            isDark ? "/favicon-dark.ico" : "/favicon-light.ico",
          );
        } else if (currentHref.indexOf("/light/") === 0) {
          link.setAttribute(
            "href",
            currentHref.replace("/light/", "/" + folder + "/"),
          );
        } else if (currentHref.indexOf("/dark/") === 0) {
          link.setAttribute(
            "href",
            currentHref.replace("/dark/", "/" + folder + "/"),
          );
        }
      }
    });
  };

  // Initial run on mount
  updateFavicons(document.documentElement.classList.contains("dark"));

  // Run observer on document.documentElement class mutations (theme toggling)
  const observer = new MutationObserver(() => {
    const isDark = document.documentElement.classList.contains("dark");
    updateFavicons(isDark);
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});
</script>
