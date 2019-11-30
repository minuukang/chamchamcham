import * as React from 'react';
import { Title, HomeButton } from '../styledComponents';
import RankingPage from '../components/ranks';
import styled from 'styled-components';

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

export default function Ranking(props: IProps) {
  return (
    <Container>
      <Title title="GAME OVER">GAME OVER</Title>
      <Content>
        <RankingPage mineId={props.gamePlayId} />
      </Content>
      <HomeButton onClick={props.onHomeClick}>처음으로</HomeButton>
    </Container>
  );
}
