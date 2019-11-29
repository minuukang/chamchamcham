import * as React from "react";
import C3Player from "./modules/player";
import ChamChamCham, { C3FaceMatch } from "./modules/chamchamcham";

function useGame() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [singleMatch, setSingleMatch] = React.useState<C3FaceMatch | null>(
    null
  );
  const [player, setPlayer] = React.useState<C3Player | null>(null);
  const [position, setPosition] = React.useState<
    "center" | "left" | "right" | null
  >(null);
  const c3Instance = React.useRef<ChamChamCham>();
  const playerInstance = React.useRef<C3Player>();
  const resetTimer = React.useRef<number>();
  const handlePlayGame = React.useCallback(() => {
    if (singleMatch) {
      window.clearTimeout(resetTimer.current);
      setPlayer(
        (playerInstance.current = new C3Player(
          c3Instance.current!,
          singleMatch
        ))
      );
    }
  }, [singleMatch]);
  const handleVideoPlay = React.useCallback(() => {
    if (!videoRef.current) {
      throw new Error("VideoRef is not defined");
    }
    c3Instance.current = new ChamChamCham(videoRef.current);
    async function draw() {
      const c3 = c3Instance.current!;
      const player = playerInstance.current!;
      if (!playerInstance.current) {
        const detection = await c3.getDetectSingleFace();
        if (detection) {
          window.clearTimeout(resetTimer.current);
          resetTimer.current = 0;
          c3.drawLandmark(detection);
          setSingleMatch(detection);
        } else if (!resetTimer.current) {
          resetTimer.current = window.setTimeout(() => {
            setSingleMatch(null);
          }, 1000);
        }
      } else {
        const bestMatch = await player.getBestMatch();
        if (bestMatch) {
          c3.drawLandmark(bestMatch.detection);
          const facePosition = player.getMatchFacePosition(bestMatch);
          setPosition(facePosition);
        } else if (!resetTimer.current) {
          resetTimer.current = window.setTimeout(() => {
            c3.clear();
          }, 1000);
        }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }, []);
  return {
    videoRef,
    position,
    player,
    singleMatch,
    handleVideoPlay,
    handlePlayGame
  };
}

export default function useSetupGame() {
  const { videoRef, handleVideoPlay, position, player, ...rest } = useGame();
  const [point, setPoint] = React.useState(0);
  const [computerPosition, setComputerPosition] = React.useState<
    "left" | "right" | "center"
  >("center");
  React.useEffect(() => {
    if (player && position && position !== "center") {
      const computerPosition = Math.random() > 0.5 ? "left" : "right";
      setComputerPosition(computerPosition);
      setPoint(
        prevPoint => prevPoint + (computerPosition !== position ? 1 : 0)
      );
    } else {
      setComputerPosition("center");
    }
  }, [position, player]);
  React.useEffect(() => {
    (async () => {
      if (!videoRef.current) {
        throw new Error("VideoRef is not defined");
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            width: 640,
            height: 480,
            facingMode: "user"
          }
        });
        videoRef.current.srcObject = stream;
        videoRef.current.oncanplay = handleVideoPlay;
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  return {
    ...rest,
    position,
    computerPosition,
    point,
    player,
    videoRef
  };
}
