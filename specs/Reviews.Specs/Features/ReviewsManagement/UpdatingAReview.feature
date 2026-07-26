@postgresql @integration
Feature: Updating a review

Background:
    Given the defined reviews
        | Id                                   | UserId                               | Username | MediaType | TmdbId | Rating | Comment | CreatedAt                 | UpdatedAt                 |
        | 11111111-1111-1111-1111-111111111111 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Alice    | Movie     | 550    | 5      | Meh     | 2026-01-01T10:00:00+00:00 | 2026-01-01T10:00:00+00:00 |

Scenario: 1. Updating an existing review persists the new values
    Given I am authenticated as the user "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
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
    Given I am authenticated as the user "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    When I update the review "99999999-9999-9999-9999-999999999999" with the command
        """
        {
            "rating": 9
        }
        """
    Then I receive a "NotFound" status

Scenario: 3. Updating a review owned by somebody else returns NotFound and leaves it untouched
    Given I am authenticated as the user "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
    When I update the review "11111111-1111-1111-1111-111111111111" with the command
        """
        {
            "rating": 9,
            "comment": "Not mine to change"
        }
        """
    Then I receive a "NotFound" status
    And the stored reviews are
        | Id                                   | UserId                               | MediaType | TmdbId | Rating | Comment |
        | 11111111-1111-1111-1111-111111111111 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Movie     | 550    | 5      | Meh     |

Scenario: 4. Rejecting an unauthenticated update
    When I update the review "11111111-1111-1111-1111-111111111111" with the command
        """
        {
            "rating": 9
        }
        """
    Then I receive a "Unauthorized" status
