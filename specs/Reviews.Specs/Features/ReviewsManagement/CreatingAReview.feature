@postgresql @integration
Feature: Creating a review

Scenario: 1. Creating a movie review persists it
    Given the GUID provider next ids are
        | Id                                   |
        | 11111111-1111-1111-1111-111111111111 |
    When I create a review with the command
        """
        {
            "userId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
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

Scenario Outline: 2. Rejecting an out-of-range rating
    When I create a review with the command
        """
        {
            "userId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
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

Scenario: 3. Rejecting season reviews on a movie
    When I create a review with the command
        """
        {
            "userId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
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

Scenario: 4. Rejecting duplicate season numbers
    When I create a review with the command
        """
        {
            "userId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
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
