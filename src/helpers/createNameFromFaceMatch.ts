import { C3FaceMatch } from '../modules/chamchamcham';

const expressionMap: Record<string, string> = {
  neutral: '평범한',
  happy: '행복한',
  sad: '슬픈',
  angry: '화난',
  fearful: '근심가득한',
  disgusted: '귀찮은',
  surprised: '깜짝놀란',
};

export default function createNameFromFaceMatch(match: C3FaceMatch) {
  const gender = match.gender === 'male' ? '남' : '녀';
  const expression =
    expressionMap[match.expressions.asSortedArray()[0].expression];
  const age = Math.ceil(match.age);
  return `${expression} ${age}세 미경${gender}`;
}
