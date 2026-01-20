/* Global error handling middleware */

function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default error status
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Send error response
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

// Async error wrapper
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    asyncHandler
};
