import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '~/app/app.vue'

// Mock components
const JapanNewsReaderMock = {
  name: 'JapanNewsReader',
  template: '<div class="japan-news-reader">JapanNewsReader</div>'
}

const NuxtRouteAnnouncerMock = {
  name: 'NuxtRouteAnnouncer',
  template: '<div class="route-announcer"></div>'
}

vi.mock('~/app/components/JapanNewsReader.vue', () => ({
  default: JapanNewsReaderMock
}))

vi.mock('#app/components/NuxtRouteAnnouncer', () => ({
  default: NuxtRouteAnnouncerMock
}))

const globalComponents = {
  JapanNewsReader: JapanNewsReaderMock,
  NuxtRouteAnnouncer: NuxtRouteAnnouncerMock
}

describe('App', () => {
  it('renders main layout with correct styling', () => {
    const wrapper = mount(App, { global: { components: globalComponents } })

    const mainContainer = wrapper.find('.min-h-screen')
    expect(mainContainer.exists()).toBe(true)
    expect(mainContainer.classes()).toContain('bg-gradient-to-br')
  })

  it('renders child components', () => {
    const wrapper = mount(App, { global: { components: globalComponents } })

    expect(wrapper.findComponent(JapanNewsReaderMock).exists()).toBe(true)
    expect(wrapper.findComponent(NuxtRouteAnnouncerMock).exists()).toBe(true)
  })
})