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