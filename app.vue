<template>
  <div>
    <UContainer class="py-16 space-y-12">
      <header class="text-center space-y-4">
        <h1 class="text-4xl font-bold">Anime Ringtone Converter</h1>
        <p class="text-gray-500">Transform your favorite anime intros into iPhone ringtones</p>
      </header>

      <main class="max-w-2xl mx-auto space-y-8">
        <!-- Input Section -->
        <div class="space-y-4">
          <UFormGroup label="Paste YouTube URL" name="youtube-url">
            <UInput 
              v-model="youtubeUrl" 
              placeholder="https://youtube.com/watch?v=..."
              :ui="{ 
                base: 'relative',
                icon: { trailing: { pointer: 'cursor-pointer' } }
              }"
            >
              <template #trailing>
                <UButton 
                  :loading="isConverting"
                  :disabled="!youtubeUrl" 
                  @click="convertAudio"
                >
                  Convert
                </UButton>
              </template>
            </UInput>
               <UButton 
                  :loading="isConverting"
                  :disabled="!youtubeUrl" 
                  @click="convertAudio"
                >
                  Convert
                </UButton>
          </UFormGroup>
        </div>

        <!-- Conversion Status -->
        <div v-if="currentConversion" class="space-y-4">
          <UAlert
            :type="currentConversion.status === 'error' ? 'danger' : 'info'"
            :title="currentConversion.status === 'processing' ? 'Processing' : 'Status'"
            :description="getStatusMessage"
          />
        </div>

        <!-- Preview Section -->
        <div v-if="previewUrl" class="space-y-4">
          <h2 class="text-xl font-semibold">Preview</h2>
          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <audio controls class="w-full">
              <source :src="previewUrl" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
            
            <div class="mt-4 flex justify-between items-center">
              <p class="text-sm text-gray-500">10 second preview</p>
              <UButton
                color="primary"
                @click="purchaseRingtone"
              >
                Purchase for $4.99
              </UButton>
            </div>
          </div>
        </div>

        <!-- Recent Conversions -->
        <div v-if="recentConversions.length" class="space-y-4">
          <h2 class="text-xl font-semibold">Recent Conversions</h2>
          <ul class="space-y-2">
            <li 
              v-for="conversion in recentConversions" 
              :key="conversion.id"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span>{{ conversion.title }}</span>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-play"
                @click="playPreview(conversion)"
              />
            </li>
          </ul>
        </div>
      </main>
    </UContainer>

    <!-- Purchase Modal -->
    <UModal v-model="showPurchaseModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">Complete Purchase</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="showPurchaseModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <p>Your ringtone will be available for download immediately after purchase.</p>
          
          <UFormGroup label="Card Number" name="card">
            <UInput placeholder="4242 4242 4242 4242" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Expiry" name="expiry">
              <UInput placeholder="MM/YY" />
            </UFormGroup>
            <UFormGroup label="CVC" name="cvc">
              <UInput placeholder="123" />
            </UFormGroup>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between items-center">
            <span class="font-semibold">Total: $4.99</span>
            <UButton
              color="primary"
              @click="completePurchase"
            >
              Complete Purchase
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Notifications -->
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const youtubeUrl = ref('')
const previewUrl = ref('')
const showPurchaseModal = ref(false)
const recentConversions = ref([
  { id: 1, title: 'Attack on Titan Opening 1', url: '#' },
  { id: 2, title: 'Demon Slayer Opening 2', url: '#' },
  { id: 3, title: 'Jujutsu Kaisen Opening 1', url: '#' }
])

const { isConverting, currentConversion, convertYoutubeAudio } = useAudioConverter()

const getStatusMessage = computed(() => {
  if (!currentConversion.value) return ''
  
  switch (currentConversion.value.status) {
    case 'processing':
      return 'Converting your anime intro into an iPhone ringtone...'
    case 'complete':
      return 'Conversion complete! You can now preview your ringtone.'
    case 'error':
      return 'Failed to convert audio. Please try again.'
    default:
      return ''
  }
})

async function convertAudio() {
  if (!youtubeUrl.value) return

  try {
    const result = await convertYoutubeAudio(youtubeUrl.value)
    previewUrl.value = result.previewUrl
    
    toast.add({
      title: 'Conversion Complete',
      description: 'Your preview is ready!',
      color: 'green'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to convert audio. Please try again.',
      color: 'red'
    })
  }
}

function purchaseRingtone() {
  showPurchaseModal.value = true
}

async function completePurchase() {
  // Simulate purchase process
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  showPurchaseModal.value = false
  
  toast.add({
    title: 'Purchase Successful',
    description: 'Your ringtone is ready for download!',
    color: 'green'
  })
}

function playPreview(conversion: { url: string; title: string }) {
  previewUrl.value = conversion.url
  toast.add({
    title: 'Loading Preview',
    description: `Loading ${conversion.title}...`,
    color: 'blue'
  })
}
</script>