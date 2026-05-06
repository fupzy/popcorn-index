@postgresql @integration
Feature: Getting movie reviews

Background:
    Given the defined reviews
        | Id                                   | UserId                               | MediaType | TmdbId | Rating | Comment      | CreatedAt                 | UpdatedAt                 |
        | 11111111-1111-1111-1111-111111111111 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Movie     | 550    | 9      | Mind blowing | 2026-01-01T10:00:00+00:00 | 2026-01-02T10:00:00+00:00 |
        | 22222222-2222-2222-2222-222222222222 | bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb | Movie     | 550    | 7      | Solid        | 2026-01-01T10:00:00+00:00 | 2026-01-03T10:00:00+00:00 |
        | 33333333-3333-3333-3333-333333333333 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Movie     | 999    | 5      | Other movie  | 2026-01-01T10:00:00+00:00 | 2026-01-01T10:00:00+00:00 |
        | 44444444-4444-4444-4444-444444444444 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Series    | 550    | 8      | Same id, TV  | 2026-01-01T10:00:00+00:00 | 2026-01-01T10:00:00+00:00 |

Scenario: 1. Returning all reviews of a given movie, most recent first
    When I get the reviews of movie 550
    Then I receive a "OK" status
    And I receive the response
        """
        [
            {
                "id": "22222222-2222-2222-2222-222222222222",
                "userId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "mediaType": "Movie",
                "tmdbId": 550,
                "rating": 7,
                "comment": "Solid",
                "createdAt": "2026-01-01T10:00:00+00:00",
                "updatedAt": "2026-01-03T10:00:00+00:00",
                "seasons": null
            },
            {
                "id": "11111111-1111-1111-1111-111111111111",
                "userId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "mediaType": "Movie",
                "tmdbId": 550,
                "rating": 9,
                "comment": "Mind blowing",
                "createdAt": "2026-01-01T10:00:00+00:00",
                "updatedAt": "2026-01-02T10:00:00+00:00",
                "seasons": null
            }
        ]
        """

Scenario: 2. Returning empty array when no review exists for the movie
    When I get the reviews of movie 12345
    Then I receive a "OK" status
    And I receive the response
        """
        []
        """
