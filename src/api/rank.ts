import store from './index';
import shortid from 'shortid';

export interface IRank {
  id: string;
  name: string;
  createdAt: Date;
  image: Blob;
  point: number;
}

export async function getRankings(): Promise<IRank[]> {
  return (await store.getItem<IRank[]>('rank')) || [];
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
