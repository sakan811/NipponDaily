import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useRoute, useRouter } from "#app";
import WordsPage from "~/app/pages/words/index.vue";
import { exploreCalendar } from "~~/shared/explore";
import { filtersFromQuery } from "~~/shared/explore-query";
import { WORD_ENTRIES } from "~~/shared/words";

const respond = (data: unknown) => ({
  success: true,
  data,
  timestamp: "2010-02-08T00:00:00Z",
});

const MONTH = "2010-02";
const monthEntries = WORD_ENTRIES.filter((e) => e.date.startsWith(MONTH));

/** A calendar holding only one full month, as the API would answer it. */
const calendarPayload = (today: string) =>
  respond({
    ...exploreCalendar(MONTH, {}, today),
    months: [MONTH],
    monthCounts: { [MONTH]: 28 },
  });

describe("Words Page (Calendar)", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    (global as any).$fetch.mockResolvedValue(calendarPayload("2010-02-03"));
  });

  it("fetches the calendar and names the month", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/word-calendar", {
      query: {},
    });
    expect(wrapper.find('[data-testid="calendar-month"]').text()).toBe(
      "February 2010",
    );
  });

  it("shows a link with the word for each day that has arrived", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    const open = wrapper.findAll('[data-testid="calendar-day-open"]');
    expect(open).toHaveLength(3);
    expect(open[0]!.attributes("href")).toBe(`/words/${monthEntries[0]!.date}`);
    expect(open[0]!.text()).toContain(monthEntries[0]!.term);
    expect(open[0]!.text()).toContain(monthEntries[0]!.kana);
    expect(open[2]!.text()).toContain(monthEntries[2]!.term);
  });

  it("marks a repeated word with the day it first opened", async () => {
    const payload = calendarPayload("2010-02-03");
    payload.data.days[1]!.wordDate = "2005-05-12";
    (global as any).$fetch.mockResolvedValue(payload);
    const wrapper = mount(WordsPage);
    await flushPromises();

    const open = wrapper.findAll('[data-testid="calendar-day-open"]');
    expect(wrapper.findAll('[data-testid="calendar-day-repeat"]')).toHaveLength(
      1,
    );
    expect(open[1]!.find('[data-testid="calendar-day-repeat"]').exists()).toBe(
      true,
    );
    expect(open[1]!.attributes("href")).toBe("/words/2005-05-12");
    expect(open[1]!.attributes("aria-label")).toContain("first opened");
    expect(
      wrapper.find('[data-testid="calendar-first-opened-note"]').exists(),
    ).toBe(true);
  });

  it("shows later days as closed, with no word and no link", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    const closed = wrapper.findAll('[data-testid="calendar-day-closed"]');
    expect(closed).toHaveLength(25);
    expect(closed[0]!.text()).toBe("4");
    expect(closed[0]!.element.tagName).not.toBe("A");
    // The fourth's word is nowhere in the page.
    expect(wrapper.text()).not.toContain(monthEntries[3]!.term);
  });

  it("leaves a day the catalogue has no word for blank, not closed", async () => {
    // The catalogue starts part-way through 2005-05, so its first days are bare.
    (global as any).$fetch.mockResolvedValue(
      respond({
        ...exploreCalendar("2005-05", {}, "2010-02-03"),
        months: ["2005-05"],
        monthCounts: { "2005-05": 21 },
      }),
    );
    const wrapper = mount(WordsPage);
    await flushPromises();

    const empty = wrapper.findAll('[data-testid="calendar-day-empty"]');
    expect(empty).toHaveLength(10);
    expect(empty[0]!.attributes("aria-label")).toContain("no word");
    expect(wrapper.findAll('[data-testid="calendar-day-open"]')).toHaveLength(
      21,
    );
  });

  it("marks today", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    const open = wrapper.findAll('[data-testid="calendar-day-open"]');
    expect(open[2]!.classes().join(" ")).toContain("ring-2");
    expect(open[0]!.classes().join(" ")).not.toContain("ring-2");
  });

  it("starts the grid on the right weekday (Feb 1, 2010 is a Monday)", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    const cells = wrapper.findAll('[role="gridcell"]');
    // Sun-first: one blank (Sun) precedes the 1st, then 28 days.
    expect(cells).toHaveLength(1 + 28);
    expect(cells[1]!.text()).toContain("1");
    expect(
      wrapper.findAll('[role="columnheader"]').map((h) => h.text()),
    ).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("disables month navigation when there is only one month", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    expect(
      wrapper.find('[data-testid="calendar-prev"]').attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.find('[data-testid="calendar-next"]').attributes("disabled"),
    ).toBeDefined();
  });

  it("opens every day once the whole month has passed", async () => {
    (global as any).$fetch.mockResolvedValue(calendarPayload("2010-03-30"));
    const wrapper = mount(WordsPage);
    await flushPromises();

    expect(wrapper.findAll('[data-testid="calendar-day-open"]')).toHaveLength(
      28,
    );
    expect(wrapper.findAll('[data-testid="calendar-day-closed"]')).toHaveLength(
      0,
    );
  });

  it("shows the error card when the calendar fails to load, and retries", async () => {
    (global as any).$fetch.mockRejectedValueOnce(new Error("offline"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const wrapper = mount(WordsPage);
    await flushPromises();

    expect(wrapper.text()).toContain("Unable to Load the Calendar");

    await wrapper.find('[data-testid="error-state"] button').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-testid="calendar-month"]').exists()).toBe(true);
    consoleError.mockRestore();
  });
});

