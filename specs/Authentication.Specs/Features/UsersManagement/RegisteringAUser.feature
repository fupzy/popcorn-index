@postgresql @integration
Feature: Registering a user

Background:
    Given the GUID provider next ids are
        | Id                                   |
        | 9b5f2baf-b5d5-4125-ae59-720a65273b4c |

Scenario: 1. Registering a user
    When I register a user with the command
        """
            {
                "username": "JohnDoe",
                "password": "some_john_doe_password"
            }
        """
    Then I receive a "OK" status
    And the stored users are
        | Id                                   | Username | PasswordHash                   |
        | 9b5f2baf-b5d5-4125-ae59-720a65273b4c | JohnDoe  | JohnDoe_some_john_doe_password |

Scenario Outline: 2. Logging a user in with an invalid password validation
     When I register a user with the command
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

Scenario Outline: 3. Logging a user in with an invalid username validation
     When I register a user with the command
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