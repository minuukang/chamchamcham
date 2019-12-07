import * as React from 'react';
import C3Player from '../../modules/player';
import { IGameDrawHandler } from '../../useGame';
import {
  addRanking,
  IFormatRank,
  IRank,
  getRankings,
  formatRankingsSelector,
} from '../../api/rank';
import { setBestMatchCollection } from '../../api/face';
import { usePrevious } from 'react-use';
import AudioPlayerContext from '../../contexts/audioPlayer';
import { FacePosition } from '../../types';
import {
  requestAnimationFrameTimeout,
  IAnimationFrameRef,
  cancelAnimationFrameTimeout,
} from '../../helpers/requestAnimationFrame';

export interface IProps {
  gameDrawHandlerRef: React.MutableRefObject<IGameDrawHandler | undefined>;
  setToastMessage: React.Dispatch<string | null>;
  player: C3Player;
  handleGameEnd(gameId: string): void;
}

export const CURRENT_USER_ID = 'currentUser';

export default function useInGame({
  setToastMessage,
  gameDrawHandlerRef,
  handleGameEnd,
  player,
}: IProps) {
  const audioPlayer = React.useContext(AudioPlayerContext);
  const [ranks, setRanks] = React.useState<IRank[] | null>(null);
  const [position, setPosition] = React.useState<FacePosition | null>('center');
  const [computerPosition, setComputerPosition] = React.useState<FacePosition>(
    'center'
  );
  const [point, setPoint] = React.useState(0);
  const prevPosition = usePrevious(position);
  const ranksWithCurrent = React.useMemo(() => {
    const currentRank: IRank = {
      ...player.toData(),
      id: CURRENT_USER_ID,
      point,
    };
    return formatRankingsSelector([...(ranks || []), currentRank])
      .reduce<IFormatRank[]>((result, rank) => {
        if (
          rank.id === CURRENT_USER_ID ||
          !result.some((findRank) => findRank.rank === rank.rank)
        ) {
          return result.concat(rank);
        }
        return result;
      }, [])
      .filter((rank) => {
        return rank.joint < 4 || rank.id === CURRENT_USER_ID;
      });
  }, [ranks, player, point]);
  const pointTrophy = ranksWithCurrent.find(
    (rank) => rank.id === CURRENT_USER_ID
  )!.joint;
  React.useEffect(() => {
    if (point) {
      setTimeout(() => {
        const wows = [
          'wow',
          'wow2',
          'wow3',
          'wow4',
          'wow5',
          'wow6',
          'wow7',
          'wow8',
        ] as const;
        audioPlayer.play(wows[Math.floor(Math.random() * wows.length)]);
      }, 500);
    }
  }, [point]);
  const [showTitle, setShowTitle] = React.useState<0 | 1 | 2 | 3>(0);
  React.useEffect(() => {
    if (showTitle) {
      audioPlayer.play(showTitle === 3 ? 'big-cham' : 'cham');
    }
  }, [showTitle]);
  React.useEffect(() => {
    let timerHandle: IAnimationFrameRef;
    if (position && position !== 'center' && prevPosition === 'center') {
      setToastMessage(null);
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
    } else {
      if (prevPosition !== 'center' && position === 'center') {
        setToastMessage(null);
        setShowTitle(0);
        timerHandle = requestAnimationFrameTimeout(() => {
          setShowTitle(1);
          timerHandle = requestAnimationFrameTimeout(() => {
            setShowTitle(2);
            timerHandle = requestAnimationFrameTimeout(() => {
              audioPlayer.speak('고개를 아무 방향으로 짧게 돌려주세요!');
              setToastMessage('고개를 아무 방향으로 짧게 돌려주세요!');
            }, 3000);
          }, 700);
        }, 500);
      } else if (!position && prevPosition === 'center') {
        audioPlayer.play('error');
        setToastMessage('얼굴을 너무 돌리거나 가리지 말아주세요.');
      }
      setComputerPosition('center');
    }
    return () => cancelAnimationFrameTimeout(timerHandle);
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
      setRanks(await getRankings());
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
    ranksWithCurrent,
  };
}
