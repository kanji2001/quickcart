export type PaginationQuery = {
  page?: string;
  limit?: string;
};

export const getPagination = ({ page = '1', limit = '10' }: PaginationQuery) => {
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  return {
    page: pageNumber,
    limit: limitNumber,
    skip,
  };
};

