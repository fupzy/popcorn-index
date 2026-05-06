@postgresql @integration
Feature: Updating a review

Background:
    Given the defined reviews
        | Id                                   | UserId                               | MediaType | TmdbId | Rating | Comment | CreatedAt                 | UpdatedAt                 |
        | 11111111-1111-1111-1111-111111111111 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Movie     | 550    | 5      | Meh     | 2026-01-01T10:00:00+00:00 | 2026-01-01T10:00:00+00:00 |

Scenario: 1. Updating an existing review persists the new values
    When I update the review "11111111-1111-1111-1111-111111111111" with the command
        """
        {
            "rating": 9,
            "comment": "Changed my mind"
        }
        """
    Then I receive a "OK" status
    And the stored reviews are
        | Id                                   | UserId                               | MediaType | TmdbId | Rating | Comment         |
        | 11111111-1111-1111-1111-111111111111 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Movie     | 550    | 9      | Changed my mind |

Scenario: 2. Updating an unknown review returns NotFound
    When I update the review "99999999-9999-9999-9999-999999999999" with the command
        """
        {
            "rating": 9
        }
        """
    Then I receive a "NotFound" status
