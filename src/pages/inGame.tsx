import * as React from 'react';
import Hand from '../components/hand';
import { ButtonGroup } from '../styledComponents';
import C3Player from '../modules/player';
import { IGameDrawHandler } from '../useGame';
import { addRanking } from '../api/rank';
import { setBestMatchCollection } from '../api/face';
import usePrevious from '../helpers/usePrevious';
import AudioPlayerContext from '../contexts/audioPlayer';

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
  const [position, setPosition] = React.useState<'center' | 'left' | 'right'>(
    'center'
  );
  const [computerPosition, setComputerPosition] = React.useState<
    'center' | 'left' | 'right'
  >('center');
  const [point, setPoint] = React.useState(0);
  const prevPosition = usePrevious(position);
  React.useEffect(() => {
    let timer = 0;
    if (position !== 'center' && prevPosition === 'center') {
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
        timer = setTimeout(() => {
          audio.speak('참참참');
        }, 1500);
      }
      setComputerPosition('center');
    }
    return () => clearTimeout(timer);
  }, [position]);
  React.useEffect(() => {
    let timer = 0;
    gameDrawHandlerRef.current = async ({ c3, player }) => {
      const bestMatch = await player.getBestMatch();
      if (bestMatch) {
        c3.drawLandmark(bestMatch.detection);
        window.clearTimeout(timer);
        timer = 0;
        const facePosition = c3.getMatchFacePosition(bestMatch.detection);
        if (facePosition === null) {
          setToastMessage('제대로 화면을 바라봐주세요');
        } else {
          setToastMessage(null);
          setPosition(facePosition);
        }
      } else if (!timer) {
        timer = window.setTimeout(() => {
          c3.clear();
          setToastMessage('얼굴을 인식하지 못하고 있습니다.');
        }, 1000);
      }
    };
    return () => {
      setToastMessage(null);
      window.clearTimeout(timer);
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
