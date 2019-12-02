import * as React from 'react';
import AudioPlayerContext from './contexts/audioPlayer';

export default function useButtonAudio() {
  const audioPlayer = React.useContext(AudioPlayerContext);
  return {
    handleHover: React.useCallback(() => {
      audioPlayer.play('mouth-pop');
    }, [audioPlayer]),
    handleClick: React.useCallback(() => {
      audioPlayer.play('pipe-sound');
    }, [audioPlayer]),
  };
}
