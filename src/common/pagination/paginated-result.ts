
export function paginateResult(
  [data, total]: [unknown[], number],
  page: number,
  limit: number,
){
  const totalPages = Math.ceil(total / limit);

  return { 
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
     data,
  };
}