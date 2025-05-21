// src/api/ApiClient.ts

/**
 * Interface for expected API error response structure.
 */
interface ApiErrorResponse {
  message?: string;
  code?: string;
  details?: any; // Depending on your backend, this could be more specific
}

/**
 * Custom Error class for API-related errors.
 * Provides more context like HTTP status and any data from the server.
 */
export class ApiClientError extends Error {
  status: number;
  data: ApiErrorResponse | null;

  constructor(message: string, status: number, data: ApiErrorResponse | null = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;

    // Set the prototype explicitly to ensure 'instanceof' works correctly
    // on transpiled JavaScript code.
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

class ApiClient {
  private baseURL: string;

  constructor() {
    // process.env.REACT_APP_PUBLIC_URL can be undefined, so handle that.
    const publicUrl: string = process.env.REACT_APP_PUBLIC_URL || '';

    // Ensure the publicUrl does not end with a slash if it's not empty and not just '/',
    // to prevent double slashes when combined with endpoints starting with '/'.
    this.baseURL = publicUrl.endsWith('/') && publicUrl.length > 1
                   ? publicUrl.slice(0, -1)
                   : publicUrl;
  }

  /**
   * Private helper to perform the fetch request and handle common logic.
   * @param {string} endpoint The specific API endpoint (e.g., '/get_data').
   * @param {RequestInit} options Fetch options (method, headers, body, etc.).
   * @returns {Promise<T>} A promise that resolves with the JSON response of type T.
   * @throws {ApiClientError} Throws an ApiClientError if the network request fails or if the HTTP status is not OK.
   */
  private async _request<T>(endpoint: string, options: RequestInit): Promise<T | null> {
    const fullUrl = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(fullUrl, options);

      if (!response.ok) {
        let errorData: ApiErrorResponse | null = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (jsonError) {
            console.warn(`Failed to parse JSON error response for ${fullUrl}:`, jsonError);
          }
        }
        
        const errorMessage = errorData?.message || response.statusText || 'Something went wrong';
        throw new ApiClientError(errorMessage, response.status, errorData);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as T;
      }
      return null; // For successful responses with no JSON body (e.g., 204 No Content)
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error; // Re-throw custom API errors directly
      } else if (error instanceof Error) {
        // Handle network errors or other unexpected errors
        console.error(`Network or unexpected error for ${fullUrl}:`, error);
        throw new ApiClientError(error.message, 0, null); // Use status 0 for network errors
      }
      // Fallback for truly unknown errors
      throw new ApiClientError('An unknown error occurred.', 0, null);
    }
  }

  /**
   * Performs a GET request.
   * @param {string} endpoint The API endpoint (e.g., '/get_data').
   * @param {Record<string, string | number | boolean>} [queryParams] Optional query parameters (e.g., { id: 1 }).
   * @returns {Promise<T>}
   */
  get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean>): Promise<T | null> {
    let url = endpoint;
    if (queryParams) {
      const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
      url += `?${queryString}`;
    }
    return this._request<T>(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Performs a POST request.
   * @param {string} endpoint The API endpoint (e.g., '/add_item').
   * @param {object} data The data to send in the request body.
   * @returns {Promise<T>}
   */
  post<T>(endpoint: string, data: object): Promise<T | null> {
    return this._request<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Performs a PUT request.
   * @param {string} endpoint The API endpoint (e.g., '/update_item/1').
   * @param {object} data The data to send in the request body.
   * @returns {Promise<T>}
   */
  put<T>(endpoint: string, data: object): Promise<T | null> {
    return this._request<T>(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Performs a DELETE request.
   * @param {string} endpoint The API endpoint (e.g., '/delete_item/1').
   * @returns {Promise<T>} Resolves with null if successful (often no content for DELETE).
   */
  delete<T>(endpoint: string): Promise<T | null> {
    return this._request<T>(endpoint, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
  }
}

// Export a singleton instance for convenience
export const apiClient = new ApiClient();
