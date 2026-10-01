import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import WordsPage from "~/app/pages/words/index.vue";
import { calendarForMonth } from "~~/shared/words";

const calendarPayload = (today: string) => ({
  success: true,
  data: {
    month: "2026-10",
    months: ["2026-10"],
    today,
    days: calendarForMonth("2026-10", today),
  },
  timestamp: "2026-10-01T00:00:00Z",
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
