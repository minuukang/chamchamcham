import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import { Title, Button, TrophyButton } from '../styledComponents';
import { IGameDrawHandler } from '../useGame';
import { C3FaceMatch } from '../modules/chamchamcham';
import { FacePosition } from '../types';
import useButtonAudio from '../useButtonAudio';

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

const animeLetterKeyframe = keyframes`
  from {
    transform: scale(1, 1);
  }
  to {
    transform: scale(1, 1.1);
  }
`;

const AnimeTitle = styled(Title)`
  display: inline-block;
  transform-origin: 50% 100%;
  animation: ${animeLetterKeyframe} 500ms infinite alternate-reverse;
  ${Array.from(new Array(3))
    .map((_, index) => {
      return `&:nth-of-type(${index + 1}) {
      animation-delay: ${index * 200}ms;
    }`;
    })
    .join('\n')}
`;

const TitleWrapper = styled.hgroup``;

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
  const { handleClick, handleHover } = useButtonAudio();
  const handleStartClick = React.useCallback(() => {
    if (startFace) {
      handleClick();
      onStartClick(startFace);
    }
  }, [startFace, onStartClick, handleClick]);
  const handleRankingClick = React.useCallback(() => {
    handleClick();
    onRankingClick();
  }, [handleClick, onRankingClick]);
  return (
    <Container>
      <TrophyButton
        onMouseEnter={handleHover}
        title="랭킹"
        onClick={handleRankingClick}
      />
      <TitleWrapper>
        <AnimeTitle title="참">참</AnimeTitle>
        <AnimeTitle title="참">참</AnimeTitle>
        <AnimeTitle title="참">참</AnimeTitle>
      </TitleWrapper>
      <Button
        disabled={!startFace}
        onMouseEnter={handleHover}
        onClick={handleStartClick}>
        시작하기
      </Button>
    </Container>
  );
}
