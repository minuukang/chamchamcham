import * as React from 'react';

type VoiceId = 'hello';
type SoundId =
  | 'lose-laugh'
  | 'mouth-pop'
  | 'pipe-sound'
  | 'throw-sound'
  | 'wow'
  | 'wow2'
  | 'wow3'
  | 'wow4'
  | 'wow5'
  | 'wow6'
  | 'wow7'
  | 'wow8'
  | 'cham'
  | 'big-cham'
  | 'error'
  | 'intro'
  | 'in-game'
  | 'end-game'
  | 'scanning-bgm'
  | 'start-bgm'
  | 'whooo';

// Sounds
const soundMapper: Record<SoundId, string> = {
  'lose-laugh': require('../resources/sounds/lose-laugh.wav'),
  'mouth-pop': require('../resources/sounds/mouth-pop.wav'),
  'pipe-sound': require('../resources/sounds/pipe.wav'),
  'throw-sound': require('../resources/sounds/throw.wav'),
  'start-bgm': require('../resources/sounds/start-bgm.mp3'),
  'in-game': require('../resources/sounds/in-game.mp3'),
  'end-game': require('../resources/sounds/end-game.mp3'),
  'scanning-bgm': require('../resources/sounds/scanning-bgm.mp3'),
  intro: require('../resources/sounds/intro.mp3'),
  cham: require('../resources/sounds/cham.mp3'),
  'big-cham': require('../resources/sounds/big-cham.mp3'),
  wow: require('../resources/sounds/wow.wav'),
  wow2: require('../resources/sounds/wow2.mp3'),
  wow3: require('../resources/sounds/wow3.mp3'),
  wow4: require('../resources/sounds/wow4.mp3'),
  wow5: require('../resources/sounds/wow5.mp3'),
  wow6: require('../resources/sounds/wow6.mp3'),
  wow7: require('../resources/sounds/wow7.mp3'),
  wow8: require('../resources/sounds/wow8.mp3'),
  error: require('../resources/sounds/error.wav'),
  whooo: require('../resources/sounds/whooo.wav'),
};

interface IAudioPlayOption {
  loop?: boolean;
}

interface IAudioPlayerContext {
  speak(id: VoiceId | string): void;
  play(id: SoundId, options?: IAudioPlayOption): void;
  stop(id?: SoundId): void;
}

const AudioPlayerContext = React.createContext({} as IAudioPlayerContext);

export default AudioPlayerContext;

export const Provider = ({ children }: React.PropsWithChildren<{}>) => {
  const [speakId, setSpeakId] = React.useState<VoiceId | string | null>(null);
  const soundWrapperRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (speakId) {
      const utter = new SpeechSynthesisUtterance(speakId);
      speechSynthesis.speak(utter);
      return () => speechSynthesis.cancel();
    }
  }, [speakId]);
  const getAudioElement = (id: SoundId): HTMLAudioElement | null => {
    return soundWrapperRef.current?.querySelector(`[data-id="${id}"]`) || null;
  };
  const handlePlayMusic = (id: SoundId, options: IAudioPlayOption) => {
    const audio = getAudioElement(id);
    if (audio) {
      audio.loop = Boolean(options?.loop);
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.play();
    }
  };
  const handleStopMusic = (id?: SoundId) => {
    if (id) {
      const audio = getAudioElement(id);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } else {
      (Object.keys(soundMapper) as SoundId[]).forEach((key) => {
        handleStopMusic(key);
      });
    }
  };
  return (
    <AudioPlayerContext.Provider
      value={{
        speak: setSpeakId,
        play: handlePlayMusic,
        stop: handleStopMusic,
      }}>
      {children}
      <div ref={soundWrapperRef}>
        {Object.entries(soundMapper).map(([key, src]) => (
          <audio key={key} data-id={key} src={src} />
        ))}
      </div>
    </AudioPlayerContext.Provider>
  );
};
