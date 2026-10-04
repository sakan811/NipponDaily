import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useRoute, useRouter } from "#app";
import WordsPage from "~/app/pages/words/index.vue";
import { exploreCalendar } from "~~/shared/explore";
import { filtersFromQuery } from "~~/shared/explore-query";

const respond = (data: unknown) => ({
  success: true,
  data,
  timestamp: "2026-10-01T00:00:00Z",
});

/** A calendar holding only October 2026, as the API would answer it. */
const calendarPayload = (today: string) =>
  respond({
    ...exploreCalendar("2026-10", {}, today),
    months: ["2026-10"],
    monthCounts: { "2026-10": 31 },
  });

describe("Words Page (Calendar)", () => {
  beforeEach(() => {
    (global as any).$fetch.mockReset();
    (global as any).$fetch.mockResolvedValue(calendarPayload("2026-10-03"));
  });

  it("fetches the calendar and names the month", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    expect((global as any).$fetch).toHaveBeenCalledWith("/api/word-calendar", {
      query: {},
    });
    expect(wrapper.find('[data-testid="calendar-month"]').text()).toBe(
      "October 2026",
    );
  });

  it("shows a link with the word for each day that has arrived", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    const open = wrapper.findAll('[data-testid="calendar-day-open"]');
    expect(open).toHaveLength(3);
    expect(open[0]!.attributes("href")).toBe("/words/2026-10-01");
    expect(open[0]!.text()).toContain("電話");
    expect(open[0]!.text()).toContain("でんわ");
    expect(open[2]!.text()).toContain("手紙");
  });

  it("shows later days as closed, with no word and no link", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    const closed = wrapper.findAll('[data-testid="calendar-day-closed"]');
    expect(closed).toHaveLength(28);
    expect(closed[0]!.text()).toBe("4");
    expect(closed[0]!.element.tagName).not.toBe("A");
    // The fourth's word (パン) is nowhere in the page.
    expect(wrapper.text()).not.toContain("パン");
  });

  it("marks today", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    const open = wrapper.findAll('[data-testid="calendar-day-open"]');
    expect(open[2]!.classes().join(" ")).toContain("ring-2");
    expect(open[0]!.classes().join(" ")).not.toContain("ring-2");
  });

  it("starts the grid on the right weekday (Oct 1, 2026 is a Thursday)", async () => {
    const wrapper = mount(WordsPage);
    await flushPromises();

    const cells = wrapper.findAll('[role="gridcell"]');
    // Sun-first: four blanks (Sun-Wed) precede the 1st, then 31 days.
    expect(cells).toHaveLength(4 + 31);
    expect(cells[4]!.text()).toContain("1");
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
    (global as any).$fetch.mockResolvedValue(calendarPayload("2026-11-20"));
    const wrapper = mount(WordsPage);
    await flushPromises();

    expect(wrapper.findAll('[data-testid="calendar-day-open"]')).toHaveLength(
      31,
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
  const TODAY = "2026-03-08";
  const replace = vi.fn();

  /** Answers each request the way the API would, from the real entries. */
  const serve = () =>
    (global as any).$fetch.mockImplementation(
      async (_url: string, opts?: { query?: Record<string, string> }) => {
        const { month, ...rest } = opts?.query ?? {};
        return respond(
          exploreCalendar(month ?? "2026-03", filtersFromQuery(rest), TODAY),
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
    const wrapper = await mountAt({ month: "2026-03" });

    const years = wrapper.findAll('[data-testid="calendar-years"] button');
    expect(years.map((y) => y.text())).toEqual(
      expect.arrayContaining(["2022", "2023", "2024", "2026", "2027"]),
    );
    expect(years.map((y) => y.text())).not.toContain("2025");

    await wrapper.find('[data-testid="calendar-year-2024"]').trigger("click");
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({ query: { month: "2024-03" } });
    expect(wrapper.find('[data-testid="calendar-month"]').text()).toBe(
      "March 2024",
    );
  });

  /** Serves a catalogue with gaps: only these months have words. */
  const serveGaps = (counts: Record<string, number>) =>
    (global as any).$fetch.mockImplementation(
      async (_url: string, opts?: { query?: Record<string, string> }) =>
        respond({
          ...exploreCalendar(opts?.query?.month ?? "2026-03", {}, TODAY),
          month: opts?.query?.month ?? "2026-03",
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
    const wrapper = await mountAt({ month: "2026-03", level: "N5" });
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

    await wrapper
      .find('[data-testid="calendar-filter-toggle"]')
      .trigger("click");
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
      wrapper.find('[data-testid="calendar-filter-count"]').text(),
    ).toContain("1 active");
  });

  it("fades the days that do not match, and still links them", async () => {
    const wrapper = await mountAt({ month: "2026-03", level: "N2" });

    const expected = exploreCalendar("2026-03", { level: ["N2"] }, TODAY);
    const matching = expected.days.filter((d) => d.match).length;
    const open = days(wrapper);
    expect(
      open.filter((d) => d.attributes("data-match") === "true"),
    ).toHaveLength(matching);
    const faded = open.find((d) => d.attributes("data-match") === "false")!;
    expect(faded.classes()).toContain("opacity-35");
    expect(faded.attributes("href")).toMatch(/^\/words\/2026-03-/);
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
