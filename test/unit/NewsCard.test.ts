import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsCard from '~/app/components/NewsCard.vue'
import type { NewsItem } from '~/types/index'
import type { CategoryName } from '~/constants/categories'

describe('NewsCard', () => {
  const mockNews: NewsItem = {
    title: 'Test News Article',
    summary: 'This is a test summary of the news article',
    content: 'This is the full content of the news article with more details',
    source: 'Test News Network',
    publishedAt: '2024-01-15T10:30:00Z',
    category: 'Technology' as CategoryName,
    url: 'https://example.com/news/test-article'
  }

  it('renders news information correctly', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews }
    })

    expect(wrapper.text()).toContain(mockNews.title)
    expect(wrapper.text()).toContain(mockNews.summary)
    expect(wrapper.text()).toContain(mockNews.source)
    expect(wrapper.text()).toContain(mockNews.category)
  })

  it('applies correct category badge class', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews }
    })

    const categoryBadge = wrapper.find('span[class*="badge-"]')
    expect(categoryBadge.exists()).toBe(true)
    expect(categoryBadge.text()).toContain(mockNews.category)
  })

  it('formats date correctly', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews }
    })

    expect(wrapper.text()).toContain('Jan 15, 2024')
  })

  it('renders original article link when URL is provided', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews }
    })

    const link = wrapper.find('a[href="https://example.com/news/test-article"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Read Original')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('handles missing URL gracefully', () => {
    const newsWithoutUrl = { ...mockNews, url: undefined }
    const wrapper = mount(NewsCard, {
      props: { news: newsWithoutUrl }
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(false)
  })

  it('applies fallback category class for unknown categories', () => {
    const newsWithUnknownCategory = { ...mockNews, category: 'Unknown Category' }
    const wrapper = mount(NewsCard, {
      props: { news: newsWithUnknownCategory }
    })

    const categoryBadge = wrapper.find('span[class*="badge-"], span.bg-gray-100')
    expect(categoryBadge.exists()).toBe(true)
    expect(categoryBadge.classes()).toContain('bg-gray-100')
  })

  it('handles invalid date format', () => {
    const newsWithInvalidDate = { ...mockNews, publishedAt: 'invalid-date' }
    const wrapper = mount(NewsCard, {
      props: { news: newsWithInvalidDate }
    })

    expect(wrapper.text()).toContain('Unknown date')
  })
})