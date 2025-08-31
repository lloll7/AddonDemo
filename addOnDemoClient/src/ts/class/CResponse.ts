interface IResponse<T> {
  error: number;
  msg?: string;
  data?: T;
}

export type { IResponse };
