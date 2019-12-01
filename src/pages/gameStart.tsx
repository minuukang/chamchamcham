import * as React from 'react';
import styled from 'styled-components';
import { Title, Button, TrophyButton } from '../styledComponents';
import { IGameDrawHandler } from '../useGame';
import { C3FaceMatch } from '../modules/chamchamcham';
import { FacePosition } from '../types';

interface IProps {
  onStartClick(faceMatch: C3FaceMatch): void;
  onRankingClick(): void;
  gameDrawHandlerRef: React.MutableRefObject<IGameDrawHandler | undefined>;
  setToastMessage: React.Dispatch<string | null>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 0 80px;
  justify-content: space-between;
`;

export default function GameStartPage(props: IProps) {
  const {
    gameDrawHandlerRef,
    onRankingClick,
    onStartClick,
    setToastMessage,
  } = props;
  const [position, setPosition] = React.useState<FacePosition | null>();
  const [startFace, setStartFace] = React.useState<C3FaceMatch | null>(null);
  React.useEffect(() => {
    if (position) {
      if (position === 'center') {
        setToastMessage(null);
      } else {
        setToastMessage('중앙을 바라봐주세요');
      }
    }
  }, [position]);
  React.useEffect(() => {
    let timer: number = 0;
    gameDrawHandlerRef.current = async ({ c3 }) => {
      const detection = await c3.getDetectSingleFace();
      if (detection) {
        const facePosition = c3.getMatchFacePosition(detection);
        setPosition(facePosition);
        setStartFace(facePosition === 'center' ? detection : null);
        window.clearTimeout(timer);
        timer = 0;
        c3.drawLandmark(detection);
      } else if (!timer) {
        timer = window.setTimeout(() => {
          setToastMessage('얼굴을 찾고 있습니다.');
          setStartFace(null);
          c3.clear();
        }, 1000);
      }
    };
    return () => {
      gameDrawHandlerRef.current = undefined;
      window.clearTimeout(timer);
      setToastMessage(null);
    };
  }, []);
  const handleStartClick = React.useCallback(() => {
    if (startFace) {
      onStartClick(startFace);
    }
  }, [startFace]);
  return (
    <Container>
      <TrophyButton title="랭킹" onClick={onRankingClick} />
      <Title title="참참참">참참참</Title>
      <Button disabled={!startFace} onClick={handleStartClick}>
        시작하기
      </Button>
    </Container>
  );
}
