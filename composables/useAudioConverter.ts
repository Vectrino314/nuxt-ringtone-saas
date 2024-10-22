export const useAudioConverter = () => {
  const isConverting = ref(false)
  const currentConversion = ref<{
    url: string
    title: string
    status: 'processing' | 'complete' | 'error'
  } | null>(null)

  async function convertYoutubeAudio(youtubeUrl: string) {
    isConverting.value = true
    currentConversion.value = {
      url: youtubeUrl,
      title: 'Processing...',
      status: 'processing'
    }

    try {
      const response = await $fetch('/api/convert', {
        method: 'POST',
        body: { youtubeUrl }
      })

      if (!response.success) {
        throw new Error(response.error)
      }

      currentConversion.value = {
        url: response.previewUrl,
        title: response.title,
        status: 'complete'
      }

      return response
    } catch (error: any) {
      currentConversion.value = {
        url: youtubeUrl,
        title: 'Error',
        status: 'error'
      }
      throw error
    } finally {
      isConverting.value = false
    }
  }

  return {
    isConverting,
    currentConversion,
    convertYoutubeAudio
  }
}