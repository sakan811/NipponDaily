import { describe, it, expect, beforeEach, vi } from "vitest";

import { getHandler, setupDefaults, mockGetStories } from "./setup";

describe("News API - Error Handling", () => {
  let handler: any;

  beforeEach(async () => {
    setupDefaults();
    handler = await getHandler();
  });

  it("handles service errors", async () => {
    const error = new Error("Service error");
    (global as any).getQuery.mockReturnValue({ language: "en" });
    mockGetStories.mockRejectedValue(error);

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: { error: "Service error" },
    });
  });

  it("logs errors in development environment", async () => {
    process.env.NODE_ENV = "development";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Dev error");
    (global as any).getQuery.mockReturnValue({ language: "en" });
    mockGetStories.mockRejectedValue(error);

    try {
      await handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      });
    } catch {
      // Expected error - no action needed
    }

    expect(consoleSpy).toHaveBeenCalledWith("News API error:", error);
    consoleSpy.mockRestore();
  });

  it("handles non-Error objects in error handling", async () => {
    (global as any).getQuery.mockReturnValue({ language: "en" });
    mockGetStories.mockRejectedValue("String error message");

    await expect(
      handler({
        node: {
          req: {
            socket: { remoteAddress: "127.0.0.1" },
            headers: {},
          },
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Failed to fetch news",
      data: { error: "Unknown error occurred" },
    });
  });
});
