import * as React from 'react';
import styled from 'styled-components';
import Hand from '../components/hand';
import { ButtonGroup } from '../styledComponents';
import C3Player from '../modules/player';

interface IProps {
  computerPosition: 'center' | 'left' | 'right';
  position: 'center' | 'left' | 'right';
  player: C3Player;
  point: number;
}

export default function({ player, computerPosition, position, point }: IProps) {
  return (
    <>
      <div className="hand">
        <Hand direction={computerPosition} />
      </div>
      <ButtonGroup>
        {player && (
          <>
            <p>{player.name}</p>
            <p>
              {position === 'right'
                ? '오른쪽'
                : position === 'left'
                ? '왼쪽'
                : '중앙'}
              을 보고있습니다. 현재 점수 {point * 100}점
            </p>
          </>
        )}
      </ButtonGroup>
    </>
  );
}
