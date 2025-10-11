export interface NewsItem {
  title: string
  summary: string
  content: string
  source: string
  publishedAt: string
  category: string
  url?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  count?: number
  timestamp: string
}

export interface Category {
  id: string
  name: string
}