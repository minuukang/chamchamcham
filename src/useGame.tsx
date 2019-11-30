import * as React from 'react';
import C3Player from './modules/player';
import ChamChamCham, { C3FaceMatch } from './modules/chamchamcham';
import usePrevious from './helpers/usePrevious';
import { addRanking } from './api/rank';

export type GamePage = 'main' | 'ranking' | 'in-game' | 'end';

function useGameState() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [singleMatch, setSingleMatch] = React.useState<C3FaceMatch | null>(
    null
  );
  const [page, setPage] = React.useState<GamePage>('main');
  const pageRef = React.useRef<GamePage>('main');
  const [player, setPlayer] = React.useState<C3Player | null>(null);
  const [position, setPosition] = React.useState<
    'center' | 'left' | 'right' | null
  >(null);
  const [point, setPoint] = React.useState(0);
  const [computerPosition, setComputerPosition] = React.useState<
    'left' | 'right' | 'center'
  >('center');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [gamePlayId, setGamePlayId] = React.useState<string | null>(null);
  const setPageHandler = React.useCallback((goPage: GamePage) => {
    setPage((pageRef.current = goPage));
    setToastMessage(null);
  }, []);
  const c3Instance = React.useRef<ChamChamCham>();
  const playerInstance = React.useRef<C3Player | null>(null);
  const resetTimer = React.useRef<number>();
  return {
    videoRef,
    singleMatch,
    setSingleMatch,
    toastMessage,
    setToastMessage,
    player,
    setPlayer,
    position,
    setPosition,
    point,
    setPoint,
    computerPosition,
    setComputerPosition,
    c3Instance,
    playerInstance,
    resetTimer,
    pageRef,
    page,
    setPage: setPageHandler,
    gamePlayId,
    setGamePlayId,
  };
}

function useGameHandler() {
  const gameState = useGameState();
  const {
    singleMatch,
    resetTimer,
    setPlayer,
    playerInstance,
    c3Instance,
    pageRef,
    setPage,
    setPosition,
    setComputerPosition,
    setPoint,
    setSingleMatch,
    videoRef,
    setToastMessage,
    setGamePlayId,
  } = gameState;
  const handlePlayGame = React.useCallback(() => {
    if (singleMatch) {
      window.clearTimeout(resetTimer.current);
      setPlayer(
        (playerInstance.current = new C3Player(
          c3Instance.current!,
          singleMatch
        ))
      );
      setPage('in-game');
    }
  }, [singleMatch]);
  const handleGoRanking = React.useCallback(() => {
    setPage('ranking');
  }, []);
  const handleGoHome = React.useCallback(() => {
    setPage('main');
    setPosition(null);
    setGamePlayId(null);
    setComputerPosition('center');
    setPoint(0);
    setPlayer((playerInstance.current = null));
    setSingleMatch(null);
  }, []);
  const handleVideoPlay = React.useCallback(() => {
    if (!videoRef.current) {
      throw new Error('VideoRef is not defined');
    }
    c3Instance.current = new ChamChamCham(
      videoRef.current,
      document.getElementById('root')!
    );
    async function draw() {
      const c3 = c3Instance.current!;
      const player = playerInstance.current!;
      if (!playerInstance.current && pageRef.current === 'main') {
        const detection = await c3.getDetectSingleFace();
        if (detection) {
          const facePosition = c3.getMatchFacePosition(detection);
          if (facePosition === 'center') {
            setToastMessage(null);
            setSingleMatch(detection);
          } else {
            setToastMessage('중앙을 바라봐주세요');
            setSingleMatch(null);
          }
          window.clearTimeout(resetTimer.current);
          resetTimer.current = 0;
          c3.drawLandmark(detection);
        } else if (!resetTimer.current) {
          resetTimer.current = window.setTimeout(() => {
            setToastMessage('얼굴을 찾고 있습니다.');
            c3.clear();
            setSingleMatch(null);
          }, 1000);
        }
      } else if (pageRef.current === 'in-game') {
        c3.clear();
        const bestMatch = await player.getBestMatch();
        if (bestMatch) {
          clearTimeout(resetTimer.current);
          resetTimer.current = 0;
          const facePosition = c3.getMatchFacePosition(bestMatch.detection);
          if (facePosition === null) {
            setToastMessage('제대로 화면을 바라봐주세요');
          } else {
            setPosition(facePosition);
            setToastMessage(null);
          }
        } else if (!resetTimer.current) {
          resetTimer.current = window.setTimeout(() => {
            setToastMessage('얼굴을 인식하지 못하고 있습니다.');
          }, 1000);
        }
      } else {
        c3.clear();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }, []);
  return {
    ...gameState,
    handlePlayGame,
    handleVideoPlay,
    handleGoHome,
    handleGoRanking,
  };
}

export default function useSetupGame() {
  const props = useGameHandler();
  const {
    videoRef,
    handleVideoPlay,
    position,
    player,
    point,
    setComputerPosition,
    setPoint,
    page,
    setPage,
    setGamePlayId,
  } = props;
  const prevPosition = usePrevious(position);
  React.useEffect(() => {
    if (
      page === 'in-game' &&
      player &&
      position &&
      position !== 'center' &&
      prevPosition === 'center'
    ) {
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
          setGamePlayId(gamePlayId);
          setTimeout(() => {
            setPage('end');
          }, 1500);
        })();
      }
    } else {
      setComputerPosition('center');
    }
  }, [page, position, player]);
  React.useEffect(() => {
    (async () => {
      if (!videoRef.current) {
        throw new Error('VideoRef is not defined');
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
          },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.oncanplay = handleVideoPlay;
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  return props;
}
