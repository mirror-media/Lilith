import { getVideoFileDuration } from './video-duration'
import { secondsToISO8601Duration } from './duration-format'

type VideoProcessingJob = {
  videoId: string | number
  filename: string | null
  action: 'process' | 'delete'
}

export function processVideoInBackground(
  job: VideoProcessingJob,
  context: any
) {
  setImmediate(async () => {
    try {
      const { videoId, filename, action } = job

      if (action === 'delete') {
        await context.sudo().db.Video.updateOne({
          where: { id: videoId.toString() },
          data: { fileDuration_internal: 'PT0S' },
        })
        console.log(`[Background] Cleared duration for video ${videoId}`)
        return
      }

      if (action === 'process' && filename) {
        const durationInSeconds = await getVideoFileDuration(filename)
        const isoDuration = secondsToISO8601Duration(durationInSeconds)

        await context.sudo().db.Video.updateOne({
          where: { id: videoId.toString() },
          data: { fileDuration_internal: isoDuration },
        })

        if (durationInSeconds === null || durationInSeconds === 0) {
          console.warn(
            `[Background] Could not get duration for video ${videoId}, set to PT0S`
          )
        } else {
          console.log(
            `[Background] Updated duration for video ${videoId}: ${isoDuration}`
          )
        }
      }
    } catch (error) {
      console.error('[Background] Error processing video:', error)
    }
  })
}
