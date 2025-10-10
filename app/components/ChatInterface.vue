<template>
  <div class="card shadow-xl">
    <!-- Chat Header -->
    <div class="bg-gradient-japan text-yuki p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 class="font-semibold">News Assistant</h3>
        </div>
        <button
          @click="clearChat"
          class="text-yuki hover:opacity-80 transition-opacity focus-ring"
          title="Clear chat"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <p class="text-sm text-yuki mt-1 font-medium opacity-90">
        Ask me anything about today's Japan news!
      </p>
    </div>

    <!-- Chat Messages -->
    <div
      ref="messagesContainer"
      class="h-96 overflow-y-auto p-4 space-y-4 bg-background-muted"
    >
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="text-center text-hai py-8">
        <div class="w-12 h-12 mx-auto mb-4 bg-accent-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="mb-2 font-medium text-text-light">Hello! I'm your Japan news assistant.</p>
        <p class="text-sm text-hai">Ask me about any news article or topic you'd like to know more about!</p>
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex"
        :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-xs lg:max-w-md"
          :class="[
            'rounded-lg p-3 shadow-sm',
            message.type === 'user'
              ? 'bg-secondary text-yuki'
              : 'bg-white border border-border text-text-light'
          ]"
        >
          <!-- User Message -->
          <div v-if="message.type === 'user'" class="flex items-start space-x-2">
            <div class="flex-1">
              <p class="text-sm">{{ message.content }}</p>
              <span class="text-xs text-yuki mt-1 block opacity-80">
                {{ formatTime(message.timestamp) }}
              </span>
            </div>
            <div class="w-6 h-6 bg-secondary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-yuki" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <!-- Bot Message -->
          <div v-else class="flex items-start space-x-2">
            <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-yuki" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div class="flex-1">
              <!-- Loading Indicator -->
              <div v-if="message.loading" class="flex items-center space-x-2">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-accent rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-accent rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-accent rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
                <span class="text-sm text-hai font-medium">Thinking...</span>
              </div>

              <!-- Bot Response -->
              <div v-else>
                <div class="text-sm" v-html="formatMessage(message.content)"></div>

                <!-- Sources -->
                <div v-if="message.sources && message.sources.length > 0" class="mt-2 pt-2 border-t border-border">
                  <p class="text-xs text-hai mb-1 font-medium">Sources:</p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="source in message.sources"
                      :key="source"
                      class="inline-block px-2 py-1 bg-background text-hai text-xs rounded border border-border"
                    >
                      {{ source }}
                    </span>
                  </div>
                </div>

                <span class="text-xs text-hai mt-2 block">
                  {{ formatTime(message.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="border-t border-border p-4 bg-white">
      <form @submit.prevent="sendMessage" class="flex space-x-2">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Ask about Japan news..."
          :disabled="isLoading"
          class="flex-1 px-4 py-2 border border-border rounded-lg focus-ring disabled:opacity-50 disabled:cursor-not-allowed bg-background-muted transition-all duration-200"
        />
        <button
          type="submit"
          :disabled="!inputMessage.trim() || isLoading"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem, ChatMessage } from '~/types/index'

interface Props {
  newsContext: NewsItem[]
}


const props = defineProps<Props>()

const emit = defineEmits<{
  message: [message: string]
}>()

// State
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()

// Methods
const sendMessage = async (message?: string) => {
  const text = message || inputMessage.value.trim()
  if (!text || isLoading.value) return

  // Add user message
  addMessage({
    type: 'user',
    content: text,
    timestamp: new Date()
  })

  // Clear input
  inputMessage.value = ''
  isLoading.value = true

  // Add loading bot message
  const loadingMessage = {
    type: 'bot' as const,
    content: '',
    timestamp: new Date(),
    loading: true
  }
  addMessage(loadingMessage)

  try {
    // Get response from parent via emit
    const response = await new Promise((resolve, reject) => {
      // Emit the message event
      emit('message', text)

      // Create a one-time event handler to get the response
      const handler = (responseData: any) => {
        resolve(responseData)
      }

      // For now, we'll use a simple timeout-based approach
      // In a real implementation, you'd want to use a proper event system
      setTimeout(async () => {
        try {
          const apiResponse = await $fetch('/api/chat', {
            method: 'POST',
            body: {
              message: text,
              newsContext: props.newsContext
            }
          })
          resolve({
            message: apiResponse.data.message,
            sources: apiResponse.data.sources
          })
        } catch (error) {
          reject(error)
        }
      }, 500)
    })

    // Remove loading message
    removeMessage(loadingMessage)

    // Add bot response
    addMessage({
      type: 'bot',
      content: (response as any).message,
      timestamp: new Date(),
      sources: (response as any).sources
    })

  } catch (error: any) {
    // Remove loading message
    removeMessage(loadingMessage)

    // Add error message
    addMessage({
      type: 'bot',
      content: 'Sorry, I encountered an error while processing your request. Please try again.',
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const addMessage = (message: ChatMessage) => {
  messages.value.push(message)
  nextTick(() => scrollToBottom())
}

const removeMessage = (messageToRemove: ChatMessage) => {
  const index = messages.value.indexOf(messageToRemove)
  if (index > -1) {
    messages.value.splice(index, 1)
  }
}

const clearChat = () => {
  messages.value = []
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMessage = (content: string) => {
  // Simple markdown-like formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}


// Expose methods for parent
defineExpose({
  sendMessage,
  addMessage,
  clearChat
})

// Watch for news context changes
watch(() => props.newsContext, () => {
  if (props.newsContext.length > 0 && messages.value.length === 0) {
    addMessage({
      type: 'bot',
      content: `Great! I have access to ${props.newsContext.length} recent news articles from Japan. Feel free to ask me about any of them!`,
      timestamp: new Date()
    })
  }
}, { immediate: true })
</script>

<style scoped>
/* Component-specific styles are handled by Tailwind classes */
</style>