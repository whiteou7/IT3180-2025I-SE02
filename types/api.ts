export type APIBody<T> = {
  success: true;
  data: T;
  message?: string;
} | {
  success: false;
  message?: string;
  error?: string;
}