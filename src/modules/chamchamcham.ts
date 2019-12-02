import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export type C3FaceMatch = faceapi.WithAge<
  faceapi.WithGender<
    faceapi.WithFaceExpressions<
      faceapi.WithFaceDescriptor<
        faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>
      >
    >
  >
>;

export default class ChamChamCham {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;

  public constructor(
    public readonly input: HTMLVideoElement,
    appendedElement: HTMLElement = document.body
  ) {
    this.canvas = faceapi.createCanvasFromMedia(input);
    this.canvas.width = input.videoWidth;
    this.canvas.height = input.videoHeight;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    appendedElement.appendChild(this.canvas);
    faceapi.matchDimensions(this.canvas, this.displaySize);
  }

  public get displaySize() {
    return {
      width: this.input.videoWidth,
      height: this.input.videoHeight,
    };
  }

  public async getDetectSingleFace() {
    const detection = await faceapi
      .detectSingleFace(this.input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withAgeAndGender()
      .withFaceExpressions();
    return detection && faceapi.resizeResults(detection, this.displaySize);
  }

  public async getDetectAllFace() {
    const detections = await faceapi
      .detectAllFaces(this.input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender()
      .withFaceExpressions();
    return faceapi.resizeResults(detections, this.displaySize);
  }

  private getTwoPointDegree(point1: faceapi.Point, point2: faceapi.Point) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const rad = Math.atan2(dx, dy);
    return (rad * 180) / Math.PI;
  }

  public getMatchFacePositionType(
    detection: C3FaceMatch,
    allowable: number = 33.333
  ) {
    const { nosePosition, faceDegree } = this.getMatchFacePosition(detection);
    if (faceDegree > 20) {
      return null;
    }
    return nosePosition < allowable
      ? ('left' as const)
      : nosePosition > 100 - allowable
      ? ('right' as const)
      : ('center' as const);
  }

  public getMatchFacePosition(detection: C3FaceMatch) {
    const landmark = detection.landmarks;

    const nosePoints = landmark.getNose();
    const topNosePoint = nosePoints[0];

    // Face points
    const facePoints = landmark.getJawOutline();

    // Check face is not a center alignment
    const middleFacePoint = facePoints[Math.floor(facePoints.length / 2)];
    const leftFacePoint = facePoints[0];
    const rightFacePoint = facePoints[facePoints.length - 1];

    const percentOfNosePosition = Math.abs(
      ((rightFacePoint.x - topNosePoint.x) /
        (leftFacePoint.x - rightFacePoint.x)) *
        100
    );

    return {
      faceDegree: Math.abs(
        this.getTwoPointDegree(topNosePoint, middleFacePoint)
      ),
      nosePosition: percentOfNosePosition,
    };
  }

  public clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawLandmark(
    detection: Parameters<typeof faceapi.draw.drawFaceLandmarks>[1]
  ) {
    this.clear();
    faceapi.draw.drawFaceLandmarks(this.canvas, detection);
  }

  public static async loadModel() {
    return Promise.all([
      faceapi.loadTinyFaceDetectorModel(MODEL_URL),
      faceapi.loadMtcnnModel(MODEL_URL),
      faceapi.loadSsdMobilenetv1Model(MODEL_URL),
      faceapi.loadFaceLandmarkModel(MODEL_URL),
      faceapi.loadFaceRecognitionModel(MODEL_URL),
      faceapi.loadFaceExpressionModel(MODEL_URL),
      faceapi.loadAgeGenderModel(MODEL_URL),
    ]);
  }
}
