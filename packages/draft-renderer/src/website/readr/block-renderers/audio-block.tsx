import React, { useState, useRef } from 'react'
import styled, { css } from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import audioPlay from '../assets/audio-play.png'
import audioPause from '../assets/audio-pause.png'

const buttonShareStyle = css`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 22px;

  &:hover {
    opacity: 0.8;
  }
`

const audioTimeShareStyle = css`
  color: rgba(0, 9, 40, 0.5);
  font-weight: 400;
  font-size: 11px;
  line-height: 1em;
  position: absolute;
  bottom: 0px;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 13px;
  }
`

const AudioWrapper = styled.div`
  position: relative;
  outline: 1px solid rgba(0, 9, 40, 0.1);
  padding: 16px 0px 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 480px;
  ${({ theme }) => theme.margin.default}

  ${({ theme }) => theme.breakpoint.md} {
    padding: 24px 0px 28px 24px;
  }

  audio {
    max-height: 40px;
    width: 100%;
    position: relative;
    pointer-events: none;
  }

  audio::-webkit-media-controls-panel {
    background: #ffffff;
  }

  //remove default audio style: volume, mute, play
  audio::-webkit-media-controls-volume-slider,
  audio::-webkit-media-controls-mute-button,
  audio::-webkit-media-controls-play-button {
    display: none;
  }

  //時間進度條
  audio::-webkit-media-controls-timeline {
    height: 4px;
    opacity: 0.3;
    padding: 0;
    margin-bottom: 10px;
  }

  //目前播放時間
  audio::-webkit-media-controls-current-time-display {
    ${audioTimeShareStyle}
    left: 5px;
  }

  //總時長
  audio::-webkit-media-controls-time-remaining-display {
    ${audioTimeShareStyle}
    left: 36px;
  }
`

const AudioInfo = styled.div`
  width: calc(100% - 70px);
`

const AudioTitle = styled.div`
  font-family: 'Noto Sans TC';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4em;
  color: rgba(0, 9, 40, 0.87);
  padding: 0 40px 0px 10px;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
  }
`

const PlayButton = styled.button`
  ${buttonShareStyle}
  background-color: #f6f6fb;
  background-image: url(${audioPlay});

  &:hover {
    opacity: 0.66;
  }
`

const PauseButton = styled.button`
  ${buttonShareStyle}
  background-color: rgba(0, 9, 40, 0.87);
  background-image: url(${audioPause});
`

type AudioEntity = {
  id: string
  name?: string
  url?: string
  file?: {
    url: string
  }
}

export function AudioBlock(entity: DraftEntityInstance) {
  const { audio }: { audio: AudioEntity } = entity.getData()

  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    audioRef?.current.play()
    setIsPlaying(true)
  }

  const handlePause = () => {
    audioRef?.current.pause()
    setIsPlaying(false)
  }

  return (
    <AudioWrapper>
      {isPlaying ? (
        <PauseButton onClick={handlePause} />
      ) : (
        <PlayButton onClick={handlePlay} />
      )}
      <AudioInfo>
        <AudioTitle>{audio?.name}</AudioTitle>
        <audio
          controls
          id="player"
          ref={audioRef}
          src={audio?.url}
          controlsList="nodownload noremoteplayback noplaybackrate nofullscreen"
          preload="auto"
        />
      </AudioInfo>
    </AudioWrapper>
  )
}
