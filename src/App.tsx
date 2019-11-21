import React from "react";
import "./App.css";
import Hand from "./components/hand";

// Hooks
import useGame from "./useGame";

function App() {
  const { videoRef, handlePlayGame, position, player, singleMatch } = useGame();
  return (
    <div className="container">
      {position && (
        <div className="hand">
          <Hand direction={position} />
        </div>
      )}
      <div className="buttons">
        {!player && (
          <button onClick={handlePlayGame} disabled={!singleMatch}>
            게임시작
          </button>
        )}
        {player && singleMatch && (
          <>
            <p>{player.name}</p>
            <p>
              {position === "right"
                ? "오른쪽"
                : position === "left"
                ? "왼쪽"
                : "중앙"}
              을 보고있습니다.
            </p>
          </>
        )}
      </div>
      <video autoPlay={true} playsInline={true} ref={videoRef} />
    </div>
  );
}

export default App;
