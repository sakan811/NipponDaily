import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DailyGameBoard from "~/app/components/DailyGameBoard.vue";
import { makeDailyGame, makeQuestion, mockFetchGame } from "./setup";
import {
  FIRST_LESSON_BY_KANJI,
  LESSON_NUMBER_BY_WORD,
} from "~/app/data/lessons";

async function loadGame(wrapper: ReturnType<typeof mount>) {
  await wrapper.vm.fetchGame();
  await wrapper.vm.$nextTick();
}

function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll("button").find((b) => b.text() === text);
}

describe("DailyGameBoard gameplay", () => {
  it("answering correctly marks the question correct", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(wrapper);

    const correct = wrapper.vm.currentQuestion.correctAnswer;
    await findButtonByText(wrapper, correct)!.trigger("click");

    expect(wrapper.text()).toContain("Correct!");
  });

  it("answering incorrectly reveals the correct answer", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(wrapper);

    const question = wrapper.vm.currentQuestion;
    const wrong = question.choices.find(
      (c: string) => c !== question.correctAnswer,
    );
    await findButtonByText(wrapper, wrong!)!.trigger("click");

    expect(wrapper.text()).toContain(question.correctAnswer);
  });

  it("advancing after the last question shows the round summary", async () => {
    mockFetchGame(makeDailyGame([makeQuestion()]));
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(wrapper);

    const correct = wrapper.vm.currentQuestion.correctAnswer;
    await findButtonByText(wrapper, correct)!.trigger("click");
    wrapper.vm.advance();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isFinished).toBe(true);
    expect(wrapper.text()).toContain("Round Complete!");
  });

  it("links missed kanji and vocab to the lesson that teaches them", async () => {
    mockFetchGame(
      makeDailyGame([
        makeQuestion({ id: "水", kind: "kanji", prompt: "水" }),
        makeQuestion({
          id: "これ",
          kind: "vocab",
          prompt: "これ",
          correctAnswer: "this one",
          choices: ["this one", "fire", "tree", "person"],
        }),
      ]),
    );
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(wrapper);

    for (let i = 0; i < 2; i++) {
      const q = wrapper.vm.currentQuestion;
      wrapper.vm.selectChoice(
        q.choices.find((c: string) => c !== q.correctAnswer)!,
      );
      wrapper.vm.advance();
    }
    await wrapper.vm.$nextTick();

    const links = wrapper
      .find('[data-testid="game-missed-lessons"]')
      .findAll("a")
      .map((a) => a.attributes("href"));
    expect(links).toEqual(
      expect.arrayContaining([
        `/learn/${FIRST_LESSON_BY_KANJI.get("水")}`,
        `/learn/${LESSON_NUMBER_BY_WORD.get("これ")}`,
      ]),
    );
  });

  it("Play Again resets progress back to the first question", async () => {
    mockFetchGame(makeDailyGame([makeQuestion()]));
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(wrapper);

    const correct = wrapper.vm.currentQuestion.correctAnswer;
    await findButtonByText(wrapper, correct)!.trigger("click");
    wrapper.vm.advance();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isFinished).toBe(true);

    wrapper.vm.restart();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.currentIndex).toBe(0);
    expect(wrapper.vm.isFinished).toBe(false);
  });

  it("disables choice buttons after answering, so a second click can't double-count", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(wrapper);

    const correct = wrapper.vm.currentQuestion.correctAnswer;
    const button = findButtonByText(wrapper, correct)!;
    await button.trigger("click");
    await button.trigger("click");

    expect(wrapper.vm.perKindStats[wrapper.vm.currentQuestion.kind].total).toBe(
      1,
    );
  });
});

describe("DailyGameBoard charms", () => {
  it("stamps the ema with a 合格 seal on a correct answer", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(wrapper);

    expect(wrapper.find(".ema .hanko").exists()).toBe(false);
    const correct = wrapper.vm.currentQuestion.correctAnswer;
    await findButtonByText(wrapper, correct)!.trigger("click");

    expect(wrapper.find(".ema .hanko").exists()).toBe(true);
    expect(wrapper.find(".ema").classes()).not.toContain("ema--shake");
  });

  it("shakes the ema without a seal on a wrong answer", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(wrapper);

    const question = wrapper.vm.currentQuestion;
    const wrong = question.choices.find(
      (c: string) => c !== question.correctAnswer,
    );
    await findButtonByText(wrapper, wrong!)!.trigger("click");

    expect(wrapper.find(".ema").classes()).toContain("ema--shake");
    expect(wrapper.find(".ema .hanko").exists()).toBe(false);
  });

  it("seals the round-complete charm 合格 or 努力 by accuracy", async () => {
    mockFetchGame(makeDailyGame([makeQuestion()]));
    const passed = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(passed);
    await findButtonByText(passed, "water")!.trigger("click");
    await findButtonByText(passed, "Next")!.trigger("click");
    expect(passed.find(".hanko").attributes("aria-label")).toBe("Passed");

    mockFetchGame(makeDailyGame([makeQuestion()]));
    const missed = mount(DailyGameBoard, { props: { autoFetch: false } });
    await loadGame(missed);
    await findButtonByText(missed, "fire")!.trigger("click");
    await findButtonByText(missed, "Next")!.trigger("click");
    expect(missed.find(".hanko").attributes("aria-label")).toBe(
      "Keep practising",
    );
  });
});
