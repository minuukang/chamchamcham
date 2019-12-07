import * as React from 'react';
import C3Player from './modules/player';
import ChamChamCham, { C3FaceMatch } from './modules/chamchamcham';
import { getBestMatchCollection } from './api/face';

export type GamePage = 'main' | 'ranking' | 'scanning' | 'in-game' | 'end';

export interface IGameDrawHandler {
  (param: { c3: ChamChamCham; player: C3Player }): Promise<void>;
}

function useGameState() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [page, setPage] = React.useState<GamePage>('main');
  const [player, setPlayer] = React.useState<C3Player | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const c3Instance = React.useRef<ChamChamCham>();
  const playerInstance = React.useRef<C3Player | null>(null);
  const [gamePlayId, setGamePlayId] = React.useState<string | null>(null);
  const gameDrawHandler = React.useRef<IGameDrawHandler>();
  const setPlayerHandler = (player: C3Player | null) => {
    setPlayer((playerInstance.current = player));
  };
  return {
    videoRef,
    gameDrawHandler,
    toastMessage,
    setToastMessage,
    player,
    setPlayer: setPlayerHandler,
    c3Instance,
    playerInstance,
    page,
    setPage,
    gamePlayId,
    setGamePlayId,
  };
}

function useGameHandler() {
  const gameState = useGameState();
  const { setPlayer, c3Instance, setPage, setGamePlayId } = gameState;
  const handlePlayGame = React.useCallback(() => {
    setPage('in-game');
  }, []);
  const handleScanningFace = React.useCallback(
    async (faceMatch: C3FaceMatch) => {
      const bestMatcher = await getBestMatchCollection(faceMatch);
      const player = new C3Player(
        c3Instance.current!,
        faceMatch,
        bestMatcher || undefined
      );
      setPlayer(player);
      await player.loadProfileImage();
      setPage(bestMatcher ? 'in-game' : 'scanning');
    },
    []
  );
  const handleGoRanking = React.useCallback(() => {
    setPage('ranking');
  }, []);
  const handleGoHome = React.useCallback(() => {
    setPage('main');
    setGamePlayId(null);
    setPlayer(null);
  }, []);
  const handleGameEnd = React.useCallback((gameId: string) => {
    setGamePlayId(gameId);
    setPage('end');
  }, []);
  return {
    ...gameState,
    handlePlayGame,
    handleGoHome,
    handleGoRanking,
    handleScanningFace,
    handleGameEnd,
  };
}

export default function useSetupGame() {
  const props = useGameHandler();
  const {
    c3Instance,
    playerInstance,
    videoRef,
    gameDrawHandler,
    page,
    setToastMessage,
  } = props;
  const [readyUserMedia, setReadyUserMedia] = React.useState(false);
  const [videoDetectionError, setVideoDetectionError] = React.useState(false);
  React.useEffect(() => {
    if (videoDetectionError) {
      setToastMessage('카메라를 인식 할 수 없습니다.');
    }
  }, [videoDetectionError]);
  React.useEffect(() => {
    let cancelTimer = 0;
    let inCancel = false;
    async function draw() {
      const c3 = c3Instance.current!;
      const player = playerInstance.current!;
      if (gameDrawHandler.current) {
        try {
          await gameDrawHandler.current({
            c3,
            player,
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        c3.clear();
      }
      if (!inCancel) {
        cancelTimer = window.requestAnimationFrame(draw);
      }
    }
    if (readyUserMedia) {
      cancelTimer = window.requestAnimationFrame(draw);
      return () => {
        inCancel = true;
        window.cancelAnimationFrame(cancelTimer);
      };
    }
  }, [readyUserMedia, page]);
  React.useEffect(() => {
    (async () => {
      if (!videoRef.current) {
        throw new Error('VideoRef is not defined');
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            width: { min: 640, ideal: 1920, max: 1920 },
            height: { min: 400, ideal: 1080 },
            aspectRatio: 1.777777778,
            frameRate: { max: 30 },
            facingMode: 'user',
          },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.oncanplay = () => {
          c3Instance.current = new ChamChamCham(
            videoRef.current!,
            document.getElementById('root')!
          );
          setReadyUserMedia(true);
        };
      } catch (e) {
        setVideoDetectionError(true);
      }
    })();
  }, []);
  return props;
}
