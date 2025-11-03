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
})