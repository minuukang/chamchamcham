import * as React from 'react';
import Hand from '../components/hand';
import { ButtonGroup } from '../styledComponents';
import C3Player from '../modules/player';
import { IGameDrawHandler } from '../useGame';
import { addRanking } from '../api/rank';
import { setBestMatchCollection } from '../api/face';
import usePrevious from '../helpers/usePrevious';
import AudioPlayerContext from '../contexts/audioPlayer';
import { FacePosition } from '../types';

interface IProps {
  gameDrawHandlerRef: React.MutableRefObject<IGameDrawHandler | undefined>;
  setToastMessage: React.Dispatch<string | null>;
  player: C3Player;
  handleGameEnd(gameId: string): void;
}

export default function InGamePage({
  player,
  gameDrawHandlerRef,
  setToastMessage,
  handleGameEnd,
}: IProps) {
  const audio = React.useContext(AudioPlayerContext);
  const [position, setPosition] = React.useState<FacePosition | null>('center');
  const [computerPosition, setComputerPosition] = React.useState<FacePosition>(
    'center'
  );
  const [point, setPoint] = React.useState(0);
  const prevPosition = usePrevious(position);
  React.useEffect(() => {
    if (point) {
      audio.play('wow');
    }
  }, [point]);
  React.useEffect(() => {
    let timer = 0;
    if (position && position !== 'center' && prevPosition === 'center') {
      setToastMessage(null);
      const weight = 1 - (1 + point) / 20;
      const playerWin = Math.random() < (weight > 0.5 ? weight : 0.5);
      if (playerWin) {
        setComputerPosition(position === 'right' ? 'left' : 'right');
        setPoint((prevPoint) => prevPoint + 1);
      } else {
        setComputerPosition(position);
        (async () => {
          const gamePlayId = await addRanking({
            ...player.toData(),
            point,
          });
          await setBestMatchCollection(
            player.labelName,
            player.getFaceMatcher()
          );
          handleGameEnd(gamePlayId);
        })();
      }
    } else {
      if (prevPosition !== 'center' && position === 'center') {
        setToastMessage(null);
        timer = setTimeout(() => {
          audio.speak('참참참');
        }, 1500);
      } else if (!position) {
        setToastMessage('얼굴을 기울이거나 가리지 말아주세요.');
      }
      setComputerPosition('center');
    }
    return () => clearTimeout(timer);
  }, [position]);
  React.useEffect(() => {
    gameDrawHandlerRef.current = async ({ c3, player }) => {
      const bestMatch = await player.getBestMatch();
      if (bestMatch) {
        c3.drawLandmark(bestMatch.detection);
        const facePosition = c3.getMatchFacePositionType(bestMatch.detection);
        setPosition(facePosition);
      } else {
        c3.clear();
      }
    };
    return () => {
      setToastMessage(null);
      gameDrawHandlerRef.current = undefined;
    };
  }, []);
  return (
    <>
      <div className="hand">
        <Hand direction={computerPosition} />
      </div>
      <ButtonGroup>
        {player && (
          <>
            <p>{player.name}</p>
            <p>
              {position === 'right'
                ? '오른쪽'
                : position === 'left'
                ? '왼쪽'
                : '중앙'}
              을 보고있습니다. 현재 점수 {point * 100}점
            </p>
          </>
        )}
      </ButtonGroup>
    </>
  );
}
