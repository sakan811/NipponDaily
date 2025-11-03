import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import JapanNewsReader from '~/app/components/JapanNewsReader.vue'

const NewsCardMock = {
  name: 'NewsCard',
  props: ['news'],
  template: '<div class="news-card">{{ news.title }}</div>'
}

vi.mock('~/app/components/NewsCard.vue', () => ({
  default: NewsCardMock
}))

const mockNews = [
  {
    title: 'Tech News',
    summary: 'Tech Summary',
    content: 'Tech Content',
    source: 'Tech Source',
    publishedAt: '2024-01-15T10:00:00Z',
    category: 'Technology'
  }
]

describe('JapanNewsReader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const mockFetch = vi.fn().mockResolvedValue({
      success: true,
      data: mockNews,
      count: 1,
      timestamp: '2024-01-15T10:00:00Z'
    })
    global.$fetch = mockFetch
  })

  it('renders main component structure', () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock
        }
      }
    })

    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('renders get news button', () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock
        }
      }
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Get News')
  })

  it('renders category filter buttons', () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock
        }
      }
    })

    const categoryButtons = wrapper.findAll('button')
    expect(categoryButtons.length).toBeGreaterThan(1)
  })

  it('has news loading functionality', () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock
        }
      }
    })

    expect(wrapper.vm.refreshNews).toBeDefined()
    expect(typeof wrapper.vm.refreshNews).toBe('function')
  })
})