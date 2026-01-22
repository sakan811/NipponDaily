import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

import JapanNewsReader from "~/app/components/JapanNewsReader.vue";
import { NewsCardMock, mockNews } from "./setup";

describe("JapanNewsReader - v-model Bindings", () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn().mockResolvedValue({
      success: true,
      data: mockNews,
      count: 2,
      timestamp: "2024-01-15T10:00:00Z",
    });
    (global as any).$fetch = mockFetch;
  });

  it("covers v-model binding on desktop ULocaleSelect", async () => {
    // Use custom stub that properly emits update:modelValue
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    // Verify initial value
    expect(wrapper.vm.targetLanguage).toBe("en");

    // Find desktop select by id
    const desktopSelect = wrapper.find("select#targetLanguage");
    expect(desktopSelect.exists()).toBe(true);

    // Trigger change event on desktop select (covers line 37 v-model)
    await desktopSelect.setValue("ja");
    await vi.waitFor(() => wrapper.vm.targetLanguage === "ja");

    expect(wrapper.vm.targetLanguage).toBe("ja");
  });

  it("covers v-model binding on mobile ULocaleSelect", async () => {
    // Use custom stub that properly emits update:modelValue
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    // Verify initial value
    expect(wrapper.vm.targetLanguage).toBe("en");

    // Find mobile select by id
    const mobileSelect = wrapper.find("select#mobileTargetLanguage");
    expect(mobileSelect.exists()).toBe(true);

    // Trigger change event on mobile select (covers line 87 v-model)
    await mobileSelect.setValue("fr");
    await vi.waitFor(() => wrapper.vm.targetLanguage === "fr");

    expect(wrapper.vm.targetLanguage).toBe("fr");
  });

  it("both desktop and mobile language selects sync with targetLanguage", async () => {
    // Use custom stub that properly emits update:modelValue
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    const desktopSelect = wrapper.find("select#targetLanguage");
    const mobileSelect = wrapper.find("select#mobileTargetLanguage");

    expect(desktopSelect.exists()).toBe(true);
    expect(mobileSelect.exists()).toBe(true);

    // Change desktop select - should update targetLanguage (line 37)
    await desktopSelect.setValue("de");
    await vi.waitFor(() => wrapper.vm.targetLanguage === "de");
    expect(wrapper.vm.targetLanguage).toBe("de");

    // Change mobile select - should update targetLanguage (line 87)
    await mobileSelect.setValue("es");
    await vi.waitFor(() => wrapper.vm.targetLanguage === "es");
    expect(wrapper.vm.targetLanguage).toBe("es");
  });

  it("language select is disabled during loading", async () => {
    // Use custom stub that properly emits update:modelValue
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    const desktopSelect = wrapper.find("select#targetLanguage");
    const mobileSelect = wrapper.find("select#mobileTargetLanguage");

    // Initially not disabled
    expect(desktopSelect.attributes("disabled")).toBeUndefined();
    expect(mobileSelect.attributes("disabled")).toBeUndefined();

    // Mock delayed response
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const fetchPromise = wrapper.vm.refreshNews();
    await vi.waitFor(() => wrapper.vm.loading === true);

    // Should be disabled during loading
    expect(desktopSelect.attributes("disabled")).toBeDefined();
    expect(mobileSelect.attributes("disabled")).toBeDefined();

    await fetchPromise;

    // Should be enabled again
    expect(desktopSelect.attributes("disabled")).toBeUndefined();
    expect(mobileSelect.attributes("disabled")).toBeUndefined();
  });

  it("uses current language value when Get News button is clicked", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    // Change language to Spanish (locale code "es")
    // The locale.name for "es" is "Español"
    wrapper.vm.targetLanguage = "es";
    await vi.waitFor(() => wrapper.vm.targetLanguage === "es");

    // Find and click Get News button (not UColorModeButton)
    const getNewsButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Get News"));
    expect(getNewsButton).toBeDefined();
    await getNewsButton?.trigger("click");

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: undefined,
        timeRange: "week",
        language: "Español",
        limit: 10,
      },
    });
  });

  it("disables both input and button during loading state", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    // Find the Get News button (not UColorModeButton)
    const getNewsButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Get News"));
    expect(getNewsButton).toBeDefined();

    // Mock delayed response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: mockNews,
                count: 2,
                timestamp: "2024-01-15T10:00:00Z",
              }),
            100,
          ),
        ),
    );

    // Start loading by clicking button
    const fetchPromise = wrapper.vm.refreshNews();
    await vi.waitFor(() => wrapper.vm.loading === true);

    // Check that loading state is true (this disables both input and button)
    expect(wrapper.vm.loading).toBe(true);
    expect(getNewsButton?.attributes("disabled")).toBeDefined();
    expect(getNewsButton?.text()).toContain("Getting...");

    // Wait for fetch to complete
    await fetchPromise;

    // Both should be enabled again
    expect(wrapper.vm.loading).toBe(false);
    expect(getNewsButton?.attributes("disabled")).toBeUndefined();
    expect(getNewsButton?.text()).toContain("Get News");
  });
});
