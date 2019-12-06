import * as React from 'react';
import C3Player from '../../modules/player';
import { IGameDrawHandler } from '../../useGame';
import { addRanking, getFormatRankings, IFormatRank } from '../../api/rank';
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
  const ranksWithCurrent = React.useMemo(() => {
    const currentRank: IFormatRank = {
      ...player.toData(),
      id: 'currentRank',
      point,
      joint: pointTrophy,
      rank: 0,
    };
    if (!ranks) {
      return [currentRank];
    } else {
      const sortRanks = ranks.slice().sort((a, b) => b.point - a.point);
      currentRank.rank = sortRanks.findIndex(
        (rank) => rank.point === currentRank.point
      );
      return sortRanks
        .reduce<IFormatRank[]>((result, rank) => {
          if (!result.some((findRank) => findRank.rank === rank.rank)) {
            return result.concat(rank);
          }
          return result;
        }, [])
        .slice(0, 3)
        .map((rank) => ({
          ...rank,
          joint: rank.point < currentRank.point ? rank.joint + 1 : rank.joint,
        }))
        .concat(currentRank.point ? [currentRank] : [])
        .sort((a, b) => a.joint - b.joint);
    }
  }, [ranks, player, point, pointTrophy]);
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
    ranksWithCurrent,
  };
}
