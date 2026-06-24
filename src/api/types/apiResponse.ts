export interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
}
