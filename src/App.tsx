import React from 'react';
import './App.css';

// Contexts
import { Provider as AudioPlayerProvider } from './contexts/audioPlayer';

// Hooks
import useGame from './useGame';

// Pages
import RankingPage from './pages/ranking';
import GameEndPage from './pages/gameEnd';
import GameStartPage from './pages/gameStart';
import InGamePage from './pages/inGame';
import ScanningPage from './pages/scanning';

// Components
import { Container, ToastMessage } from './styledComponents';

function App() {
  const {
    videoRef,
    handlePlayGame,
    player,
    page,
    toastMessage,
    setToastMessage,
    handleGoHome,
    handleGoRanking,
    handleScanningFace,
    gamePlayId,
    gameDrawHandler,
    handleGameEnd,
  } = useGame();
  return (
    <AudioPlayerProvider>
      <Container>
        {toastMessage && <ToastMessage>{toastMessage}</ToastMessage>}
        {page === 'main' ? (
          <GameStartPage
            onStartClick={handleScanningFace}
            onRankingClick={handleGoRanking}
            gameDrawHandlerRef={gameDrawHandler}
            setToastMessage={setToastMessage}
          />
        ) : page === 'ranking' ? (
          <RankingPage onHomeClick={handleGoHome} />
        ) : page === 'scanning' ? (
          <ScanningPage
            setToastMessage={setToastMessage}
            gameDrawHandlerRef={gameDrawHandler}
            handlePlayGame={handlePlayGame}
          />
        ) : page === 'in-game' ? (
          <InGamePage
            player={player!}
            setToastMessage={setToastMessage}
            handleGameEnd={handleGameEnd}
            gameDrawHandlerRef={gameDrawHandler}
          />
        ) : page === 'end' ? (
          <GameEndPage onHomeClick={handleGoHome} gamePlayId={gamePlayId!} />
        ) : null}
      </Container>
      <video autoPlay={true} playsInline={true} ref={videoRef} />
    </AudioPlayerProvider>
  );
}

export default App;
