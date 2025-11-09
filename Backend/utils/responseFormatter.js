export const formatResponse = (success, message, data = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
};

export const formatPaginatedResponse = (items, page, limit, total) => {
  return {
    success: true,
    data: {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    }
  };
};