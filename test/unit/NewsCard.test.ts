import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsCard from '~/app/components/NewsCard.vue'

const mockNews = {
  title: 'Test News Article',
  summary: 'This is a test summary',
  content: 'Full content here',
  source: 'Test News Network',
  publishedAt: '2024-01-15T10:30:00Z',
  category: 'Technology',
  url: 'https://example.com/news/test-article'
}

describe('NewsCard', () => {
  it('renders news information correctly', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews }
    })

    expect(wrapper.text()).toContain(mockNews.title)
    expect(wrapper.text()).toContain(mockNews.summary)
    expect(wrapper.text()).toContain(mockNews.source)
    expect(wrapper.text()).toContain(mockNews.category)
  })

  it('displays formatted date', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews }
    })

    expect(wrapper.text()).toContain('Jan 15, 2024')
  })

  it('renders external link when URL is provided', () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews }
    })

    const link = wrapper.find('a[href="https://example.com/news/test-article"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('target')).toBe('_blank')
  })

  it('handles missing URL gracefully', () => {
    const newsWithoutUrl = { ...mockNews, url: undefined }
    const wrapper = mount(NewsCard, {
      props: { news: newsWithoutUrl }
    })

    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('handles invalid date formats', () => {
    const newsWithInvalidDate = { ...mockNews, publishedAt: 'invalid-date' }
    const wrapper = mount(NewsCard, {
      props: { news: newsWithInvalidDate }
    })

    expect(wrapper.text()).toContain('Unknown date')
  })

  it('handles date parsing exceptions', () => {
    // Mock Date constructor to throw an exception
    const originalDate = global.Date
    global.Date = class extends Date {
      constructor(...args: any[]) {
        if (args[0] === 'problematic-date') {
          throw new Error('Invalid date')
        }
        return new originalDate(...args)
      }
    }

    const newsWithProblematicDate = {
      ...mockNews,
      publishedAt: 'problematic-date'
    }
    const wrapper = mount(NewsCard, {
      props: { news: newsWithProblematicDate }
    })

    expect(wrapper.text()).toContain('Unknown date')

    // Restore original Date constructor
    global.Date = originalDate
  })

  it('applies correct category color classes', () => {
    const testCases = [
      { category: 'Politics', expectedClass: 'badge-politics' },
      { category: 'Business', expectedClass: 'badge-business' },
      { category: 'Technology', expectedClass: 'badge-technology' },
      { category: 'Culture', expectedClass: 'badge-culture' },
      { category: 'Sports', expectedClass: 'badge-sports' },
      { category: 'Unknown', expectedClass: 'bg-gray-100' },
      { category: 'Random', expectedClass: 'bg-gray-100' }
    ]

    testCases.forEach(({ category, expectedClass }) => {
      const newsWithCategory = { ...mockNews, category }
      const wrapper = mount(NewsCard, {
        props: { news: newsWithCategory }
      })

      const categoryBadge = wrapper.find('span.inline-block')
      const classes = categoryBadge.classes()
      expect(classes.some(cls => cls.includes(expectedClass.split(' ')[0]))).toBe(true)
    })
  })

  it('handles empty/null URL gracefully', () => {
    const newsWithNullUrl = { ...mockNews, url: null }
    const wrapper = mount(NewsCard, {
      props: { news: newsWithNullUrl }
    })

    expect(wrapper.find('a').exists()).toBe(false)
  })
})