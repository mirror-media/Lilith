import { getVideoFileDuration } from './video-duration'
import { secondsToISO8601Duration } from './duration-format'

interface VideoProcessingJob {
  videoId: string | number
  filename: string | null
  action: 'process' | 'delete'
}

export function processVideoInBackground(job: VideoProcessingJob, context: any) {
  setImmediate(async () => {
    try {
      const { videoId, filename, action } = job
      
      if (action === 'delete') {
        await context.query.Video.updateOne({
          where: { id: videoId.toString() },
          data: { fileDuration: null }
        })
        console.log(`[Background] Cleared duration for video ${videoId}`)
        return
      }

      if (action === 'process' && filename) {
        const durationInSeconds = await getVideoFileDuration(filename)
        
        if (durationInSeconds !== null) {
          const isoDuration = secondsToISO8601Duration(durationInSeconds)
          
          await context.query.Video.updateOne({
            where: { id: videoId.toString() },
            data: { fileDuration: isoDuration }
          })
          
          console.log(`[Background] Updated duration for video ${videoId}: ${isoDuration}`)
        } else {
          console.warn(`[Background] Could not get duration for video ${videoId}`)
        }
      }
    } catch (error) {
      console.error('[Background] Error processing video:', error)
    }
  })
}