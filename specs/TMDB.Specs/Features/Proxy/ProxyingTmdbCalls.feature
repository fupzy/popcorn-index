@postgresql @integration
Feature: Proxying TMDB calls

Background:
    Given the TMDB API key is "test_api_key"

Scenario: 1. The API key is appended when no query string is sent
    Given the TMDB API will respond with status "OK" and body
        """
        {
            "id": 550,
            "title": "Fight Club"
        }
        """
    When I call the TMDB proxy with "GET" on "movie/550"
    Then I receive a "OK" status
    And I receive the response
        """
        {
            "id": 550,
            "title": "Fight Club"
        }
        """
    And the TMDB API was called with "GET" on "/3/movie/550?api_key=test_api_key"

Scenario: 2. The API key is appended to an existing query string
    Given the TMDB API will respond with status "OK" and body
        """
        {}
        """
    When I call the TMDB proxy with "GET" on "search/movie?query=matrix&language=fr"
    Then I receive a "OK" status
    And the TMDB API was called with "GET" on "/3/search/movie?query=matrix&language=fr&api_key=test_api_key"

Scenario: 3. TMDB error status is propagated to the caller
    Given the TMDB API will respond with status "NotFound" and body
        """
        {
            "status_code": 34,
            "status_message": "The resource you requested could not be found."
        }
        """
    When I call the TMDB proxy with "GET" on "movie/99999999"
    Then I receive a "NotFound" status

Scenario: 4. The request body is forwarded on POST
    Given the TMDB API will respond with status "Created" and body
        """
        {}
        """
    When I call the TMDB proxy with "POST" on "list" and body
        """
        {
            "name": "My list"
        }
        """
    Then I receive a "Created" status
    And the TMDB API received the body
        """
        {
            "name": "My list"
        }
        """
