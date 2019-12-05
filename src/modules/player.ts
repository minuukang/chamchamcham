import * as faceapi from 'face-api.js';
import shortid from 'shortid';
import ChamChamCham, { C3FaceMatch } from './chamchamcham';
import createImageFromFaceMatch from '../helpers/createImageFromFaceMatch';
import createNameFromFaceMatch from '../helpers/createNameFromFaceMatch';

export const maxDescriptorDistance = 0.5;
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
    this.name = createNameFromFaceMatch(match);
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

  public async saveBestMatch(faceMatch: {
    detection: C3FaceMatch;
    match: faceapi.FaceMatch;
  }) {
    if (faceMatch && faceMatch.match.distance > 0.15) {
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
