import * as React from 'react';
import styled from 'styled-components';
import usePrevious from '../helpers/usePrevious';

// Resources
import centerImage from '../resources/middle.png';
import leftMovingImage from '../resources/left-moving.png';
import leftImage from '../resources/left.png';
import rightMovingImage from '../resources/right-moving.png';
import rightImage from '../resources/right.png';
import AudioPlayerContext from '../contexts/audioPlayer';

type Direction = 'center' | 'right' | 'left';

const ANIMATION_TIME = 100;

function moveHandAnimation(
  prevDirection: Direction,
  direction: Direction,
  dispatch: React.Dispatch<string>
) {
  let timer = 0;
  let callback = () => window.clearTimeout(timer);
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
    timer = window.setTimeout(() => {
      dispatch(targetImage);
      if (prevDirection !== 'center' && direction !== 'center') {
        timer = window.setTimeout(() => {
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

const HandWrapper = styled.div`
  position: absolute;
  width: 100%;
  top: 50%;
  z-index: 10;
  left: 0;
  transform: translate3d(0, -50%, 0) scale(0.75);
  pointer-events: none;
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
    <HandWrapper>
      <img src={currentImage} alt="Hand" />
    </HandWrapper>
  );
}

export default Hand;
