import * as React from 'react';
import { IGameDrawHandler } from '../useGame';
import AudioPlayerContext from '../contexts/audioPlayer';

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
  const [faceData, setFaceData] = React.useState<{
    nosePosition: number;
    faceDegree: number;
  } | null>(null);
  const [successPosition, setSuccessPosition] = React.useState(() => ({
    left: false,
    right: false,
  }));
  const facePositionType = React.useMemo(() => {
    if (!faceData || faceData.faceDegree > 20) {
      return null;
    }
    return faceData.nosePosition > 40 && faceData.nosePosition < 60
      ? 'center'
      : faceData.nosePosition > 20 && faceData.nosePosition < 40
      ? 'semi-left'
      : faceData.nosePosition < 20
      ? 'left'
      : faceData.nosePosition > 60 && faceData.nosePosition < 80
      ? 'semi-right'
      : faceData.nosePosition > 80
      ? 'right'
      : null;
  }, [faceData]);
  const speakAndToast = (message: string | null) => {
    message && audio.speak(message);
    setToastMessage(message);
  };
  const timerRef = React.useRef<number>();
  React.useEffect(() => {
    gameDrawHandlerRef.current = async ({ c3, player }) => {
      const bestMatch = await player.getBestMatch();
      if (bestMatch) {
        player.saveBestMatch(bestMatch);
        c3.drawLandmark(bestMatch.detection);
        setFaceData(c3.getMatchFacePosition(bestMatch.detection));
      } else {
        setFaceData(null);
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
        if (facePositionType === 'semi-left') {
          speakAndToast('조금 더 왼쪽으로 얼굴을 돌려주세요.');
        } else if (facePositionType === 'left') {
          timerRef.current = setTimeout(() => {
            speakAndToast('잘하셨습니다.');
            timerRef.current = setTimeout(() => {
              timerRef.current = 0;
              setToastMessage(null);
              setSuccessPosition((prevSuccessPosition) => ({
                ...prevSuccessPosition,
                left: true,
              }));
            }, 1500);
          }, 2000);
        } else {
          speakAndToast('천천히 왼쪽으로 얼굴을 돌려주세요.');
        }
      } else if (!successPosition.right) {
        if (facePositionType === 'semi-right') {
          speakAndToast('조금 더 오른쪽 얼굴을 돌려주세요.');
        } else if (facePositionType === 'right') {
          timerRef.current = setTimeout(() => {
            speakAndToast(
              '잘하셨습니다. 이제 게임을 시작합니다. 중앙을 바라봐주세요.'
            );
            timerRef.current = 0;
            setSuccessPosition((prevSuccessPosition) => ({
              ...prevSuccessPosition,
              right: true,
            }));
          }, 2000);
        } else {
          speakAndToast('천천히 오른쪽으로 얼굴을 돌려주세요.');
        }
      } else if (facePositionType === 'center') {
        timerRef.current = setTimeout(() => {
          handlePlayGame();
        }, 2000);
      }
    }
  }, [facePositionType, successPosition]);
  return null;
}
