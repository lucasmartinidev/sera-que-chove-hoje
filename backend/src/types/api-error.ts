export type ApiErrorCode = 'INVALID_PARAM' | 'UPSTREAM_ERROR' | 'INTERNAL_ERROR';

export type ApiErrorInput = {
  code: ApiErrorCode;
  message: string;
};

export type ApiErrorEnvelope = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  INVALID_PARAM: 400,
  UPSTREAM_ERROR: 502,
  INTERNAL_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode: number;

  constructor(input: ApiErrorInput) {
    super(input.message);
    this.name = 'ApiError';
    this.code = input.code;
    this.statusCode = STATUS_BY_CODE[input.code];
  }
}
