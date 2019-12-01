import * as React from 'react';
import { IGameDrawHandler } from '../useGame';
import AudioPlayerContext from '../contexts/audioPlayer';
import { FacePosition } from '../types';

interface IProps {
  setToastMessage: React.Dispatch<string | null>;
  handlePlayGame(): void;
  gameDrawHandlerRef: React.MutableRefObject<IGameDrawHandler | undefined>;
}

export default function ScanningPage({
  setToastMessage,
  handlePlayGame,
  gameDrawHandlerRef,
}: IProps) {
  const audio = React.useContext(AudioPlayerContext);
  const [position, setPosition] = React.useState<FacePosition | null>('center');
  const [successPosition, setSuccessPosition] = React.useState(() => ({
    left: false,
    right: false,
  }));
  const timerRef = React.useRef<number>();
  React.useEffect(() => {
    gameDrawHandlerRef.current = async ({ c3, player }) => {
      const bestMatch = await player.getBestMatch();
      if (bestMatch) {
        player.saveBestMatch(bestMatch);
        c3.drawLandmark(bestMatch.detection);
        const facePosition = c3.getMatchFacePosition(bestMatch.detection, 15);
        setPosition(facePosition);
      } else {
        setPosition(null);
      }
    };
    return () => {
      setToastMessage(null);
      clearTimeout(timerRef.current);
      gameDrawHandlerRef.current = undefined;
    };
  }, []);
  React.useEffect(() => {
    if (!timerRef.current) {
      if (!successPosition.left) {
        if (position === 'left') {
          timerRef.current = setTimeout(() => {
            audio.speak('잘하셨습니다.');
            setToastMessage('잘하셨습니다.');
            timerRef.current = setTimeout(() => {
              timerRef.current = 0;
              setToastMessage(null);
              setSuccessPosition((prevSuccessPosition) => ({
                ...prevSuccessPosition,
                left: true,
              }));
            }, 1500);
          }, 3000);
        } else {
          setToastMessage('천천히 왼쪽으로 얼굴을 돌려주세요.');
          audio.speak('천천히 왼쪽으로 얼굴을 돌려주세요.');
        }
      } else if (!successPosition.right) {
        if (position === 'right') {
          timerRef.current = setTimeout(() => {
            audio.speak(
              '잘하셨습니다. 이제 게임을 시작합니다. 중앙을 바라봐주세요.'
            );
            setToastMessage(
              '잘하셨습니다. 이제 게임을 시작합니다. 중앙을 바라봐주세요.'
            );
            timerRef.current = 0;
            setSuccessPosition((prevSuccessPosition) => ({
              ...prevSuccessPosition,
              right: true,
            }));
          }, 3000);
        } else {
          audio.speak('천천히 오른쪽으로 얼굴을 돌려주세요.');
          setToastMessage('천천히 오른쪽으로 얼굴을 돌려주세요.');
        }
      } else if (position === 'center') {
        timerRef.current = setTimeout(() => {
          handlePlayGame();
        }, 2000);
      }
    }
  }, [position, successPosition]);
  return null;
}
