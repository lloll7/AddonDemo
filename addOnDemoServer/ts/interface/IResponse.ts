export interface Response<T> {
  error: number;
  msg: string;
  data: T;
}
