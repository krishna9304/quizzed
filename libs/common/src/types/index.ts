export type APIResponse = {
  statusCode: number;
  message?: string;
  errors?: Array<any> | [];
  data?: any | null;
};
