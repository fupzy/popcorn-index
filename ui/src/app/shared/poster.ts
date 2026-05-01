export const TMDB_POSTER_WIDTH_ORIGINAL_BASE_URL = 'https://image.tmdb.org/t/p/original';
export const TMDB_POSTER_WIDTH_500_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const TMDB_POSTER_WIDTH_342_BASE_URL = 'https://image.tmdb.org/t/p/w342';

export enum PosterWidth {
  width500,
  width342
}

export const getPosterUrl = (path: string | null | undefined, width: PosterWidth): string | null => {
  let baseUrl;

  switch (width) {
    case PosterWidth.width342:
      baseUrl = TMDB_POSTER_WIDTH_342_BASE_URL;
      break;
    case PosterWidth.width500:
      baseUrl = TMDB_POSTER_WIDTH_500_BASE_URL;
      break;
    default:
      baseUrl = TMDB_POSTER_WIDTH_ORIGINAL_BASE_URL;
  }

  return path ? `${baseUrl}${path}` : null;
};
