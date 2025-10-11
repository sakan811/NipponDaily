import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JapanNewsReader from '~/app/components/JapanNewsReader.vue'
import type { NewsItem } from '~/types/index'
import { NEWS_CATEGORIES } from '~/constants/categories'

// Mock NewsCard component
const NewsCardMock = {
  name: 'NewsCard',
  props: ['news'],
  template: '<div class="news-card-mock">{{ news.title }}</div>'
}

vi.mock('~/app/components/NewsCard.vue', () => ({
  default: NewsCardMock
}))

// Import the global mock fetch
const { $fetch: mockFetch } = global as any

describe('JapanNewsReader', () => {
  const mockNewsData: NewsItem[] = [
    {
      title: 'Test News 1',
      summary: 'Summary 1',
      content: 'Content 1',
      source: 'Source 1',
      publishedAt: '2024-01-15T10:00:00Z',
      category: 'Technology'
    },
    {
      title: 'Test News 2',
      summary: 'Summary 2',
      content: 'Content 2',
      source: 'Source 2',
      publishedAt: '2024-01-15T11:00:00Z',
      category: 'Business'
    }
  ]

  const createWrapper = () => {
    return mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock
        }
      }
    })
  }

  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders correctly with initial state', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('NipponDaily')
    expect(wrapper.text()).toContain('Get News')
    expect(wrapper.text()).toContain('Last updated: Never')
    expect(wrapper.text()).toContain('No news loaded yet')
  })

  it('displays all category buttons', () => {
    const wrapper = createWrapper()

    NEWS_CATEGORIES.forEach(category => {
      expect(wrapper.text()).toContain(category.name)
    })
  })

  it('shows loading skeleton when loading news', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves

    const wrapper = createWrapper()

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Getting...')
    expect(wrapper.text()).not.toContain('No news loaded yet')
  })

  it('displays news after successful fetch', async () => {
    mockFetch.mockResolvedValue({
      data: mockNewsData
    })

    const wrapper = createWrapper()

    await wrapper.find('button').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10)) // Wait for async operations
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain(mockNewsData[0].title)
    expect(wrapper.text()).toContain(mockNewsData[1].title)
    expect(wrapper.text()).not.toContain('No news loaded yet')
  })

  it('filters news by selected category', async () => {
    mockFetch.mockResolvedValue({
      data: mockNewsData
    })

    const wrapper = createWrapper()

    // Fetch news first
    await wrapper.find('button').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10)) // Wait for async operations
    await wrapper.vm.$nextTick()

    // Select Technology category
    const techButton = wrapper.findAll('button').find(btn => btn.text() === 'Technology')
    await techButton.trigger('click')
    await wrapper.vm.$nextTick()

    const newsCards = wrapper.findAll('.news-card-mock')
    expect(newsCards).toHaveLength(1)
    expect(newsCards[0].text()).toContain('Test News 1')
  })

  it('shows all news when "All News" category is selected', async () => {
    mockFetch.mockResolvedValue({
      data: mockNewsData
    })

    const wrapper = createWrapper()

    // Fetch news first
    await wrapper.find('button').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10)) // Wait for async operations
    await wrapper.vm.$nextTick()

    // Select Technology category first
    const techButton = wrapper.findAll('button').find(btn => btn.text() === 'Technology')
    await techButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Then select All News
    const allNewsButton = wrapper.findAll('button').find(btn => btn.text() === 'All News')
    await allNewsButton.trigger('click')
    await wrapper.vm.$nextTick()

    const newsCards = wrapper.findAll('.news-card-mock')
    expect(newsCards).toHaveLength(2)
  })

  it('displays error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch news'
    mockFetch.mockRejectedValue({
      data: { error: errorMessage }
    })

    const wrapper = createWrapper()

    await wrapper.find('button').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10)) // Wait for async operations
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain(errorMessage)
    expect(wrapper.text()).toContain('Try Again')
  })

  it('updates last updated timestamp after successful fetch', async () => {
    mockFetch.mockResolvedValue({
      data: mockNewsData
    })

    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Last updated: Never')

    await wrapper.find('button').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10)) // Wait for async operations
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Last updated: Never')
  })

  it('disables button during loading', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves

    const wrapper = createWrapper()
    const button = wrapper.find('button')

    expect(button.attributes('disabled')).toBeUndefined()

    await button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(button.attributes('disabled')).toBeDefined()
  })

  it('can retry fetching news after error', async () => {
    mockFetch
      .mockRejectedValueOnce({ data: { error: 'Failed to fetch news' } })
      .mockResolvedValueOnce({ data: mockNewsData })

    const wrapper = createWrapper()

    // First attempt fails
    await wrapper.find('button').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10)) // Wait for async operations
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Failed to fetch news')

    // Retry succeeds
    const retryButton = wrapper.findAll('button').find(btn => btn.text() === 'Try Again')
    await retryButton.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10)) // Wait for async operations
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain(mockNewsData[0].title)
  })
})