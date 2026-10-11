import { test, hydrated } from "./fixtures";

// TEMPORARY: how long the Explore search takes to reach the URL, per value and
// engine, as the message of a failing test (read it in the CI log). Removed
// once the Firefox failure is understood.
test("probe: explore search latency", async ({ page }, info) => {
  test.skip(!["desktop", "firefox"].includes(info.project.name));
  test.setTimeout(120_000);
  const logs: string[] = [];
  page.on("pageerror", (e) =>
    logs.push(`pageerror: ${e.message.slice(0, 140)}`),
  );
  page.on("console", (m) => {
    if (m.type() !== "log") logs.push(`${m.type()}: ${m.text().slice(0, 120)}`);
  });
  const api: string[] = [];
  const t0 = Date.now();
  page.on("response", (r) => {
    if (r.url().includes("/api/explore"))
      api.push(
        `${Date.now() - t0}ms ${r.status()} ${decodeURIComponent(r.url()).slice(-40)}`,
      );
  });

  const body = await (await page.request.get("/api/daily-word")).json();
  const { term, meaning } = body.data.entry as {
    term: string;
    meaning: string;
  };
  const latin = /[\x20-\x7e]{3,40}/.exec(meaning)![0].trim();

  const out: Record<string, unknown> = { term, meaning };
  for (const [name, value] of [
    ["hello", "hello"],
    ["latin", latin],
    ["term", term],
  ] as const) {
    await page.goto("/explore");
    await hydrated(page);
    const start = Date.now();
    await page.getByTestId("explore-search").fill(value);
    const fillMs = Date.now() - start;
    let urlMs: number | string = "never (10s)";
    while (Date.now() - start < 10_000) {
      if (/[?&]q=/.test(page.url())) {
        urlMs = Date.now() - start;
        break;
      }
      await page.waitForTimeout(100);
    }
    out[name] = {
      fillMs,
      urlMs,
      value: await page.getByTestId("explore-search").inputValue(),
    };
  }
  out.api = api.slice(-10);
  out.logs = logs.slice(-12);
  throw new Error(`PROBE3 ${info.project.name} ${JSON.stringify(out)}`);
});
