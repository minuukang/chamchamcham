import * as React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { usePrevious } from 'react-use';

// Resources
import centerImage from '../resources/center-hand.png';
import leftMovingImage from '../resources/left-hand-moving.png';
import leftImage from '../resources/left-hand.png';
import rightMovingImage from '../resources/right-hand-moving.png';
import rightImage from '../resources/right-hand.png';
import AudioPlayerContext from '../contexts/audioPlayer';
import {
  requestAnimationFrameTimeout,
  IAnimationFrameRef,
  cancelAnimationFrameTimeout,
} from '../helpers/requestAnimationFrame';

type Direction = 'center' | 'right' | 'left';

const ANIMATION_TIME = 200;

function moveHandAnimation(
  prevDirection: Direction,
  direction: Direction,
  dispatch: React.Dispatch<string>
) {
  let timerHandle: IAnimationFrameRef;
  let callback = () => cancelAnimationFrameTimeout(timerHandle);
  if (direction !== prevDirection) {
    const movingImage =
      prevDirection === 'center'
        ? direction === 'right'
          ? rightMovingImage
          : leftMovingImage
        : prevDirection === 'right'
        ? rightMovingImage
        : leftMovingImage;
    const targetImage =
      prevDirection === 'center'
        ? direction === 'right'
          ? rightImage
          : leftImage
        : centerImage;
    dispatch(movingImage);
    timerHandle = requestAnimationFrameTimeout(() => {
      dispatch(targetImage);
      if (prevDirection !== 'center' && direction !== 'center') {
        timerHandle = requestAnimationFrameTimeout(() => {
          callback = moveHandAnimation('center', direction, dispatch);
        }, ANIMATION_TIME);
      }
    }, ANIMATION_TIME);
  }
  return () => callback();
}

interface IProps {
  direction: Direction;
}

const handStartKeyframe = keyframes`
  from {
    transform: translate3d(-50%, 100%, 0);
  }
  to {
    transform: translate3d(-50%, 0%, 0);
  }
`;

const handShakingKeyframe = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
`;

const HandWrapper = styled.div<IProps>`
  position: absolute;
  z-index: 10;
  left: 50%;
  transform: translate3d(-50%, 100%, 0);
  height: 60%;
  bottom: -20px;
  pointer-events: none;
  animation: ${handStartKeyframe} 500ms both;
  width: 100%;
  img {
    display: block;
    height: 100%;
    margin: 0 auto;
    ${(props) =>
      props.direction === 'center' &&
      css`
        animation: ${handShakingKeyframe} 500ms infinite alternate-reverse;
      `}
  }
`;

function Hand({ direction }: IProps) {
  const audioPlayer = React.useContext(AudioPlayerContext);
  const [currentImage, setCurrentImage] = React.useState(centerImage);
  const prevDirection = usePrevious(direction);
  React.useEffect(() => {
    if (prevDirection && prevDirection !== direction) {
      if (direction !== 'center') {
        audioPlayer.play('throw-sound');
      }
      return moveHandAnimation(prevDirection, direction, setCurrentImage);
    }
  }, [direction]);
  return (
    <HandWrapper direction={direction}>
      <img src={currentImage} alt="Hand" />
    </HandWrapper>
  );
}

export default Hand;
