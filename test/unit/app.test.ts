import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '~/app/app.vue'

// Mock JapanNewsReader component
const JapanNewsReaderMock = {
  name: 'JapanNewsReader',
  template: '<div class="japan-news-reader-mock">JapanNewsReader Component</div>'
}

// Mock NuxtRouteAnnouncer component
const NuxtRouteAnnouncerMock = {
  name: 'NuxtRouteAnnouncer',
  template: '<div class="route-announcer-mock"></div>'
}

vi.mock('~/app/components/JapanNewsReader.vue', () => ({
  default: JapanNewsReaderMock
}))

vi.mock('#app/components/NuxtRouteAnnouncer', () => ({
  default: NuxtRouteAnnouncerMock
}))

describe('App', () => {
  it('renders the root application structure correctly', () => {
    const wrapper = mount(App, {
      global: {
        components: {
          JapanNewsReader: JapanNewsReaderMock,
          NuxtRouteAnnouncer: NuxtRouteAnnouncerMock
        }
      }
    })

    // Test the main container exists
    const mainContainer = wrapper.find('.min-h-screen')
    expect(mainContainer.exists()).toBe(true)

    // Test the gradient background classes
    expect(mainContainer.classes()).toContain('bg-gradient-to-br')
    expect(mainContainer.classes()).toContain('from-(--color-yuki)')
    expect(mainContainer.classes()).toContain('to-(--color-mizu)')
  })

  it('renders NuxtRouteAnnouncer component', () => {
    const wrapper = mount(App, {
      global: {
        components: {
          JapanNewsReader: JapanNewsReaderMock,
          NuxtRouteAnnouncer: NuxtRouteAnnouncerMock
        }
      }
    })

    const routeAnnouncer = wrapper.findComponent(NuxtRouteAnnouncerMock)
    expect(routeAnnouncer.exists()).toBe(true)
  })

  it('renders JapanNewsReader component', () => {
    const wrapper = mount(App, {
      global: {
        components: {
          JapanNewsReader: JapanNewsReaderMock,
          NuxtRouteAnnouncer: NuxtRouteAnnouncerMock
        }
      }
    })

    const newsReader = wrapper.findComponent(JapanNewsReaderMock)
    expect(newsReader.exists()).toBe(true)
  })

  it('maintains correct component hierarchy', () => {
    const wrapper = mount(App, {
      global: {
        components: {
          JapanNewsReader: JapanNewsReaderMock,
          NuxtRouteAnnouncer: NuxtRouteAnnouncerMock
        }
      }
    })

    // Verify the DOM structure
    const mainContainer = wrapper.find('.min-h-screen')
    const routeAnnouncer = wrapper.findComponent(NuxtRouteAnnouncerMock)
    const newsReader = wrapper.findComponent(JapanNewsReaderMock)

    // Check that both components are within the main container
    expect(mainContainer.findComponent(NuxtRouteAnnouncerMock).exists()).toBe(true)
    expect(mainContainer.findComponent(JapanNewsReaderMock).exists()).toBe(true)
  })

  it('applies responsive and accessibility classes', () => {
    const wrapper = mount(App, {
      global: {
        components: {
          JapanNewsReader: JapanNewsReaderMock,
          NuxtRouteAnnouncer: NuxtRouteAnnouncerMock
        }
      }
    })

    const mainContainer = wrapper.find('.min-h-screen')

    // Test responsive design classes
    expect(mainContainer.classes()).toContain('min-h-screen')

    // Verify the container is accessible
    expect(mainContainer.element.tagName).toBe('DIV')
  })
})