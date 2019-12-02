import { C3FaceMatch } from '../modules/chamchamcham';

export default function createImageFromFaceMatch(
  match: C3FaceMatch,
  input: HTMLVideoElement
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(match.detection.box.width);
    canvas.height = Math.floor(match.detection.box.height);
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(
      input,
      Math.floor(match.detection.box.left),
      Math.floor(match.detection.box.top),
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      }
    });
  });
}
