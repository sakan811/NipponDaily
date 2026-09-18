import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DailyGameBoard from "~/app/components/DailyGameBoard.vue";
import { makeDailyGame, makeQuestion, mockFetchGame } from "./setup";

async function loadGame(wrapper: ReturnType<typeof mount>) {
  await wrapper.vm.fetchGame();
  await wrapper.vm.$nextTick();
}

function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll("button").find((b) => b.text() === text);
}

describe("DailyGameBoard gameplay", () => {
  it("answering correctly increases score and streak", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard);
    await loadGame(wrapper);

    const correct = wrapper.vm.currentQuestion.correctAnswer;
    await findButtonByText(wrapper, correct)!.trigger("click");

    expect(wrapper.vm.score).toBe(10);
    expect(wrapper.vm.streak).toBe(1);
    expect(wrapper.text()).toContain("Correct!");
  });

  it("answering incorrectly resets streak and reveals the correct answer", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard);
    await loadGame(wrapper);

    const question = wrapper.vm.currentQuestion;
    const wrong = question.choices.find(
      (c: string) => c !== question.correctAnswer,
    );
    await findButtonByText(wrapper, wrong!)!.trigger("click");

    expect(wrapper.vm.score).toBe(0);
    expect(wrapper.vm.streak).toBe(0);
    expect(wrapper.text()).toContain(question.correctAnswer);
  });

  it("advancing after the last question shows the round summary", async () => {
    mockFetchGame(makeDailyGame([makeQuestion()]));
    const wrapper = mount(DailyGameBoard);
    await loadGame(wrapper);

    const correct = wrapper.vm.currentQuestion.correctAnswer;
    await findButtonByText(wrapper, correct)!.trigger("click");
    wrapper.vm.advance();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isFinished).toBe(true);
    expect(wrapper.text()).toContain("Round Complete!");
  });

  it("Play Again resets score and index back to the first question", async () => {
    mockFetchGame(makeDailyGame([makeQuestion()]));
    const wrapper = mount(DailyGameBoard);
    await loadGame(wrapper);

    const correct = wrapper.vm.currentQuestion.correctAnswer;
    await findButtonByText(wrapper, correct)!.trigger("click");
    wrapper.vm.advance();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isFinished).toBe(true);

    wrapper.vm.restart();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.score).toBe(0);
    expect(wrapper.vm.isFinished).toBe(false);
  });

  it("disables choice buttons after answering, so a second click can't double-score", async () => {
    mockFetchGame(makeDailyGame());
    const wrapper = mount(DailyGameBoard);
    await loadGame(wrapper);

    const correct = wrapper.vm.currentQuestion.correctAnswer;
    const button = findButtonByText(wrapper, correct)!;
    await button.trigger("click");
    await button.trigger("click");

    expect(wrapper.vm.score).toBe(10);
  });
});
