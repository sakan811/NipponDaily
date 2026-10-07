import { describe, it, expect } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { API_ENDPOINTS } from "~~/shared/endpoints";
import { DOC_CHAPTERS, docPath } from "~~/shared/docs";
import { DATA_SOURCES } from "~~/shared/sources";
import { SEASONS, SEASON_IDS } from "~~/shared/seasons";

const pages = import.meta.glob("~/app/pages/docs/*.vue", {
  eager: true,
}) as Record<string, { default: object }>;
const page = (slug: string) => {
  const found = Object.entries(pages).find(([path]) =>
    path.endsWith(`/docs/${slug}.vue`),
  );
  if (!found) throw new Error(`no page for ${slug}`);
  return found[1].default;
};

const stubs = {
  UHeader: {
    template:
      '<div class="u-header"><slot name="left" /><slot name="right" /><slot name="body" /><slot /></div>',
  },
  UFooter: {
    template: '<div class="u-footer"><slot name="left" /><slot /></div>',
  },
};

const render = async (slug: string) => {
  const wrapper = mount(page(slug), { global: { stubs } });
  await flushPromises();
  return wrapper;
};

describe("every chapter", () => {
  it.each(DOC_CHAPTERS.map((c) => [c.slug, c.title] as const))(
    "%s renders as a book page titled %s",
    async (slug, title) => {
      const wrapper = await render(slug);

      expect(wrapper.find("article.book-page").exists()).toBe(true);
      expect(wrapper.find("h1").text()).toBe(title);
      const index = DOC_CHAPTERS.findIndex((c) => c.slug === slug) + 1;
      expect(wrapper.text()).toContain(`Chapter ${index}`);
      // The contents rail names the chapter being read.
      expect(
        wrapper
          .find(`nav[aria-label="Contents"] a[href="${docPath(slug)}"]`)
          .classes(),
      ).toContain("is-current");
    },
  );

  it("never mentions the removed game, lessons or MCP agent", async () => {
    for (const { slug } of DOC_CHAPTERS) {
      const text = (await render(slug)).text();
      expect(text, slug).not.toMatch(
        /daily game|Lesson Paths|MCP|\/api\/daily-game/,
      );
    }
  });

  it("links the previous and next chapter in order", async () => {
    const wrapper = await render("api");
    const hrefs = wrapper
      .findAll(".book-foot a")
      .map((a) => a.attributes("href"));
    expect(hrefs).toEqual(["/docs/words", "/docs/seasons"]);
  });

  it("starts with no previous and ends by going back to the contents", async () => {
    const first = await render(DOC_CHAPTERS[0]!.slug);
    expect(first.find(".book-prev").exists()).toBe(false);

    const last = await render(DOC_CHAPTERS[DOC_CHAPTERS.length - 1]!.slug);
    expect(last.find(".book-next").attributes("href")).toBe("/docs");
  });
});

describe("the contents", () => {
  it("lists every chapter, and goes on to the first", async () => {
    const wrapper = mount(page("index"), { global: { stubs } });

    expect(wrapper.find("h1").text()).toBe("Documentation");
    for (const c of DOC_CHAPTERS) {
      expect(
        wrapper.find(`ol.toc a[href="${docPath(c.slug)}"]`).exists(),
        c.slug,
      ).toBe(true);
      expect(wrapper.text()).toContain(c.summary);
    }
    expect(wrapper.find(".book-next").attributes("href")).toBe(
      docPath(DOC_CHAPTERS[0]!.slug),
    );
  });
});

describe("the chapters' content", () => {
  it("core theme states the five principles", async () => {
    const wrapper = await render("core-theme");
    expect(wrapper.findAll(".book-prose ol > li")).toHaveLength(5);
    expect(wrapper.text()).toContain("Only what has arrived.");
    expect(wrapper.find("figure svg").exists()).toBe(true);
  });

  it("architecture draws the import rule and states it", async () => {
    const wrapper = await render("architecture");
    expect(wrapper.find("figure svg .dg-edge-never").exists()).toBe(true);
    expect(wrapper.text()).toContain("never imports");
    expect(wrapper.text()).toContain("no-future-leak");
    expect(wrapper.text()).toContain("shared/docs.ts");
  });

  it("states the word range and count from /api/catalogue, not from the page", async () => {
    (global as any).$fetch.mockResolvedValue({
      success: true,
      data: { first: "2026-01-01", last: "2027-10-31", total: 669, open: 276 },
    });
    const wrapper = await render("words");
    expect(wrapper.text()).toContain(
      "January 2026 to October 2027 (669 words)",
    );
  });

  it("states no number when the catalogue can't be fetched", async () => {
    (global as any).$fetch.mockRejectedValue(new Error("offline"));
    const wrapper = await render("words");
    expect(wrapper.text()).toContain("the months written so far");
  });

  it("api lists every endpoint from shared/endpoints.ts", async () => {
    const text = (await render("api")).text();
    for (const e of API_ENDPOINTS) expect(text).toContain(e.path);
    expect(text).toContain("429");
  });

  it("seasons lists the presets and the cron, from the registry", async () => {
    const text = (await render("seasons")).text();
    for (const id of SEASON_IDS) {
      expect(text).toContain(SEASONS[id].label);
      expect(text).toContain(id);
    }
    expect(text).toContain("/api/cron/update-season");
    expect(text).toContain("CRON_SECRET");
  });

  it("colour and shape names every season's palette", async () => {
    const text = (await render("color-palette")).text();
    for (const label of ["Spring", "Summer", "Autumn", "Winter"]) {
      expect(text).toContain(label);
    }
    expect(text).toContain("Deep Rose");
    expect(text).toContain("#D2385A");
    expect(text).toContain("Cream Washi");
    expect(text).not.toContain("WCAG");
  });

  it("data integrity credits every source and says what the checks can't prove", async () => {
    const wrapper = await render("data-integrity");

    for (const source of DATA_SOURCES) {
      const credit = wrapper.find(`[data-testid="credit-${source.id}"]`);
      expect(credit.exists(), source.id).toBe(true);
      expect(credit.find(`a[href="${source.url}"]`).exists(), source.id).toBe(
        true,
      );
    }
    for (const id of ["data-attribution", "ai", "provenance"]) {
      expect(wrapper.find(`#${id}`).exists(), id).toBe(true);
    }
    const text = wrapper.text();
    expect(text).toContain("What these checks cannot prove");
    expect(text).toContain("data/reference/etymology/");
    expect(text).toContain("verbatim");
    expect(wrapper.findAll("figure svg")).toHaveLength(2);
  });

  it("authoring walks through adding a month with a diagram", async () => {
    const wrapper = await render("authoring");
    const text = wrapper.text();
    expect(text).toContain("pnpm data:etymology");
    expect(text).toContain("VOCAB_FORM_CORRECTIONS");
    expect(text).toContain("Register the month");
    expect(wrapper.find("figure svg").exists()).toBe(true);
  });

  it("development lists the environment and how the docs are kept true", async () => {
    const wrapper = await render("development");
    for (const name of [
      "UPSTASH_REDIS_REST_URL",
      "CRON_SECRET",
      "NUXT_PUBLIC_SITE_URL",
    ]) {
      expect(wrapper.text()).toContain(name);
    }
    expect(wrapper.find("#docs").exists()).toBe(true);
  });

  it("the error-state catalogue still shows every state", async () => {
    const wrapper = await render("error-states");
    for (const label of ["Fetch failure", "404", "API errors"]) {
      expect(wrapper.text()).toContain(label);
    }
  });
});
