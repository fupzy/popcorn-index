@postgresql @integration
Feature: Getting items

Scenario: Get all stored items
    When I get the items
    Then I receive a "OK" status
    And I receive the response
        """
        [
            {
                "name": "Bonjour"
            },
            {
                "name": "Hello"
            },
            {
                "name": "Hola"
            }
        ]
        """