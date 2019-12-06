export interface IAnimationFrameRef {
  value: number;
}

export function requestAnimationFrameTimeout(
  fn: VoidFunction,
  delay: number
): IAnimationFrameRef {
  const start = new Date().getTime();
  const handle: IAnimationFrameRef = {
    value: 0,
  };

  function loop() {
    const current = new Date().getTime();
    const delta = current - start;
    if (delta >= delay) {
      fn.call(null);
    } else {
      handle.value = window.requestAnimationFrame(loop);
    }
  }

  handle.value = window.requestAnimationFrame(loop);
  return handle;
}

export function cancelAnimationFrameTimeout(ref?: IAnimationFrameRef) {
  return ref && window.cancelAnimationFrame(ref.value);
}
