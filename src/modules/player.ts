import * as faceapi from 'face-api.js';
import shortid from 'shortid';
import ChamChamCham, { C3FaceMatch } from './chamchamcham';

export const maxDescriptorDistance = 0.4;

function createImageFromFaceMatch(
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

export default class Player {
  public readonly name: string;
  private faceMatcher: faceapi.FaceMatcher;
  private readonly createdAt: Date;
  private profileImage!: Blob;

  public constructor(
    private readonly c3: ChamChamCham,
    private readonly match: C3FaceMatch,
    faceMatcher?: faceapi.FaceMatcher
  ) {
    this.name = `${Math.floor(match.age)}살 미경 ${
      match.gender === 'male' ? '남자' : '여자'
    }`;
    const label = new faceapi.LabeledFaceDescriptors(shortid.generate(), [
      match.descriptor,
    ]);
    this.faceMatcher =
      faceMatcher || new faceapi.FaceMatcher(label, maxDescriptorDistance);
    this.createdAt = new Date();
    createImageFromFaceMatch(match, c3.input).then((blob) => {
      this.profileImage = blob;
    });
  }

  public toData() {
    return {
      name: this.name,
      createdAt: this.createdAt,
      image: this.profileImage,
    };
  }

  public getFaceMatcher() {
    return this.faceMatcher;
  }

  public get labelName() {
    return this.faceMatcher.labeledDescriptors[0].label;
  }

  public async saveBestMatch(
    faceMatch: NonNullable<
      ThenArg<ReturnType<typeof Player.prototype.getBestMatch>>
    > | null
  ) {
    if (faceMatch && faceMatch.match.distance > 0.18) {
      const label = new faceapi.LabeledFaceDescriptors(this.labelName, [
        faceMatch.detection.descriptor,
      ]);
      this.faceMatcher = new faceapi.FaceMatcher(
        [...this.faceMatcher.labeledDescriptors, label],
        this.faceMatcher.distanceThreshold
      );
    }
  }

  public async getBestMatch() {
    const detections = await this.c3.getDetectAllFace();
    const [faceMatch] = detections
      .map((detection) => ({
        detection,
        match: this.faceMatcher.findBestMatch(detection.descriptor),
      }))
      .filter(({ match }) => match.label === this.labelName)
      .sort((dp1, dp2) => dp1.match.distance - dp2.match.distance);
    return faceMatch || null;
  }
}
