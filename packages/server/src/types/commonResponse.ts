export type CommonResponse<TData = any> = {
  data?: TData;
  message?: string;
  error?: any;
  errors?: Error[];
  status: string;
};
