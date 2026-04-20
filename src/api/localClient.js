import storage from '../utils/storage.js';

export class LocalClient {
  constructor(config = {}) {
    this.timeout = config.timeout || 5000;
    this.maxRetries = config.maxRetries || 2;
    this.retryDelay = config.retryDelay || 100;
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 30000;
    
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
    
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageDuration: 0,
      cacheHits: 0
    };
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

  getCacheKey(key) {
    return `local:${key}`;
  }

  getFromCache(key) {
    if (!this.cacheEnabled) return null;
    
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.performanceMetrics.cacheHits++;
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

  updateMetrics(duration, success) {
    this.performanceMetrics.totalRequests++;
    if (success) {
      this.performanceMetrics.successfulRequests++;
    } else {
      this.performanceMetrics.failedRequests++;
    }
    
    const totalDuration = this.performanceMetrics.averageDuration * (this.performanceMetrics.totalRequests - 1) + duration;
    this.performanceMetrics.averageDuration = totalDuration / this.performanceMetrics.totalRequests;
  }

  getMetrics() {
    return { ...this.performanceMetrics };
  }

  async request(config) {
    const startTime = Date.now();
    
    try {
      let processedConfig = await this.applyRequestInterceptors(config);
      
      const cacheKey = this.getCacheKey(processedConfig.key);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        const duration = Date.now() - startTime;
        this.updateMetrics(duration, true);
        return {
          success: true,
          data: cached,
          fromCache: true,
          duration
        };
      }

      let lastError;
      let retryCount = 0;
      
      while (retryCount <= this.maxRetries) {
        try {
          const response = await this.executeWithTimeout(processedConfig);
          
          let processedResponse = await this.applyResponseInterceptors({
            ...response,
            duration: Date.now() - startTime
          });
          
          if (processedResponse.success && processedResponse.data !== null) {
            this.setCache(cacheKey, processedResponse.data);
          }
          
          this.updateMetrics(processedResponse.duration, true);
          return processedResponse;
        } catch (error) {
          lastError = error;
          retryCount++;
          
          if (retryCount <= this.maxRetries) {
            await this.delay(this.retryDelay * retryCount);
            continue;
          }
          
          break;
        }
      }
      
      throw lastError;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, false);
      
      try {
        await this.applyErrorInterceptors(error);
      } catch (interceptedError) {
        return {
          success: false,
          error: interceptedError.message || '请求失败',
          duration
        };
      }
      
      return {
        success: false,
        error: error.message || '请求失败',
        duration
      };
    }
  }

  async executeWithTimeout(config) {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const error = new Error('请求超时');
        error.name = 'TimeoutError';
        reject(error);
      }, config.timeout || this.timeout);

      try {
        let data;
        
        switch (config.method) {
          case 'get':
            data = await storage.get(config.key);
            break;
          case 'set':
            await storage.set(config.key, config.data);
            data = { success: true };
            break;
          case 'remove':
            await storage.remove(config.key);
            data = { success: true };
            break;
          case 'clear':
            await storage.clear();
            data = { success: true };
            break;
          case 'keys':
            data = await storage.keys();
            break;
          default:
            data = await storage.get(config.key);
        }
        
        clearTimeout(timeoutId);
        resolve({
          success: true,
          data
        });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  get(key, config = {}) {
    return this.request({ ...config, method: 'get', key });
  }

  set(key, data, config = {}) {
    return this.request({ ...config, method: 'set', key, data });
  }

  remove(key, config = {}) {
    return this.request({ ...config, method: 'remove', key });
  }

  clear(config = {}) {
    return this.request({ ...config, method: 'clear' });
  }

  keys(config = {}) {
    return this.request({ ...config, method: 'keys' });
  }
}

export const localClient = new LocalClient();
