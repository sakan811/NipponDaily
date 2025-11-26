import type { CategoryName } from "../constants/categories";

export interface CredibilityMetadata {
  sourceReputation: number; // 0-1 score based on source reputation
  domainTrust: number; // 0-1 score based on domain authority
  contentQuality: number; // 0-1 score based on AI assessment of content quality
  aiConfidence: number; // 0-1 score based on AI confidence in categorization/summarization
}

export interface NewsItem {
  title: string;
  summary: string;
  content: string;
  rawContent?: string;
  source: string;
  publishedAt: string;
  category: CategoryName;
  url?: string;
  credibilityScore?: number; // Overall 0-1 credibility score
  credibilityMetadata?: CredibilityMetadata; // Detailed breakdown of credibility factors
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}
