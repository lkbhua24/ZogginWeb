export class HttpClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 60000;
    
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  requestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  responseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  errorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  async applyRequestInterceptors(config) {
    let processedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    return processedConfig;
  }

  async applyResponseInterceptors(response) {
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    return processedResponse;
  }

  async applyErrorInterceptors(error) {
    let processedError = error;
    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }
    throw processedError;
  }

  getCacheKey(config) {
    return `${config.method || 'GET'}:${config.url}:${JSON.stringify(config.params || {})}`;
  }

  getFromCache(key) {
    if (!this.cacheEnabled) return null;
    
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  setCache(key, data) {
    if (!this.cacheEnabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request(config) {
    const startTime = Date.now();
    
    try {
      let processedConfig = await this.applyRequestInterceptors(config);
      
      if (processedConfig.method === 'GET' || !processedConfig.method) {
        const cacheKey = this.getCacheKey(processedConfig);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return {
            ...cached,
            fromCache: true,
            duration: Date.now() - startTime
          };
        }
      }

      let lastError;
      let retryCount = 0;
      
      while (retryCount <= this.maxRetries) {
        try {
          const response = await this.executeRequest(processedConfig);
          
          let processedResponse = await this.applyResponseInterceptors({
            ...response,
            duration: Date.now() - startTime
          });
          
          if (processedConfig.method === 'GET' || !processedConfig.method) {
            const cacheKey = this.getCacheKey(processedConfig);
            this.setCache(cacheKey, processedResponse);
          }
          
          return processedResponse;
        } catch (error) {
          lastError = error;
          retryCount++;
          
          if (retryCount <= this.maxRetries && this.shouldRetry(error)) {
            await this.delay(this.retryDelay * retryCount);
            continue;
          }
          
          break;
        }
      }
      
      throw lastError;
    } catch (error) {
      try {
        await this.applyErrorInterceptors(error);
      } catch (interceptedError) {
        return {
          success: false,
          error: interceptedError.message || '请求失败',
          duration: Date.now() - startTime
        };
      }
      
      return {
        success: false,
        error: error.message || '请求失败',
        duration: Date.now() - startTime
      };
    }
  }

  shouldRetry(error) {
    if (error.name === 'TimeoutError') return true;
    if (error.name === 'NetworkError') return true;
    if (error.status >= 500) return true;
    return false;
  }

  async executeRequest(config) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      const error = new Error('请求超时');
      error.name = 'TimeoutError';
      throw error;
    }, config.timeout || this.timeout);

    try {
      const url = this.buildURL(config.url, config.params);
      
      const fetchOptions = {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        signal: controller.signal
      };

      if (config.data && config.method !== 'GET') {
        fetchOptions.body = JSON.stringify(config.data);
      }

      const response = await fetch(url, fetchOptions);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('请求超时');
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
      
      throw error;
    }
  }

  buildURL(url, params) {
    const fullURL = this.baseURL ? `${this.baseURL}${url}` : url;
    
    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }
    
    const urlObj = new URL(fullURL, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, value);
      }
    });
    
    return urlObj.toString();
  }

  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }

  patch(url, data, config = {}) {
    return this.request({ ...config, method: 'PATCH', url, data });
  }
}

export const httpClient = new HttpClient();
