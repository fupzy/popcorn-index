@postgresql @integration
Feature: Creating a review

Scenario: 1. Creating a movie review persists it
    Given the defined users
        | Id                                   | Username | PasswordHash |
        | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Alice    | hash         |
    And the GUID provider next ids are
        | Id                                   |
        | 11111111-1111-1111-1111-111111111111 |
    And I am authenticated as the user "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    When I create a review with the command
        """
        {
            "mediaType": "Movie",
            "tmdbId": 550,
            "rating": 8,
            "comment": "Great"
        }
        """
    Then I receive a "OK" status
    And the stored reviews are
        | Id                                   | UserId                               | MediaType | TmdbId | Rating | Comment |
        | 11111111-1111-1111-1111-111111111111 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Movie     | 550    | 8      | Great   |

Scenario: 2. Attributing the review to the authenticated user, whatever the body claims
    Given the defined users
        | Id                                   | Username | PasswordHash |
        | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Alice    | hash         |
        | bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb | Bob      | hash         |
    And the GUID provider next ids are
        | Id                                   |
        | 11111111-1111-1111-1111-111111111111 |
    And I am authenticated as the user "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    When I create a review with the command
        """
        {
            "userId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            "mediaType": "Movie",
            "tmdbId": 550,
            "rating": 8,
            "comment": "Great"
        }
        """
    Then I receive a "OK" status
    And the stored reviews are
        | Id                                   | UserId                               | Username | MediaType | TmdbId |
        | 11111111-1111-1111-1111-111111111111 | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Alice    | Movie     | 550    |

Scenario: 3. Rejecting an unauthenticated creation
    When I create a review with the command
        """
        {
            "mediaType": "Movie",
            "tmdbId": 550,
            "rating": 8,
            "comment": "Great"
        }
        """
    Then I receive a "Unauthorized" status

Scenario Outline: 4. Rejecting an out-of-range rating
    Given I am authenticated as the user "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    When I create a review with the command
        """
        {
            "mediaType": "Movie",
            "tmdbId": 550,
            "rating": <rating>
        }
        """
    Then I receive a "BadRequest" status
    And I receive the validation errors
        """
        {
            "Rating": ["Rating must be between 0 and 10"]
        }
        """

    Examples:
        | rating |
        | -1     |
        | 11     |

Scenario: 5. Rejecting season reviews on a movie
    Given I am authenticated as the user "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    When I create a review with the command
        """
        {
            "mediaType": "Movie",
            "tmdbId": 550,
            "rating": 8,
            "seasons": [
                { "seasonNumber": 1, "rating": 8 }
            ]
        }
        """
    Then I receive a "BadRequest" status
    And I receive the validation errors
        """
        {
            "Seasons": ["Movies cannot have season reviews"]
        }
        """

Scenario: 6. Rejecting duplicate season numbers
    Given I am authenticated as the user "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    When I create a review with the command
        """
        {
            "mediaType": "Series",
            "tmdbId": 1399,
            "rating": 8,
            "seasons": [
                { "seasonNumber": 1, "rating": 8 },
                { "seasonNumber": 1, "rating": 9 }
            ]
        }
        """
    Then I receive a "BadRequest" status
    And I receive the validation errors
        """
        {
            "Seasons": ["Seasons must not contain duplicate SeasonNumber values"]
        }
        """
