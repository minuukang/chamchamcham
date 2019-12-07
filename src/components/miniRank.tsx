import * as React from 'react';
import { IFormatRank } from '../api/rank';
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
  margin-right: 10px;
`;

const Content = styled.div`
  background-color: #726672;
  padding: 5px 7.5px;
  flex: 1;
  display: flex;
  align-items: center;
`;

const Rank = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 57.5px;
  background-color: #5f525f;
  border-right: 2.5px solid #000;
  color: #a19ba1;
  font-size: 35px;
  img {
    width: 40px;
    height: 40px;
  }
`;

const PointValue = styled.div`
  font-size: 35px;
  color: #fff;
  -webkit-text-stroke: 1px #000;
  text-shadow: 3px 3px 0 #000;
  letter-spacing: -0.025em;
`;

const Wrapper = styled.div<{ mine: boolean }>`
  position: relative;
  display: flex;
  width: 235px;
  height: 65px;
  border: 2.5px solid #000;
  & ~ & {
    margin-top: 7.5px;
  }
  ${(props) =>
    props.mine &&
    css`
      ${Rank} {
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
      if (rank.image) {
        const blobImageSrc = URL.createObjectURL(rank.image);
        setImageSrc(blobImageSrc);
        return () => {
          URL.revokeObjectURL(blobImageSrc);
        };
      }
    }, [rank.image]);
    const joint = rank.joint + 1;
    return (
      <Wrapper mine={Boolean(mine)} ref={ref}>
        <Rank>
          {joint === 1 ? (
            <img src={trophyGold} alt="Gold Medal" />
          ) : joint === 2 ? (
            <img src={trophySilver} alt="Silver Medal" />
          ) : joint === 3 ? (
            <img src={trophyBronze} alt="Bronze Medal" />
          ) : (
            joint
          )}
        </Rank>
        <Content>
          <Image src={imageSrc} alt={rank.name} />
          <PointValue>{rank.point * 100}</PointValue>
        </Content>
      </Wrapper>
    );
  }
);

export default React.memo(RankItem);
