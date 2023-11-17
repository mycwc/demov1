(exports.apiSuccessResponse = (status, message, data = NULL) => {
    return {
      status: status,
      message: message,
      data: data,
    };
  }),
    (exports.apiErrorResponse = (status, message, error = NULL) => {
      return {
        status: status,
        message: message,
        error: error,
      };
    });
  