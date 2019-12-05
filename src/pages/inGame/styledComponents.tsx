import styled from 'styled-components';
import { Title } from '../../styledComponents';
export { Title, TitleWrapper, AnimeTitle } from '../../styledComponents';

export const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 0 80px;
  justify-content: space-between;
`;

export const Point = styled.div`
  position: absolute;
  right: 4rem;
  bottom: 4rem;
  display: flex;
`;

export const PointValue = styled(Title)`
  font-size: 10rem;
`;

export const PointTrophy = styled.div`
  margin-right: 1rem;
  width: 8rem;
`;
