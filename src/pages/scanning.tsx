import * as React from 'react';
import AnimationNumber from '../components/animationNumber';
import { IGameDrawHandler } from '../useGame';
import AudioPlayerContext from '../contexts/audioPlayer';
import styled from 'styled-components';
import { Title } from '../styledComponents';

interface IProps {
  setToastMessage: React.Dispatch<string | null>;
  handlePlayGame(): void;
  gameDrawHandlerRef: React.MutableRefObject<IGameDrawHandler | undefined>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 75px;
  justify-content: space-between;
`;

const Gauge = styled.div`
  border: 2.5px solid #000;
  background-color: #fff;
  height: 60px;
  width: 350px;
  position: relative;
  overflow: hidden;
`;

const GaugeBar = styled.div`
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  transition: 300ms width;
  background-image: linear-gradient(to bottom, #f2a613, #ebc50f);
  &::after {
    display: block;
    position: absolute;
    content: '';
    height: 100%;
    top: 0;
    left: -3px;
    right: -3px;
    box-shadow: inset 0px -2.5px 0px 2.5px #a85131,
      inset 0px 2.5px 0 2.5px #f9ef85;
  }
`;

const GaugeText = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-size: 35px;
  color: #fff;
  -webkit-text-stroke: 1px #000;
  text-shadow: 3px 3px 0 #000;
  letter-spacing: -0.025em;
  z-index: 1;
`;

export default function ScanningPage({
  setToastMessage,
  handlePlayGame,
  gameDrawHandlerRef,
}: IProps) {
  const audioPlayer = React.useContext(AudioPlayerContext);
  const [successDirection, setSuccessDirection] = React.useState(() => ({
    right: false,
    left: false,
  }));
  const [nosePositionSet, setNosePositionSet] = React.useState<number[]>(
    () => []
  );
  const leftNosePositionSetLength = React.useMemo(
    () => nosePositionSet.filter((v) => v < 50).length,
    [nosePositionSet]
  );
  const rightNosePositionSetLength = React.useMemo(
    () => nosePositionSet.filter((v) => v > 50).length,
    [nosePositionSet]
  );
  const speakAndToast = (message: string | null) => {
    message && audioPlayer.speak(message);
    setToastMessage(message);
  };
  const timerRef = React.useRef<number>();
  React.useEffect(() => {
    audioPlayer.stop();
    audioPlayer.play('scanning-bgm', { loop: true });
    gameDrawHandlerRef.current = async ({ c3, player }) => {
      const bestMatch = await player.getBestMatch();
      if (bestMatch) {
        player.saveBestMatch(bestMatch);
        c3.drawLandmark(bestMatch.detection);
        const { nosePosition } = c3.getMatchFacePosition(bestMatch.detection);
        setNosePositionSet((prevSet) =>
          Array.from(new Set([...prevSet, Math.round(nosePosition)]))
        );
      } else {
        c3.clear();
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
      if (!successDirection.left) {
        if (leftNosePositionSetLength > 20) {
          speakAndToast('잘하셨습니다.');
          timerRef.current = window.setTimeout(() => {
            timerRef.current = 0;
            setSuccessDirection((prev) => ({
              ...prev,
              left: true,
            }));
          }, 2000);
        } else {
          speakAndToast('천천히 왼쪽으로 고개를 돌려서 게이지를 완성해주세요.');
        }
      } else if (!successDirection.right) {
        if (rightNosePositionSetLength > 20) {
          speakAndToast(
            '잘하셨습니다. 이제 곧 게임이 시작됩니다. 가운데를 바라봐주세요'
          );
          setSuccessDirection((prev) => ({
            ...prev,
            right: true,
          }));
        } else {
          speakAndToast(
            '천천히 오른쪽으로 고개를 돌려서 게이지를 완성해주세요.'
          );
        }
      } else {
        timerRef.current = window.setTimeout(() => {
          handlePlayGame();
        }, 5000);
      }
    }
  }, [nosePositionSet, successDirection]);
  const renderNosePositionPercent = !successDirection.left
    ? Math.floor((leftNosePositionSetLength / 21) * 100)
    : Math.floor((rightNosePositionSetLength / 21) * 100);
  const renderNosePositionPercentValue = `${renderNosePositionPercent}%`;
  return (
    <Container>
      <Title title="얼굴 인식 중...">얼굴 인식 중...</Title>
      {/* <div>{leftNosePositionSetLength}</div>
      <div>{rightNosePositionSetLength}</div> */}
      <Gauge>
        <GaugeText>
          <AnimationNumber
            key={successDirection.left ? 'left' : 'right'}
            max={100}
            value={renderNosePositionPercent}
          />
          %
        </GaugeText>
        <GaugeBar style={{ width: renderNosePositionPercentValue }} />
      </Gauge>
    </Container>
  );
}
