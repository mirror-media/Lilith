import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

const AudioWrapper = styled.div`
  outline: 1px solid rgba(0, 9, 40, 0.1);
  padding: 5px 0 10px 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  max-width: 480px;
  margin: auto auto 32px auto;
  position: relative;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 24px 0 24px 10px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    padding: 28px 0 28px 15px;
  }

  .audio-title {
    font-family: 'Noto Sans TC';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: rgba(0, 9, 40, 0.87);
    position: absolute;
    top: 13%;
    left: 70px;
    padding-right: 10px;
    word-break: break-word;
    z-index: 50;
    height: 35px;
    display: flex;
    align-items: flex-end;

    ${({ theme }) => theme.breakpoint.md} {
      font-size: 16px;
      left: 100px;
    }

    ${({ theme }) => theme.breakpoint.xl} {
      left: 105px;
    }
  }

  audio {
    min-height: 80px;
    vertical-align: inherit;
    width: 100%;
    overflow: visible !important;
    position: relative;
  }

  audio::-webkit-media-controls-panel {
    background: #ffffff;
  }

  //播放鍵
  audio::-webkit-media-controls-play-button {
    cursor: pointer;
    margin-right: 18px;
    transform: scale(1.5, 1.5);
    opacity: 1;
    border-radius: 50%;
    position: absolute;
    left: 10px;
    top: calc(50% - 15px);
    z-index: 100;
    background-color: #f6f6fb;

    ${({ theme }) => theme.breakpoint.md} {
      transform: scale(2.2, 2.2);
      left: 25px;
    }
  }

  //時間進度條
  audio::-webkit-media-controls-timeline {
    height: 4px;
    transform: scale(1, 1.5);
    opacity: 0.3;
    padding-right: 10px;
    padding-left: 50px;

    ${({ theme }) => theme.breakpoint.md} {
      padding-left: 80px;
    }
  }

  audio::-webkit-media-controls-current-time-display,
  audio::-webkit-media-controls-time-remaining-display {
    color: rgba(0, 9, 40, 0.5);
    font-weight: 400;
    font-size: 11px;
    line-height: 11px;
  }

  //目前播放時間
  audio::-webkit-media-controls-current-time-display {
    position: absolute;
    bottom: 5px;
    left: 55px;

    ${({ theme }) => theme.breakpoint.md} {
      bottom: 0px;
      left: 85px;
    }
  }

  //總時長
  audio::-webkit-media-controls-time-remaining-display {
    position: absolute;
    bottom: 5px;
    left: 85px;

    ${({ theme }) => theme.breakpoint.md} {
      bottom: 0px;
      left: 115px;
    }
  }

  //音量控制鍵
  audio::-webkit-media-controls-mute-button {
    transform: scale(0.8, 0.8);
    opacity: 0.3;
  }
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

  return (
    <AudioWrapper>
      <div className="audio-title">
        <span>{audio?.name}</span>
      </div>

      <audio
        controls
        src={audio?.url}
        controlsList="nodownload noremoteplayback noplaybackrate nofullscreen "
        preload="auto"
      >
        <source src={audio?.url} />
        <source src={audio?.file?.url} />
      </audio>
    </AudioWrapper>
  )
}
