export function requestAnimationFrameTimeout(fn: VoidFunction, delay: number) {
  const start = new Date().getTime();
  let handle: number = 0;

  function loop() {
    const current = new Date().getTime();
    const delta = current - start;
    if (delta >= delay) {
      fn.call(null);
    } else {
      handle = requestAnimationFrame(loop);
    }
  }

  handle = requestAnimationFrame(loop);
  return handle;
}
