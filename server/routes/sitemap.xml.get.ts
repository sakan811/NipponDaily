import { sitemapXml } from "~~/shared/sitemap";
import { siteOrigin } from "../utils/site-url";

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "application/xml; charset=utf-8");
  return sitemapXml(siteOrigin(event));
});
