import * as React from 'react';

type VoiceId = 'hello';

const voiceMapper: Record<VoiceId, string> = {
  hello: '안녕하세요',
};

interface IAudioPlayerContext {
  speak(id: VoiceId | string): void;
}

const AudioPlayerContext = React.createContext({} as IAudioPlayerContext);

export default AudioPlayerContext;

export const Provider = ({ children }: React.PropsWithChildren<{}>) => {
  const [speakId, setSpeakId] = React.useState<VoiceId | string | null>(null);
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
  return (
    <AudioPlayerContext.Provider
      value={{
        speak: setSpeakId,
      }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
