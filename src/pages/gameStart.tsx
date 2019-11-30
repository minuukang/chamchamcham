import * as React from 'react';
import styled from 'styled-components';
import { Title, Button, TrophyButton } from '../styledComponents';

interface IProps {
  onStartClick(): void;
  onRankingClick(): void;
  startDisabled: boolean;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 0 80px;
  justify-content: space-between;
`;

export default function(props: IProps) {
  return (
    <Container>
      <TrophyButton title="랭킹" onClick={props.onRankingClick} />
      <Title title="참참참">참참참</Title>
      <Button disabled={props.startDisabled} onClick={props.onStartClick}>
        시작하기
      </Button>
    </Container>
  );
}
