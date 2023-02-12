/**
 * Validate a response to ensure the HTTP status code indcates success.
 * 
 * @param {Response} response HTTP response to be checked
 * @returns {object} object encoded by JSON in the response
 */
export default function validateJSON(response) {
  if (response.ok) {
      return response.json();
  } else {
      return Promise.reject(response);
  }
}