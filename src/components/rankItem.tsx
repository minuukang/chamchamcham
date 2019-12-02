import * as React from 'react';
import { IRank, IFormatRank } from '../api/rank';
import styled, { css } from 'styled-components';
import trophyGold from '../resources/trophy-gold.svg';
import trophySilver from '../resources/trophy-silver.svg';
import trophyBronze from '../resources/trophy-bronze.svg';

const Image = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  transform: scaleX(-1);
  border: 2.5px solid #000;
  margin-left: 5px;
`;

const Content = styled.div`
  background-color: #726672;
  padding: 5px;
  flex: 1;
  display: flex;
  align-items: center;
`;

const Rank = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: #5f525f;
  color: #a19ba1;
  font-size: 35px;
`;

const Name = styled.div`
  margin-left: 12px;
  font-size: 35px;
  color: #fff;
  -webkit-text-stroke: 1px #000;
  text-shadow: 3px 3px 0 #000;
  letter-spacing: -0.025em;
`;

const Point = styled.div<{ rank: number }>`
  width: 158px;
  background-color: #5f525f;
  padding: 0 15px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-end;
  border-left: 2.5px solid #000;
  font-size: 35px;
  color: #fff;
  -webkit-text-stroke: 1px #000;
  text-shadow: 3px 3px 0 #000;
  letter-spacing: -0.025em;
  &::before {
    display: block;
    left: 30px;
    top: 50%;
    position: absolute;
    transform: translate3d(-50%, -50%, 0);
    ${(props) => {
      if (props.rank > 3) {
        return css`
          content: '-';
        `;
      } else {
        return css`
        content: '';
        width: 40px;
        height: 40px;
        background-image: url("${
          props.rank === 1
            ? trophyGold
            : props.rank === 2
            ? trophySilver
            : trophyBronze
        }");
        background-size: 100% 100%;
        background-repeat: no-repeat;
      `;
      }
    }}
  }
`;

const PointValue = styled.div``;

const Wrapper = styled.div<{ mine: boolean }>`
  position: relative;
  display: flex;
  border: 2.5px solid #000;
  & ~ & {
    margin-top: 10px;
  }
  ${(props) =>
    props.mine &&
    css`
      ${Rank}, ${Point} {
        background-color: #ff9821;
      }
      ${Content} {
        background-color: #ffa800;
      }
      ${Rank} {
        color: #fff;
      }
    `}
`;

interface IProps {
  rank: IFormatRank;
  mine?: boolean;
}

const RankItem = React.forwardRef<HTMLDivElement, IProps>(
  ({ rank, mine }, ref) => {
    const [imageSrc, setImageSrc] = React.useState('');
    React.useEffect(() => {
      const blobImageSrc = URL.createObjectURL(rank.image);
      setImageSrc(blobImageSrc);
      return () => {
        URL.revokeObjectURL(blobImageSrc);
      };
    }, [rank.image]);
    return (
      <Wrapper mine={Boolean(mine)} ref={ref}>
        <Content>
          <Rank>{rank.rank + 1}</Rank>
          <Image src={imageSrc} alt={rank.name} />
          <Name>{rank.name}</Name>
        </Content>
        <Point rank={rank.joint + 1}>
          <PointValue>{rank.point * 100}</PointValue>
        </Point>
      </Wrapper>
    );
  }
);

export default React.memo(RankItem);
