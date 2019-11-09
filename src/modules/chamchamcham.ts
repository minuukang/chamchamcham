import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export type C3FaceMatch = NonNullable<ThenArg<ReturnType<typeof ChamChamCham.prototype.getDetectSingleFace>>>;

export default class ChamChamCham {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;

  public constructor(
    public readonly input: HTMLVideoElement,
    appendedElement: HTMLElement = document.body,
  ) {
    this.canvas = faceapi.createCanvasFromMedia(input);
    this.canvas.width = input.videoWidth;
    this.canvas.height = input.videoHeight;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    appendedElement.appendChild(this.canvas);
    faceapi.matchDimensions(this.canvas, this.displaySize);
  }

  public get displaySize() {
    return {
      width: this.input.videoWidth,
      height: this.input.videoHeight,
    }
  }

  public async getDetectSingleFace() {
    const detection = await faceapi.detectSingleFace(this.input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withAgeAndGender()
      .withFaceExpressions();
    return detection && faceapi.resizeResults(detection, this.displaySize);
  }

  public async getDetectAllFace() {
    const detections = await faceapi.detectAllFaces(this.input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender()
      .withFaceExpressions();
    return faceapi.resizeResults(detections, this.displaySize);
  }

  public clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawLandmark(detection: Parameters<typeof faceapi.draw.drawFaceLandmarks>[1]) {
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