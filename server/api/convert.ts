import { defineEventHandler, readBody, createError } from 'h3'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import axios from 'axios'

// Store FFmpeg instance
let ffmpeg: FFmpeg | null = null

// Initialize FFmpeg
async function initFFmpeg() {
  if (ffmpeg) return ffmpeg

  ffmpeg = new FFmpeg()
  
  try {
    const baseURL = 'https://unpkg.com/@ffmpeg'
    const ffmpegCore = await toBlobURL(
      `${baseURL}/core@0.12.6/dist/umd/ffmpeg-core.wasm`,
      'application/wasm'
    )
    
    await ffmpeg.load({
      coreURL: ffmpegCore
    })
    
    return ffmpeg
  } catch (error) {
    console.error('FFmpeg initialization error:', error)
    throw new Error('Failed to initialize FFmpeg')
  }
}

// Extract audio from YouTube URL (simplified for demo)
async function extractAudioFromYoutube(url: string): Promise<ArrayBuffer> {
  try {
    // For demo purposes, using a sample audio file
    const response = await axios.get('https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav', {
      responseType: 'arraybuffer'
    })
    return response.data
  } catch (error) {
    console.error('Error extracting audio:', error)
    throw createError({
      statusCode: 400,
      message: 'Failed to extract audio from YouTube'
    })
  }
}

// Process audio with FFmpeg
async function processAudioWithAI(audioBuffer: ArrayBuffer): Promise<Uint8Array> {
  try {
    const ff = await initFFmpeg()
    const inputData = new Uint8Array(audioBuffer)
    
    await ff.writeFile('input.wav', inputData)

    // Process audio with FFmpeg
    await ff.exec([
      '-i', 'input.wav',
      '-t', '10',
      '-ar', '44100',
      '-ac', '2',
      '-b:a', '256k',
      '-f', 'mp3',
      'output.mp3'
    ])

    const data = await ff.readFile('output.mp3')
    return data
  } catch (error) {
    console.error('Error processing audio:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to process audio'
    })
  }
}

// Main handler
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { youtubeUrl } = body

    if (!youtubeUrl) {
      throw createError({
        statusCode: 400,
        message: 'YouTube URL is required'
      })
    }

    // Validate YouTube URL
    const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    if (!youtubeUrlRegex.test(youtubeUrl)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid YouTube URL'
      })
    }

    const audioBuffer = await extractAudioFromYoutube(youtubeUrl)
    const processedAudio = await processAudioWithAI(audioBuffer)
    
    const previewId = Date.now().toString()
    const previewUrl = `/api/preview/${previewId}`
    
    // Store in memory (temporary solution)
    if (typeof global._audioStore === 'undefined') {
      global._audioStore = new Map()
    }
    global._audioStore.set(previewId, processedAudio)

    return {
      success: true,
      previewUrl,
      title: 'Processed Anime Intro'
    }
  } catch (error: any) {
    console.error('Convert API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})