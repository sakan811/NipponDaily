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
  source: string;
  publishedAt: string;
  category: CategoryName;
  url?: string;
  favicon?: string;
  credibilityScore?: number; // Overall 0-1 credibility score
  credibilityMetadata?: CredibilityMetadata; // Detailed breakdown of credibility factors
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}

// --- NEW TYPES FOR SYNTHESIZED BRIEFING ---

export interface BriefingSource {
  title: string;
  source: string;
  url?: string;
  favicon?: string;
  credibilityScore: number;
  regions?: string[];
}

export interface NewsBriefing {
  mainHeadline: string;
  executiveSummary: string;
  thematicAnalysis: string;
  overallCredibilityScore: number;
  sourcesProcessed: BriefingSource[];
  isAiFallback?: boolean;
  publishTimeRange?: string;
  regionsAffected?: string[];
}

// --- CLUSTERED STORIES & LONG-TERM TRENDS ---

export interface StorySource {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  favicon?: string;
  credibilityScore: number;
  regions: string[];
  addedAt: number; // timestamp in ms
  category?: string;
}

export interface Story {
  id: string;
  headlineEn: string;
  headlineJa: string;
  summaryEn: string;
  summaryJa: string;
  thematicAnalysisEn: string;
  thematicAnalysisJa: string;
  articleCount: number;
  regionBreakdown: Record<string, number>; // region_name -> count of sources
  firstSeen: number; // timestamp ms
  lastUpdated: number; // timestamp ms
  trendScore: number;
  sources: StorySource[];
  categories: string[];
}

