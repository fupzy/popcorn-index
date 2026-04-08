@postgresql @integration
Feature: Getting all users

Background:
    Given the defined users
        | Id                                   | Username | PasswordHash                 |
        | 8fcbb75f-83b4-40c1-a01a-59982dafb7f1 | JohnDoe  | some_john_doe_password_hash  |
        | 1279ae3a-7a4a-4ce1-aa3f-0b3427a03368 | Danny    | some_danny_password_hash     |
        | f4d9d1fd-f3a5-4bcc-88d2-7e0074a08b6b | BobSmith | some_bob_smith_password_hash |

Scenario: 1. Getting the defined users
    When I get all the defined users
    Then I receive a "OK" status
    And I receive the response
        """
        [
            {
                "id": "f4d9d1fd-f3a5-4bcc-88d2-7e0074a08b6b",
                "username": "BobSmith",
                "passwordHash": "some_bob_smith_password_hash"
            },
            {
                "id": "1279ae3a-7a4a-4ce1-aa3f-0b3427a03368",
                "username": "Danny",
                "passwordHash": "some_danny_password_hash"
            },
            {
                "id": "8fcbb75f-83b4-40c1-a01a-59982dafb7f1",
                "username": "JohnDoe",
                "passwordHash": "some_john_doe_password_hash"
            }
        ]
        """