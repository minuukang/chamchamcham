import React from 'react';
import './App.css';

// Hooks
import useGame from './useGame';

// Pages
import RankingPage from './pages/ranking';
import GameEndPage from './pages/gameEnd';
import GameStartPage from './pages/gameStart';
import InGamePage from './pages/inGame';

// Components
import { Container, ToastMessage } from './styledComponents';

function App() {
  const {
    videoRef,
    handlePlayGame,
    position,
    player,
    singleMatch,
    point,
    page,
    computerPosition,
    toastMessage,
    handleGoHome,
    handleGoRanking,
    gamePlayId,
  } = useGame();
  return (
    <>
      <Container>
        {toastMessage && <ToastMessage>{toastMessage}</ToastMessage>}
        {page === 'main' ? (
          <GameStartPage
            startDisabled={!singleMatch}
            onStartClick={handlePlayGame}
            onRankingClick={handleGoRanking}
          />
        ) : page === 'ranking' ? (
          <RankingPage onHomeClick={handleGoHome} />
        ) : page === 'in-game' ? (
          <InGamePage
            point={point}
            computerPosition={computerPosition}
            player={player!}
            position={position!}
          />
        ) : page === 'end' ? (
          <GameEndPage onHomeClick={handleGoHome} gamePlayId={gamePlayId!} />
        ) : null}
      </Container>
      <video autoPlay={true} playsInline={true} ref={videoRef} />
    </>
  );
}

export default App;
