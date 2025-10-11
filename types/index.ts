import type { CategoryName } from '../constants/categories'

export interface NewsItem {
  title: string
  summary: string
  content: string
  source: string
  publishedAt: string
  category: CategoryName
  url?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  count?: number
  timestamp: string
}