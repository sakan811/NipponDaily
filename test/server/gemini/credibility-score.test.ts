import { describe, it, expect, beforeEach } from "vitest";

import { getService, createMockNews } from "./setup";
import { mockGenerateContent } from "../../setup";

describe("GeminiService - Credibility Score", () => {
  let service: any;

  beforeEach(async () => {
    service = await getService();
  });

  it("processes credibility scores from AI response", async () => {
    const mockNews = createMockNews();
    mockGenerateContent.mockResolvedValue({
      text: '[{"category": "Technology", "summary": "AI summary", "sourceReputation": 0.9, "domainTrust": 0.8, "contentQuality": 0.7, "aiConfidence": 0.8}]',
    });

    const result = await service.categorizeNewsItems(mockNews, {
      apiKey: "test-api-key",
    });

    expect(result[0].credibilityScore).toBeDefined();
    expect(result[0].credibilityScore).toBeCloseTo(0.81, 2); // (0.9*0.3)+(0.8*0.3)+(0.7*0.2)+(0.8*0.2) = 0.27+0.24+0.14+0.16 = 0.81
    expect(result[0].credibilityMetadata).toEqual({
      sourceReputation: 0.9,
      domainTrust: 0.8,
      contentQuality: 0.7,
      aiConfidence: 0.8,
    });
  });

  it("handles missing credibility scores with defaults", async () => {
    const mockNews = createMockNews();
    mockGenerateContent.mockResolvedValue({
      text: '[{"category": "Technology", "summary": "AI summary"}]',
    });

    const result = await service.categorizeNewsItems(mockNews, {
      apiKey: "test-api-key",
    });

    expect(result[0].credibilityScore).toBeDefined();
    expect(result[0].credibilityScore).toBeCloseTo(0.5, 2); // (0.5*0.3)+(0.5*0.3)+(0.5*0.2)+(0.5*0.2) = 0.15+0.15+0.1+0.1 = 0.5
    expect(result[0].credibilityMetadata).toEqual({
      sourceReputation: 0.5,
      domainTrust: 0.5,
      contentQuality: 0.5,
      aiConfidence: 0.5,
    });
  });

  it("clamps credibility scores to 0-1 range", async () => {
    const mockNews = createMockNews();
    mockGenerateContent.mockResolvedValue({
      text: '[{"category": "Technology", "summary": "AI summary", "sourceReputation": 1.5, "domainTrust": -0.2, "contentQuality": 2, "aiConfidence": 0}]',
    });

    const result = await service.categorizeNewsItems(mockNews, {
      apiKey: "test-api-key",
    });

    expect(result[0].credibilityMetadata).toEqual({
      sourceReputation: 1, // Clamped to 1
      domainTrust: 0, // Clamped to 0
      contentQuality: 1, // Clamped to 1
      aiConfidence: 0, // Already valid
    });
  });

  it("provides default credibility scores when AI fails", async () => {
    const mockNews = createMockNews();
    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    const result = await service.categorizeNewsItems(mockNews, {
      apiKey: "test-api-key",
    });

    expect(result[0].credibilityScore).toBeDefined();
    expect(result[0].credibilityMetadata).toBeDefined();
    expect(result[0].credibilityMetadata!.aiConfidence).toBe(0.3); // Lower confidence when AI fails
  });
});
