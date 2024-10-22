import { defineEventHandler, createError, setHeader } from 'h3'

export default defineEventHandler((event) => {
  const id = event.context.params?.id
  
  if (!id || !global._audioStore?.has(id)) {
    throw createError({
      statusCode: 404,
      message: 'Preview not found'
    })
  }

  const audioData = global._audioStore.get(id)
  
  // Set appropriate headers
  setHeader(event, 'Content-Type', 'audio/mpeg')
  setHeader(event, 'Content-Length', audioData.length.toString())
  setHeader(event, 'Cache-Control', 'public, max-age=31536000')
  
  return audioData
})