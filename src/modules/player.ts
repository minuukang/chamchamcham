import * as faceapi from "face-api.js";
import ChamChamCham, { C3FaceMatch } from "./chamchamcham";

const maxDescriptorDistance = 0.4;

function createImageFromFaceMatch(
  match: C3FaceMatch,
  input: HTMLVideoElement
): Promise<Blob> {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    canvas.width = match.detection.box.width;
    canvas.height = match.detection.box.height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.scale(-1, 1);
    context.drawImage(
      input,
      match.detection.box.left,
      match.detection.box.top,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    canvas.toBlob(blob => {
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
    private readonly match: C3FaceMatch
  ) {
    this.name = `${Math.floor(match.age)}살 미경 ${
      match.gender === "male" ? "남자" : "여자"
    }`;
    const label = new faceapi.LabeledFaceDescriptors(this.name, [
      match.descriptor
    ]);
    this.faceMatcher = new faceapi.FaceMatcher(label, maxDescriptorDistance);
    this.createdAt = new Date();
    createImageFromFaceMatch(match, c3.input).then(blob => {
      this.profileImage = blob;
    });
  }

  public toData() {
    return {
      name: this.name,
      createdAt: this.createdAt,
      image: this.profileImage
    };
  }

  public async getBestMatch() {
    const detections = await this.c3.getDetectAllFace();
    const matchs = detections
      .map(detection => ({
        detection,
        match: this.faceMatcher.findBestMatch(detection.descriptor)
      }))
      .filter(({ match }) => match.label === this.name)
      .sort((dp1, dp2) => dp1.match.distance - dp2.match.distance);
    return matchs[0];
  }

  public getMatchFacePosition(
    match: ThenArg<ReturnType<typeof Player.prototype.getBestMatch>>
  ) {
    const landmark = match.detection.landmarks;
    const nosePoints = landmark.getNose();
    const topNosePoint = nosePoints[0];
    const bottomNosePoint = nosePoints[3];
    const diff = topNosePoint.x - bottomNosePoint.x;
    if (match.match.distance > 0.18) {
      const label = new faceapi.LabeledFaceDescriptors(this.name, [
        match.detection.descriptor
      ]);
      this.faceMatcher = new faceapi.FaceMatcher(
        [...this.faceMatcher.labeledDescriptors, label],
        this.faceMatcher.distanceThreshold
      );
    }
    return diff > 10
      ? ("right" as const)
      : diff < -10
      ? ("left" as const)
      : ("center" as const);
  }
}
