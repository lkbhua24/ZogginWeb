export class ApiResponse {
  constructor(success, data = null, message = '', code = 200) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = '请求成功') {
    return new ApiResponse(true, data, message, 200);
  }

  static error(message = '请求失败', code = 500, data = null) {
    return new ApiResponse(false, data, message, code);
  }

  static notFound(message = '资源不存在') {
    return new ApiResponse(false, null, message, 404);
  }

  static badRequest(message = '请求参数错误') {
    return new ApiResponse(false, null, message, 400);
  }

  static unauthorized(message = '未授权访问') {
    return new ApiResponse(false, null, message, 401);
  }
}

export class ApiError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function handleApiError(error) {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return ApiResponse.error(error.message, error.code);
  }
  
  if (error instanceof Error) {
    return ApiResponse.error(error.message || '服务器内部错误', 500);
  }
  
  return ApiResponse.error('未知错误', 500);
}
