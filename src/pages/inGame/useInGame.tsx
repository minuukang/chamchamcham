import * as React from 'react';
import C3Player from '../../modules/player';
import { IGameDrawHandler } from '../../useGame';
import { addRanking, getFormatRankings, IFormatRank } from '../../api/rank';
import { setBestMatchCollection } from '../../api/face';
import { usePrevious } from 'react-use';
import AudioPlayerContext from '../../contexts/audioPlayer';
import { FacePosition } from '../../types';
import { requestAnimationFrameTimeout } from '../../helpers/requestAnimationFrame';

export interface IProps {
  gameDrawHandlerRef: React.MutableRefObject<IGameDrawHandler | undefined>;
  setToastMessage: React.Dispatch<string | null>;
  player: C3Player;
  handleGameEnd(gameId: string): void;
}

export default function useInGame({
  setToastMessage,
  gameDrawHandlerRef,
  handleGameEnd,
  player,
}: IProps) {
  const audioPlayer = React.useContext(AudioPlayerContext);
  const [ranks, setRanks] = React.useState<IFormatRank[] | null>(null);
  const [position, setPosition] = React.useState<FacePosition | null>('center');
  const [computerPosition, setComputerPosition] = React.useState<FacePosition>(
    'center'
  );
  const [point, setPoint] = React.useState(0);
  const prevPosition = usePrevious(position);
  const pointTrophy = React.useMemo(() => {
    if (!ranks) {
      return 0;
    }
    const sameRank = ranks.find((r) => r.point === point);
    if (sameRank) {
      return sameRank.joint;
    } else {
      const findRank = Math.min(
        ...ranks.filter((r) => r.point < point).map((r) => r.joint)
      );
      if (!Number.isFinite(findRank)) {
        return Math.max(...ranks.map((r) => r.joint)) + 1;
      } else {
        return findRank;
      }
    }
  }, [point, ranks]);
  React.useEffect(() => {
    if (point) {
      setTimeout(() => {
        audioPlayer.play('wow');
      }, 500);
    }
  }, [point]);
  const [showTitle, setShowTitle] = React.useState<0 | 1 | 2 | 3>(0);
  React.useEffect(() => {
    if (showTitle) {
      audioPlayer.speak('참');
    }
  }, [showTitle]);
  React.useEffect(() => {
    let timer = 0;
    if (position && position !== 'center' && prevPosition === 'center') {
      setToastMessage(null);
      timer = requestAnimationFrameTimeout(() => {
        setShowTitle(3);
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
            setTimeout(() => {
              handleGameEnd(gamePlayId);
            }, 500);
          })();
        }
      }, 100);
    } else {
      if (prevPosition !== 'center' && position === 'center') {
        setToastMessage(null);
        setShowTitle(0);
        timer = requestAnimationFrameTimeout(() => {
          setShowTitle(1);
          timer = requestAnimationFrameTimeout(() => {
            setShowTitle(2);
          }, 700);
        }, 500);
      } else if (!position && prevPosition === 'center') {
        audioPlayer.play('error');
        setToastMessage('얼굴을 너무 돌리거나 가리지 말아주세요.');
      }
      setComputerPosition('center');
    }
    return () => cancelAnimationFrame(timer);
  }, [position]);
  React.useEffect(() => {
    let timer = 0;
    gameDrawHandlerRef.current = async ({ c3, player }) => {
      const bestMatch = await player.getBestMatch();
      if (bestMatch) {
        window.clearTimeout(timer);
        timer = 0;
        c3.drawLandmark(bestMatch.detection);
        const facePosition = c3.getMatchFacePositionType(bestMatch.detection);
        setPosition(facePosition);
      } else if (!timer) {
        timer = window.setTimeout(() => {
          c3.clear();
          setPosition(null);
        }, 1000);
      }
    };
    audioPlayer.stop();
    audioPlayer.play('in-game', { loop: true });
    (async () => {
      setRanks(await getFormatRankings());
    })();
    return () => {
      setToastMessage(null);
      gameDrawHandlerRef.current = undefined;
    };
  }, []);
  return {
    showTitle,
    computerPosition,
    point,
    pointTrophy,
  };
}
