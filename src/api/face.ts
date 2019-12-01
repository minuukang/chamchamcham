import * as faceapi from 'face-api.js';
import { C3FaceMatch } from '../modules/chamchamcham';
import store from './index';

interface IFaceMatcher {
  id: string;
  data: any;
}

export async function getBestMatchCollection(
  faceMatch: C3FaceMatch
): Promise<faceapi.FaceMatcher | null> {
  const matchers = (
    (await store.getItem<IFaceMatcher[]>('faceMatches')) || []
  ).map((matches) => {
    const faceMatcher = faceapi.FaceMatcher.fromJSON(matches.data);
    return {
      faceMatcher,
      distance: faceMatcher.findBestMatch(faceMatch.descriptor).distance,
    };
  });
  const [bestMatcher] = matchers
    .filter(({ distance, faceMatcher }) => {
      return distance < faceMatcher.distanceThreshold;
    })
    .sort((a, b) => {
      return a.distance - b.distance;
    });
  return bestMatcher ? bestMatcher.faceMatcher : null;
}

export async function setBestMatchCollection(
  id: string,
  faceMatcher: faceapi.FaceMatcher
) {
  const faceMatchers =
    (await store.getItem<IFaceMatcher[]>('faceMatches')) || [];
  if (!faceMatchers.some((match) => match.id === id)) {
    await store.setItem<IFaceMatcher[]>('faceMatches', [
      ...faceMatchers,
      {
        id,
        data: faceMatcher.toJSON(),
      },
    ]);
  }
}
