import { toValue, type MaybeRefOrGetter } from "vue";
import { useHead, useRequestURL, useRuntimeConfig, useSeoMeta } from "#app";

interface PageSeo {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  /** The page's own path (e.g. "/words/2026-10-03"), for the canonical URL. */
  path: MaybeRefOrGetter<string>;
  /** Open Graph type; a word's page is an article, everything else a website. */
  type?: "website" | "article";
  /** `ISO 8601` publication time (an entry's day opens at midnight JST). */
  publishedTime?: MaybeRefOrGetter<string | undefined>;
  /** Keep the page out of search results (error states, empty pages). */
  noindex?: MaybeRefOrGetter<boolean>;
}

/** The public origin: `NUXT_PUBLIC_SITE_URL` when set, else the one the page was
 *  requested on — so canonical and Open Graph URLs are absolute on every host. */
export function useSiteUrl(): string {
  const configured = String(useRuntimeConfig().public?.siteUrl ?? "").trim();
  return (configured || useRequestURL().origin).replace(/\/+$/, "");
}

/** Title, description, canonical link and Open Graph/Twitter tags for a page.
 *  Values may be getters, so a page can follow data that arrives with the fetch. */
export function usePageSeo(seo: PageSeo): void {
  const origin = useSiteUrl();
  const url = () => origin + toValue(seo.path);

  useSeoMeta({
    title: () => toValue(seo.title),
    description: () => toValue(seo.description),
    ogTitle: () => toValue(seo.title),
    ogDescription: () => toValue(seo.description),
    ogType: seo.type ?? "website",
    ogUrl: url,
    ogSiteName: "NipponDaily",
    twitterCard: "summary",
    articlePublishedTime: () =>
      seo.type === "article" ? toValue(seo.publishedTime) : undefined,
    robots: () => (toValue(seo.noindex) ? "noindex, nofollow" : undefined),
  });
  useHead({ link: [{ rel: "canonical", href: url }] });
}
