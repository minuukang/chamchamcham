import * as React from 'react';
import { Title, HomeButton } from '../styledComponents';
import RankingPage from '../components/ranks';
import styled from 'styled-components';
import AudioPlayerContext from '../contexts/audioPlayer';
import useButtonAudio from '../useButtonAudio';

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
    audioPlayer.play('lose-laugh');
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
