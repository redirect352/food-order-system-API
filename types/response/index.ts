export type ResponseWithPagination<T> = {
  page: number;
  totalPages: number;
  data: T;
};
