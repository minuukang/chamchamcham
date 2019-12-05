import * as React from 'react';
import { Title, HomeButton } from '../styledComponents';
import RankingPage from '../components/ranks';
import styled from 'styled-components';
import AudioPlayerContext from '../contexts/audioPlayer';
import useButtonAudio from '../useButtonAudio';
import { getFormatRankById } from '../api/rank';

interface IProps {
  onHomeClick(): void;
  gamePlayId: string;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 75px;
  justify-content: space-between;
  ${Title} {
    color: #ff0000;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  margin: 50px 0;
`;

export default function Ranking({ gamePlayId, onHomeClick }: IProps) {
  const audioPlayer = React.useContext(AudioPlayerContext);
  React.useEffect(() => {
    (async () => {
      const rank = await getFormatRankById(gamePlayId);
      audioPlayer.play(rank && rank.joint < 3 ? 'whooo' : 'lose-laugh');
    })();
    audioPlayer.stop();
    audioPlayer.play('end-game', { loop: true });
    return () => {
      audioPlayer.stop();
    };
  }, []);
  const { handleClick, handleHover } = useButtonAudio();
  const handleHomeClick = React.useCallback(() => {
    handleClick();
    onHomeClick();
  }, [onHomeClick, handleClick]);
  return (
    <Container>
      <Title title="GAME OVER">GAME OVER</Title>
      <Content>
        <RankingPage mineId={gamePlayId} />
      </Content>
      <HomeButton onMouseEnter={handleHover} onClick={handleHomeClick}>
        처음으로
      </HomeButton>
    </Container>
  );
}
