import * as React from 'react';
import { Title, HomeButton } from '../styledComponents';
import RankingPage from '../components/ranks';
import styled from 'styled-components';
import useButtonAudio from '../useButtonAudio';

interface IProps {
  onHomeClick(): void;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 75px;
  justify-content: space-between;
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  margin: 50px 0;
`;

export default function Ranking({ onHomeClick }: IProps) {
  const { handleClick, handleHover } = useButtonAudio();
  const handleHomeClick = React.useCallback(() => {
    handleClick();
    onHomeClick();
  }, [onHomeClick, handleClick]);
  return (
    <Container>
      <Title title="RANKING">RANKING</Title>
      <Content>
        <RankingPage />
      </Content>
      <HomeButton onMouseEnter={handleHover} onClick={handleHomeClick}>
        처음으로
      </HomeButton>
    </Container>
  );
}
