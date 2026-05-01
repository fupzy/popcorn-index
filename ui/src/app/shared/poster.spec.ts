import {
  getPosterUrl,
  PosterWidth,
  TMDB_POSTER_WIDTH_500_BASE_URL,
  TMDB_POSTER_WIDTH_342_BASE_URL,
  TMDB_POSTER_WIDTH_ORIGINAL_BASE_URL
} from './poster';

describe('getPosterUrl', () => {
  const mockPath = '/test.jpg';

  const cases = [
    {
      width: PosterWidth.width500,
      expectedBaseUrl: TMDB_POSTER_WIDTH_500_BASE_URL
    },
    {
      width: PosterWidth.width342,
      expectedBaseUrl: TMDB_POSTER_WIDTH_342_BASE_URL
    }
  ];

  cases.forEach(({ width, expectedBaseUrl }) => {
    it(`should return correct URL for width ${PosterWidth[width]}`, () => {
      const result = getPosterUrl(mockPath, width);

      expect(result).toBe(`${expectedBaseUrl}${mockPath}`);
    });
  });

  it('should fallback to original size when width is unknown', () => {
    const invalidWidth = 999 as PosterWidth;
    const result = getPosterUrl(mockPath, invalidWidth);

    expect(result).toBe(`${TMDB_POSTER_WIDTH_ORIGINAL_BASE_URL}${mockPath}`);
  });

  describe('invalid path handling', () => {
    [null, undefined, ''].forEach((invalidPath) => {
      it(`should return null when path is ${String(invalidPath)}`, () => {
        const result = getPosterUrl(invalidPath, PosterWidth.width500);

        expect(result).toBeNull();
      });
    });
  });

  it('should correctly concatenate base URL and path', () => {
    const result = getPosterUrl('/another.png', PosterWidth.width500);

    expect(result).toBe(`${TMDB_POSTER_WIDTH_500_BASE_URL}/another.png`);
  });
});
