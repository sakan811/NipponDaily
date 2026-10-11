import { test } from "./fixtures";
import { hydrated } from "./fixtures";

// TEMPORARY: reports what the Explore search box does in each engine, as the
// message of a failing test, so it can be read from the CI log. Removed once
// the Firefox failure is understood.
test("probe: explore search box", async ({ page }, info) => {
  test.skip(!["desktop", "firefox", "webkit"].includes(info.project.name));
  const logs: string[] = [];
  page.on("console", (m) =>
    logs.push(`${m.type()}: ${m.text().slice(0, 160)}`),
  );
  page.on("pageerror", (e) =>
    logs.push(`pageerror: ${e.message.slice(0, 160)}`),
  );

  await page.goto("/explore");
  await hydrated(page);
  const input = page.getByTestId("explore-search");
  const probe = () =>
    input.evaluate((el) => {
      const e = el as HTMLInputElement & {
        _vei?: Record<string, unknown>;
        _assign?: unknown;
      };
      return {
        value: e.value,
        connected: e.isConnected,
        count: document.querySelectorAll('[data-testid="explore-search"]')
          .length,
        vei: Object.keys(e._vei ?? {}),
        assign: typeof e._assign,
        url: location.href,
      };
    });

  const out: Record<string, unknown> = { before: await probe() };

  await input.evaluate((el) => {
    const w = window as unknown as { __ev: string[] };
    w.__ev = [];
    for (const t of [
      "input",
      "change",
      "compositionstart",
      "compositionend",
      "keydown",
    ])
      el.addEventListener(
        t,
        (e) => w.__ev.push(`${t}:${(e as InputEvent).isComposing ?? ""}`),
        true,
      );
  });

  await input.fill("hello");
  await page.waitForTimeout(1200);
  out.afterFill = await probe();
  out.eventsAfterFill = await page.evaluate(
    () => (window as unknown as { __ev: string[] }).__ev,
  );

  await input.evaluate((el) => {
    const e = el as HTMLInputElement;
    e.value = "world";
    e.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForTimeout(1200);
  out.afterDispatch = await probe();

  await input.pressSequentially("ab", { delay: 50 });
  await page.waitForTimeout(1200);
  out.afterTyping = await probe();
  out.logs = logs.slice(0, 12);

  throw new Error(`PROBE ${info.project.name} ${JSON.stringify(out)}`);
});
