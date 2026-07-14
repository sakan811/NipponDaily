import { describe, it, expect, vi, beforeEach } from "vitest";
import { readBody } from "h3";
import regroupHandler from "../../../server/api/regroup.post";

// Mock services with hoisted mocks to prevent Vitest hoisting error
const {
  mockGetStories,
  mockClearAllStories,
  mockSaveStory,
  mockUpdateVelocityScores,
  mockSetLastIngestTime,
  mockGetAllArticles,
  mockUpdateArticleStory,
  mockRegroupStories,
} = vi.hoisted(() => ({
  mockGetStories: vi.fn(),
  mockClearAllStories: vi.fn(),
  mockSaveStory: vi.fn(),
  mockUpdateVelocityScores: vi.fn(),
  mockSetLastIngestTime: vi.fn(),
  mockGetAllArticles: vi.fn(),
  mockUpdateArticleStory: vi.fn(),
  mockRegroupStories: vi.fn(),
}));

vi.mock("~/server/services/stories", () => ({
  storiesService: {
    getStories: mockGetStories,
    clearAllStories: mockClearAllStories,
    saveStory: mockSaveStory,
    updateVelocityScores: mockUpdateVelocityScores,
    setLastIngestTime: mockSetLastIngestTime,
  },
}));

vi.mock("~/server/services/vector", () => ({
  upstashVectorService: {
    getAllArticles: mockGetAllArticles,
    updateArticleStory: mockUpdateArticleStory,
  },
}));

vi.mock("~/server/services/gemini", () => ({
  geminiService: {
    regroupStories: mockRegroupStories,
  },
}));

describe("Regroup API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles dryRun: true successfully without persisting changes", async () => {
    // Mock input body
    vi.mocked(readBody).mockResolvedValueOnce({ dryRun: true });

    // Mock services return values
    const mockStories = [
      {
        id: "story-1",
        headline: "Original Headline",
        summary: "Original Summary",
        categories: ["society"],
        sources: [
          {
            title: "Article 1",
            source: "NHK",
            url: "https://example.com/1",
            publishedAt: "2026-07-14",
            regions: [],
          },
        ],
      },
    ];
    mockGetStories.mockResolvedValueOnce(mockStories);
    mockGetAllArticles.mockResolvedValueOnce([]);

    // Mock Gemini regrouping response
    mockRegroupStories.mockResolvedValueOnce({
      stories: [
        {
          storyId: "story-1",
          headline: "Regrouped Headline",
          summary: "Regrouped Summary",
          thematicAnalysis: "Thematic",
          categories: ["society"],
          regionsAffected: ["Tokyo"],
          overallCredibilityScore: 0.9,
          articleUrls: ["https://example.com/1"],
        },
      ],
    });

    const response = await regroupHandler({} as any);

    expect(response.success).toBe(true);
    expect(response.dryRun).toBe(true);
    expect(response.originalStoriesCount).toBe(1);
    expect(response.newStoriesCount).toBe(1);
    expect(response.data[0].headline).toBe("Regrouped Headline");

    // Ensure database writing operations were NOT called
    expect(mockClearAllStories).not.toHaveBeenCalled();
    expect(mockSaveStory).not.toHaveBeenCalled();
    expect(mockUpdateArticleStory).not.toHaveBeenCalled();
  });

  it("performs actual regroup and writes to databases when dryRun: false", async () => {
    vi.mocked(readBody).mockResolvedValueOnce({ dryRun: false });

    const mockStories = [
      {
        id: "story-1",
        headline: "Original Headline",
        summary: "Original Summary",
        categories: ["society"],
        sources: [
          {
            title: "Article 1",
            source: "NHK",
            url: "https://example.com/1",
            publishedAt: "2026-07-14",
            regions: [],
          },
        ],
      },
    ];
    mockGetStories.mockResolvedValueOnce(mockStories);
    mockGetAllArticles.mockResolvedValueOnce([]);

    mockRegroupStories.mockResolvedValueOnce({
      stories: [
        {
          storyId: "story-new",
          headline: "New Regrouped Headline",
          summary: "New Regrouped Summary",
          thematicAnalysis: "Thematic",
          categories: ["tech"],
          regionsAffected: ["Osaka"],
          overallCredibilityScore: 0.8,
          articleUrls: ["https://example.com/1"],
        },
      ],
    });

    const response = await regroupHandler({} as any);

    expect(response.success).toBe(true);
    expect(response.dryRun).toBe(false);

    // Verify database operations
    expect(mockClearAllStories).toHaveBeenCalledTimes(1);
    expect(mockSaveStory).toHaveBeenCalledTimes(1);
    expect(mockSaveStory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "story-new",
        headline: "New Regrouped Headline",
        categories: ["tech"],
      }),
    );
    expect(mockUpdateArticleStory).toHaveBeenCalledTimes(1);
    expect(mockUpdateArticleStory).toHaveBeenCalledWith(
      "https://example.com/1",
      "story-new",
    );
    expect(mockUpdateVelocityScores).toHaveBeenCalledTimes(1);
    expect(mockSetLastIngestTime).toHaveBeenCalledTimes(1);
  });
});
