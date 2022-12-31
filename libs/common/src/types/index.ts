export type APIResponse = {
  code: number;
  message?: string;
  errors?: Array<any> | [];
  data?: any | null;
};
