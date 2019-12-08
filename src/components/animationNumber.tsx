import * as React from 'react';

interface IProps {
  value: number;
  max: number;
}

export default function AnimationNumber({ value, max }: IProps) {
  const [showValue, setShowValue] = React.useState(value);
  React.useEffect(() => {
    let timer = window.requestAnimationFrame(update);
    const maxValue = value > max ? max : value;
    function update() {
      setShowValue((prevValue) => {
        if (prevValue + 1 < maxValue) {
          timer = window.requestAnimationFrame(update);
        }
        return prevValue + 1;
      });
    }
    return () => {
      window.cancelAnimationFrame(timer);
    };
  }, [value, max]);
  return <>{showValue > max ? max : showValue}</>;
}
