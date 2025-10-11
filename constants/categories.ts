export const NEWS_CATEGORIES = [
  { id: 'all', name: 'All News' },
  { id: 'politics', name: 'Politics' },
  { id: 'business', name: 'Business' },
  { id: 'technology', name: 'Technology' },
  { id: 'culture', name: 'Culture' },
  { id: 'sports', name: 'Sports' }
] as const

export const VALID_CATEGORIES = [
  'Politics',
  'Business',
  'Technology',
  'Culture',
  'Sports',
  'Other'
] as const

export type CategoryId = typeof NEWS_CATEGORIES[number]['id']
export type CategoryName = typeof VALID_CATEGORIES[number]