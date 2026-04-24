// ─── API Response Messages ────────────────────────────────────────────────────
// Exact strings returned by automationexercise.com API responses
// Used in test assertions — must match API responses character for character

export const MESSAGES = {

  // ─── Auth Messages ─────────────────────────────────────────────────────────
  AUTH: {
    USER_EXISTS:          'User exists!',
    USER_NOT_FOUND:       'User not found!',
    INVALID_CREDENTIALS:  'User not found!',
  },

  // ─── User Messages ─────────────────────────────────────────────────────────
  USER: {
    CREATED:              'User created!',
    UPDATED:              'User updated!',
    DELETED:              'Account deleted!',
    NOT_FOUND:            'Account not found!',
  },

  // ─── Error Messages ────────────────────────────────────────────────────────
  ERRORS: {
    METHOD_NOT_SUPPORTED:         'This request method is not supported.',
    MISSING_SEARCH_PARAM:         'Bad request, search_product parameter is missing in POST request.',
    MISSING_EMAIL_OR_PASSWORD:    'Bad request, email or password parameter is missing in POST request.',
  },

  // ─── Response Code Field ──────────────────────────────────────────────────
  // automationexercise.com returns a "responseCode" field in the body
  // alongside the HTTP status code — both must be asserted
  RESPONSE_CODES: {
    OK:                   200,
    CREATED:              201,
    BAD_REQUEST:          400,
    NOT_FOUND:            404,
    METHOD_NOT_ALLOWED:   405,
  },

} as const;

// ─── Type export ──────────────────────────────────────────────────────────────
export type MessageKey = keyof typeof MESSAGES;
