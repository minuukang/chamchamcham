import * as React from 'react';

type VoiceId = 'hello';
type SoundId = 'lose-laugh' | 'mouth-pop' | 'pipe-sound' | 'throw-sound';

const voiceMapper: Record<VoiceId, string> = {
  hello: '안녕하세요',
};

// Sounds
const soundMapper: Record<SoundId, string> = {
  'lose-laugh': require('../resources/sounds/lose-laugh.wav'),
  'mouth-pop': require('../resources/sounds/mouth-pop.wav'),
  'pipe-sound': require('../resources/sounds/pipe.wav'),
  'throw-sound': require('../resources/sounds/throw.wav'),
};

interface IAudioPlayerContext {
  speak(id: VoiceId | string): void;
  play(id: SoundId): void;
}

const AudioPlayerContext = React.createContext({} as IAudioPlayerContext);

export default AudioPlayerContext;

export const Provider = ({ children }: React.PropsWithChildren<{}>) => {
  const [speakId, setSpeakId] = React.useState<VoiceId | string | null>(null);
  const soundWrapperRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (speakId) {
      const utter = new SpeechSynthesisUtterance(speakId);
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
      utter.onend = () => {
        setSpeakId(null);
      };
    }
  }, [speakId]);
  const handlePlayMusic = (id: SoundId) => {
    if (id in soundMapper && soundWrapperRef.current) {
      const audio: HTMLAudioElement | null = soundWrapperRef.current.querySelector(
        `[data-id="${id}"]`
      );
      if (audio) {
        audio.play();
      }
    }
  };
  return (
    <AudioPlayerContext.Provider
      value={{
        speak: setSpeakId,
        play: handlePlayMusic,
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
