import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RichText from "~/app/components/RichText.vue";

const render = (text: string) => mount(RichText, { props: { text } });

describe("RichText", () => {
  it("renders plain text as it is", () => {
    expect(render("just words").text()).toBe("just words");
  });

  it("renders `code` spans as <code>", () => {
    const w = render("a `400` and a `404`");
    expect(w.findAll("code").map((c) => c.text())).toEqual(["400", "404"]);
    expect(w.text()).toBe("a 400 and a 404");
  });

  it("renders [text](url) as an external link", () => {
    const a = render("see [the docs](https://example.com/x) now").find("a");
    expect(a.text()).toBe("the docs");
    expect(a.attributes("href")).toBe("https://example.com/x");
    expect(a.attributes("rel")).toBe("noopener");
  });

  it("mixes links, code and text in order", () => {
    const w = render("`a` then [b](https://e.com) then c");
    expect(w.text()).toBe("a then b then c");
    expect(w.find("code").text()).toBe("a");
    expect(w.find("a").text()).toBe("b");
  });
});