describe("Words Page (calendar filters)", () => {
  const TODAY = "2009-07-16";
  const replace = vi.fn();

  /** Answers each request the way the API would, from the real entries. */
  const serve = () =>
    (global as any).$fetch.mockImplementation(
      async (_url: string, opts?: { query?: Record<string, string> }) => {
        const { month, ...rest } = opts?.query ?? {};
        return respond(
          exploreCalendar(month ?? "2009-07", filtersFromQuery(rest), TODAY),
        );
      },
    );

  const mountAt = async (query: Record<string, string> = {}) => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/words",
      query,
      params: {},
    } as any);
    const wrapper = mount(WordsPage);
    await flushPromises();
    return wrapper;
  };
  const days = (w: Awaited<ReturnType<typeof mountAt>>) =>
    w.findAll('[data-testid="calendar-day-open"]');

  beforeEach(() => {
    (global as any).$fetch.mockReset();
    replace.mockReset();
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn(), replace } as any);
    serve();
  });

  it("jumps to a month in another year and keeps the URL in step", async () => {
    const wrapper = await mountAt({ month: "2009-07" });

    const years = wrapper.findAll('[data-testid="calendar-years"] button');
    expect(years.map((y) => y.text())).toEqual(
      expect.arrayContaining(["2005", "2009", "2024", "2026"]),
    );

    await wrapper.find('[data-testid="calendar-year-2024"]').trigger("click");
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({ query: { month: "2024-07" } });
    expect(wrapper.find('[data-testid="calendar-month"]').text()).toBe(
      "July 2024",
    );
  });

  /** Serves a catalogue with gaps: only these months have words. */
  const serveGaps = (counts: Record<string, number>) =>
    (global as any).$fetch.mockImplementation(
      async (_url: string, opts?: { query?: Record<string, string> }) =>
        respond({
          ...exploreCalendar(opts?.query?.month ?? "2009-07", {}, TODAY),
          month: opts?.query?.month ?? "2009-07",
          months: Object.keys(counts),
          monthCounts: counts,
        }),
    );
  const pick = (w: Awaited<ReturnType<typeof mountAt>>, month: string) =>
    w.find(`[data-testid="calendar-pick-month"][data-month="${month}"]`);

  it("disables the months that have no words", async () => {
    serveGaps({ "2026-03": 31, "2026-05": 31 });
    const wrapper = await mountAt({ month: "2026-03" });

    expect(wrapper.findAll('[data-testid="calendar-pick-month"]')).toHaveLength(
      12,
    );
    expect(pick(wrapper, "2026-04").attributes("disabled")).toBeDefined();
    expect(pick(wrapper, "2026-05").attributes("disabled")).toBeUndefined();

    await pick(wrapper, "2026-05").trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({ query: { month: "2026-05" } });
  });

  it("falls back to a year's first month when it lacks the current one", async () => {
    serveGaps({ "2026-03": 31, "2027-05": 31, "2027-06": 31 });
    const wrapper = await mountAt({ month: "2026-03" });

    await wrapper.find('[data-testid="calendar-year-2027"]').trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({ query: { month: "2027-05" } });
  });

  it("points to the nearest months with a match when this one has none", async () => {
    serveGaps({ "2026-02": 3, "2026-03": 0, "2026-04": 0, "2026-05": 2 });
    const wrapper = await mountAt({ month: "2026-03", level: "N2" });

    expect(wrapper.find('[data-testid="calendar-month-matches"]').text()).toBe(
      "0",
    );
    expect(
      wrapper.find('[data-testid="calendar-earlier-match"]').text(),
    ).toContain("February 2026");

    await wrapper.find('[data-testid="calendar-later-match"]').trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({
      query: { month: "2026-05", level: "N2" },
    });
  });

  it("offers no jump when this month has matches", async () => {
    const wrapper = await mountAt({ month: "2009-07", level: "N5" });
    expect(
      wrapper.find('[data-testid="calendar-earlier-match"]').exists(),
    ).toBe(false);
    expect(wrapper.find('[data-testid="calendar-later-match"]').exists()).toBe(
      false,
    );
  });

  it("marks every word as matching when no filter is set", async () => {
    const wrapper = await mountAt();
    expect(wrapper.find('[data-testid="calendar-summary"]').exists()).toBe(
      false,
    );
    expect(
      days(wrapper).every((d) => d.attributes("data-match") === undefined),
    ).toBe(true);
  });

  it("keeps the filters hidden until asked, then narrows by a chip", async () => {
    const wrapper = await mountAt();
    expect(wrapper.find('[data-testid="facet-level"]').exists()).toBe(false);

    await wrapper.find('[data-testid="filter-toggle"]').trigger("click");
    await wrapper.find('[data-testid="facet-tab-level"]').trigger("click");
    const n2 = wrapper
      .findAll('[data-testid="facet-level"] button')
      .find((b) => b.text().startsWith("N2"))!;
    await n2.trigger("click");
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({ query: { level: "N2" } });
    expect((global as any).$fetch).toHaveBeenLastCalledWith(
      "/api/word-calendar",
      { query: { level: "N2" } },
    );
    expect(
      wrapper.find('[data-testid="filter-count"]').text(),
    ).toContain("1 active");
  });

  it("fades the days that do not match, and still links them", async () => {
    const wrapper = await mountAt({ month: "2009-07", level: "N2" });

    const expected = exploreCalendar("2009-07", { level: ["N2"] }, TODAY);
    const matching = expected.days.filter((d) => d.match).length;
    const open = days(wrapper);
    expect(
      open.filter((d) => d.attributes("data-match") === "true"),
    ).toHaveLength(matching);
    const faded = open.find((d) => d.attributes("data-match") === "false")!;
    expect(faded.classes()).toContain("opacity-35");
    expect(faded.attributes("href")).toMatch(/^\/words\/2009-07-/);
    expect(faded.attributes("aria-label")).toContain("does not match");
    expect(wrapper.find('[data-testid="calendar-month-matches"]').text()).toBe(
      String(matching),
    );
    expect(wrapper.find('[data-testid="calendar-total-matches"]').text()).toBe(
      String(expected.count),
    );
  });

  it("opens the filters when the link already carries some", async () => {
    const wrapper = await mountAt({ level: "N5", stratum: "bogus" });
    expect(wrapper.find('[data-testid="facet-level"]').exists()).toBe(true);
    expect((global as any).$fetch).toHaveBeenCalledWith("/api/word-calendar", {
      query: { level: "N5" },
    });
  });

  it("clears the filters and keeps the month", async () => {
    const wrapper = await mountAt({ month: "2026-03", level: "N2" });
    await wrapper.find('[data-testid="explore-clear"]').trigger("click");
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({ query: { month: "2026-03" } });
  });
});
