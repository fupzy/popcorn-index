@postgresql @integration
Feature: Logging a user in

Background:
    Given the defined users
        | Id                                   | Username | PasswordHash                     |
        | 8fcbb75f-83b4-40c1-a01a-59982dafb7f1 | JohnDoe  | JohnDoe_some_john_doe_password   |
        | 1279ae3a-7a4a-4ce1-aa3f-0b3427a03368 | Danny    | Danny_some_danny_password        |
        | f4d9d1fd-f3a5-4bcc-88d2-7e0074a08b6b | BobSmith | BobSmith_some_bob_smith_password |
    And the generated tokens for users
        | Username | Token       |
        | Danny    | danny_token |

Scenario: 1. Logging a user in
     When A user log in with the command
        """
            {
                "username": "Danny",
                "password": "some_danny_password"
            }
        """
    Then I receive a "OK" status
    And I receive the response
        """
            {
                "token": "danny_token"
            }
        """

Scenario: 2. Logging a user in with an invalid password
     When A user log in with the command
        """
            {
                "username": "Danny",
                "password": "invalid_password"
            }
        """
    Then I receive a "Unauthorized" status

Scenario Outline: 3. Logging a user in with an invalid password validation
     When A user log in with the command
        """
            {
                "username": "Danny",
                "password": <password>
            }
        """
    Then I receive a "BadRequest" status
    And I receive the validation errors
        """
            {
                "<property>": ["<message>"]
            }
        """

    Examples: 
        | password | property | message                                     |
        | null     | Password | The Password field is required.             |
        | ""       | Password | Password cannot be empty                    |
        | "a"      | Password | Password must be at least 6 characters long |
        | "aa"     | Password | Password must be at least 6 characters long |
        | "aaa"    | Password | Password must be at least 6 characters long |
        | "aaaa"   | Password | Password must be at least 6 characters long |
        | "aaaaa"  | Password | Password must be at least 6 characters long |

Scenario Outline: 4. Logging a user in with an invalid username validation
     When A user log in with the command
        """
            {
                "username": <username>,
                "password": "some_password"
            }
        """
    Then I receive a "BadRequest" status
    And I receive the validation errors
        """
            {
                "<property>": ["<message>"]
            }
        """

    Examples: 
        | username | property | message                                     |
        | null     | Username | The Username field is required.             |
        | ""       | Username | Username cannot be empty                    |
        | "a"      | Username | Username must be at least 3 characters long |
        | "aa"     | Username | Username must be at least 3 characters long |
