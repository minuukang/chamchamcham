import React from 'react';
import './App.css';
import ChamChamCham, { C3FaceMatch } from "./modules/chamchamcham";
import C3Player from "./modules/player";

interface IState {
  isLoadingModel: boolean;
  player: C3Player | null;
  position: null | "right" | "left" | "center";
  singleMatch: C3FaceMatch | null;
}

class App extends React.Component<{}, IState> {
  public readonly state: IState = {
    isLoadingModel: false,
    player: null,
    singleMatch: null,
    position: null,
  };

  private resetTimer: number = 0;
  private c3: ChamChamCham | null = null;

  private readonly containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private readonly videoRef: React.RefObject<HTMLVideoElement> = React.createRef();

  public async componentDidMount() {
    this.setState({ isLoadingModel: true });
    await ChamChamCham.loadModel();
    this.setState({ isLoadingModel: false });
    if (this.videoRef.current) {
      this.setupCanvas(this.videoRef.current);
    }
  }

  public render() {
    return (
      <div className="container" ref={this.containerRef}>
        <div className="buttons">
          {this.state.isLoadingModel && <p>모델 로딩 중입니다...</p>}
          {!this.state.player && <button onClick={this.playGame} disabled={!this.state.singleMatch}>게임시작</button>}
          {this.state.player && this.state.singleMatch && (
            <>
              <p>{this.state.player.name}</p>
              <p>{this.state.position === "right" ? "오른쪽" : this.state.position === "left" ? "왼쪽" : "중앙"}을 보고있습니다.</p>
            </>
          )}
        </div>
        <video autoPlay={true} playsInline={true} ref={this.videoRef} />
      </div>
    );
  }

  private readonly playGame = () => {
    if (this.state.singleMatch) {
      window.clearTimeout(this.resetTimer);
      this.setState({
        player: new C3Player(this.c3!, this.state.singleMatch),
      });
    }
  };

  private async setupCanvas(video: HTMLVideoElement) {
    const drawVideo = async () => {
      const main = async () => {
        if (!this.state.player) {
          const detection = await this.c3!.getDetectSingleFace();
          if (detection) {
            window.clearTimeout(this.resetTimer);
            this.resetTimer = 0;
            this.c3!.drawLandmark(detection);
            this.setState({ singleMatch: detection });
          } else if (!this.resetTimer) {
            this.resetTimer = window.setTimeout(() => {
              this.setState({ singleMatch: null });
            }, 1000);
          }
        } else {
          const bestMatch = await this.state.player.getBestMatch();
          if (bestMatch) {
            this.c3!.drawLandmark(bestMatch.detection);
            const facePosition = this.state.player.getMatchFacePosition(bestMatch);
            this.setState({
              position: facePosition,
            });
          } else if (!this.resetTimer) {
            this.resetTimer = window.setTimeout(() => {
              this.c3!.clear();
            }, 1000);
          }
        }
      }
      await main();
      window.requestAnimationFrame(drawVideo);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        }
      });
      video.srcObject = stream;
      video.oncanplay = () => {
        video.play();
        this.c3 = new ChamChamCham(video);
        requestAnimationFrame(drawVideo);
      };
    } catch (e) {
      console.error(e);
    }
  }
}

export default App;
