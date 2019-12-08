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
  dispatch: React.Dispatch<HandDirection>
) {
  let timerHandle: IAnimationFrameRef;
  let callback = () => cancelAnimationFrameTimeout(timerHandle);
  if (direction !== prevDirection) {
    const movingImage: HandDirection =
      prevDirection === 'center'
        ? direction === 'right'
          ? 'right-moving'
          : 'left-moving'
        : prevDirection === 'right'
        ? 'right-moving'
        : 'left-moving';
    const targetImage: HandDirection =
      prevDirection === 'center'
        ? direction === 'right'
          ? 'right'
          : 'left'
        : 'center';
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
    transform: translate3d(-50%, 0, 0) scale(1);
  }
  to {
    transform: translate3d(-50%, 0, 0) scale(1.1);
  }
`;

const HandWrapper = styled.div`
  position: absolute;
  z-index: 10;
  left: 50%;
  transform: translate3d(-50%, 100%, 0);
  height: 60%;
  bottom: -20px;
  pointer-events: none;
  animation: ${handStartKeyframe} 500ms both;
  width: 100%;
`;

type HandDirection =
  | 'left'
  | 'left-moving'
  | 'center'
  | 'right-moving'
  | 'right';

const HandImage = styled.img<{ type: HandDirection; visible: boolean }>`
  display: block;
  height: 100%;
  margin: 0 auto;
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  ${(props) =>
    props.type === 'center' &&
    css`
      animation: ${handShakingKeyframe} 500ms infinite alternate-reverse;
    `}
`;

const handImageMap: Record<HandDirection, string> = {
  left: leftImage,
  'left-moving': leftMovingImage,
  center: centerImage,
  'right-moving': rightMovingImage,
  right: rightImage,
};

function Hand({ direction }: IProps) {
  const audioPlayer = React.useContext(AudioPlayerContext);
  const [currentDirection, setCurrentDirection] = React.useState<HandDirection>(
    'center'
  );
  const prevDirection = usePrevious(direction);
  React.useEffect(() => {
    if (prevDirection && prevDirection !== direction) {
      if (direction !== 'center') {
        audioPlayer.play('throw-sound');
      }
      return moveHandAnimation(prevDirection, direction, setCurrentDirection);
    }
  }, [direction]);
  return (
    <HandWrapper>
      {(Object.entries(handImageMap) as [HandDirection, string][]).map(
        ([key, value]) => (
          <HandImage
            key={key}
            visible={currentDirection === key}
            type={key}
            src={value}
            alt="Hand Image"
          />
        )
      )}
    </HandWrapper>
  );
}

export default Hand;
