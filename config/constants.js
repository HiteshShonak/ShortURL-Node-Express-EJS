/* Application constants */

const ERROR_MESSAGES = {
    URL_REQUIRED: 'URL is required',
    URL_INVALID: 'Please enter a valid URL (http or https)',
    URL_NOT_FOUND: 'Short URL not found',
    UNAUTHORIZED: 'Unauthorized',
    SERVER_ERROR: 'Server Error',
    LINK_NOT_FOUND: 'Link not found',
    UNAUTHORIZED_ACCESS: 'Unauthorized Access',
    NAME_REQUIRED: 'Name is required',
    EMAIL_REQUIRED: 'Email is required',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
    EMAIL_EXISTS: 'This email is already registered.',
    INVALID_CREDENTIALS: 'No account found with this email.',
    INCORRECT_PASSWORD: 'Incorrect password.',
    INTERNAL_ERROR: 'Internal Server Error'
};

const SUCCESS_MESSAGES = {
    DELETED: 'Deleted',
    LOGOUT_SUCCESS: 'Logged out successfully',
    LOGIN_SUCCESS: 'Login successful',
    SIGNUP_SUCCESS: 'Account created successfully'
};

const DEVICE_TYPES = {
    DESKTOP: 'Desktop',
    MOBILE: 'Mobile',
    TABLET: 'Tablet',
    BOT: 'Bot'
};

const DEFAULT_VALUES = {
    UNKNOWN: 'Unknown',
    DIRECT: 'Direct'
};

module.exports = {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    DEVICE_TYPES,
    DEFAULT_VALUES
};
