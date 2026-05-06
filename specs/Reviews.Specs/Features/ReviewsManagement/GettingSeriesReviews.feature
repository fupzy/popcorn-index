@postgresql @integration
Feature: Getting series reviews

Background:
    Given the defined reviews
        | Id                                   | UserId                               | MediaType | TmdbId | Rating | Comment    | CreatedAt                 | UpdatedAt                 |
        | 55555555-5555-5555-5555-555555555555 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Series    | 1399   | 9      | Best ever  | 2026-02-01T10:00:00+00:00 | 2026-02-02T10:00:00+00:00 |
    And the defined season reviews
        | ReviewId                             | SeasonNumber | Rating | Comment       |
        | 55555555-5555-5555-5555-555555555555 | 1            | 9      | Strong start  |
        | 55555555-5555-5555-5555-555555555555 | 8            | 5      | Disappointing |

Scenario: 1. Returning a series review with its per-season notes
    When I get the reviews of series 1399
    Then I receive a "OK" status
    And I receive the response
        """
        [
            {
                "id": "55555555-5555-5555-5555-555555555555",
                "userId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "mediaType": "Series",
                "tmdbId": 1399,
                "rating": 9,
                "comment": "Best ever",
                "createdAt": "2026-02-01T10:00:00+00:00",
                "updatedAt": "2026-02-02T10:00:00+00:00",
                "seasons": [
                    { "seasonNumber": 1, "rating": 9, "comment": "Strong start" },
                    { "seasonNumber": 8, "rating": 5, "comment": "Disappointing" }
                ]
            }
        ]
        """

Scenario: 2. Returning empty array when no review exists for the series
    When I get the reviews of series 12345
    Then I receive a "OK" status
    And I receive the response
        """
        []
        """

