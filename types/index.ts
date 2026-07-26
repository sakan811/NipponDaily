import type { CategoryName } from "../constants/categories";

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
}

export interface NewsBriefing {
  mainHeadline: string;
  executiveSummary: string;
  thematicAnalysis: string;
  overallCredibilityScore: number;
  sourcesProcessed: BriefingSource[];
  isAiFallback?: boolean;
  publishTimeRange?: string;
}

// --- CLUSTERED STORIES & LONG-TERM TRENDS ---

export interface StorySource {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  favicon?: string;
  credibilityScore: number;
  addedAt: number; // timestamp in ms
  category?: string;
}

export interface Story {
  id: string;
  headline: string;
  summary: string;
  thematicAnalysis: string;
  articleCount: number;
  firstSeen: number; // timestamp ms
  lastUpdated: number; // timestamp ms
  trendScore: number;
  sources: StorySource[];
  categories: string[];
  isSummarized?: boolean;
}
