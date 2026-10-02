import { robotsTxt } from "~~/shared/sitemap";
import { siteOrigin } from "../utils/site-url";

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "text/plain; charset=utf-8");
  return robotsTxt(siteOrigin(event));
});
