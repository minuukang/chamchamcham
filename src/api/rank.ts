import store from './index';
import shortid from 'shortid';

export interface IRank {
  id: string;
  name: string;
  createdAt: Date;
  image: Blob;
  point: number;
}

export interface IFormatRank extends IRank {
  joint: number;
  rank: number;
}

export async function getRankings(): Promise<IRank[]> {
  return (await store.getItem<IRank[]>('rank')) || [];
}

export async function getFormatRankings(): Promise<IFormatRank[]> {
  const ranks = await getRankings();
  const sortRank = ranks.slice().sort((a, b) => {
    return b.point - a.point;
  });
  const rankMap = sortRank.reduce((map, rank) => {
    map.set(rank.point, 1 + (map.get(rank.point) || 0));
    return map;
  }, new Map<number, number>());
  const rankMapKeys = Array.from(rankMap.keys());
  return sortRank.map<IFormatRank>((rank, _index, allRanks) => {
    return {
      ...rank,
      joint: rankMapKeys.indexOf(rank.point),
      rank: allRanks.findIndex(({ point }) => point === rank.point),
    };
  });
}

export async function getFormatRankById(
  id: string
): Promise<IFormatRank | undefined> {
  return (await getFormatRankings()).find((rank) => rank.id === id);
}

export async function addRanking(rank: Omit<IRank, 'id'>): Promise<string> {
  const ranks = await getRankings();
  const id = shortid.generate();
  await store.setItem<IRank[]>('rank', [
    ...ranks,
    {
      ...rank,
      id,
    },
  ]);
  return id;
}
