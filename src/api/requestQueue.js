export class RequestQueue {
  constructor(config = {}) {
    this.maxConcurrent = config.maxConcurrent || 10;
    this.maxQueueSize = config.maxQueueSize || 100;
    this.queue = [];
    this.activeRequests = 0;
    this.totalProcessed = 0;
    this.totalFailed = 0;
    this.totalDuration = 0;
  }

  async add(requestFn, priority = 0) {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('请求队列已满，请稍后重试');
    }
    
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.queue.sort((a, b) => b.priority - a.priority);
      
      this.process();
    });
  }

  async process() {
    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      this.activeRequests++;
      
      const startTime = Date.now();
      
      try {
        const result = await request.requestFn();
        const duration = Date.now() - startTime;
        
        this.totalProcessed++;
        this.totalDuration += duration;
        
        request.resolve(result);
      } catch (error) {
        this.totalFailed++;
        request.reject(error);
      } finally {
        this.activeRequests--;
        this.process();
      }
    }
  }

  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      averageDuration: this.totalProcessed > 0 
        ? Math.round(this.totalDuration / this.totalProcessed) 
        : 0
    };
  }

  clear() {
    this.queue.forEach(request => {
      request.reject(new Error('队列已清空'));
    });
    this.queue = [];
  }
}

export class RateLimiter {
  constructor(config = {}) {
    this.maxRequests = config.maxRequests || 100;
    this.windowMs = config.windowMs || 60000;
    this.requests = [];
    this.rejectedCount = 0;
  }

  async acquire() {
    const now = Date.now();
    
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (this.requests.length >= this.maxRequests) {
      this.rejectedCount++;
      throw new Error('请求频率过高，请稍后重试');
    }
    
    this.requests.push(now);
    return true;
  }

  getStats() {
    return {
      currentRequests: this.requests.length,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      rejectedCount: this.rejectedCount
    };
  }

  reset() {
    this.requests = [];
    this.rejectedCount = 0;
  }
}

export class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
    this.deduplicatedCount = 0;
  }

  async execute(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      this.deduplicatedCount++;
      return this.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    
    return promise;
  }

  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      deduplicatedCount: this.deduplicatedCount
    };
  }

  clear() {
    this.pendingRequests.clear();
  }
}

export class RequestBatcher {
  constructor(config = {}) {
    this.batchWindow = config.batchWindow || 10;
    this.maxBatchSize = config.maxBatchSize || 10;
    this.batches = new Map();
    this.batchedCount = 0;
  }

  async add(key, data, batchFn) {
    if (!this.batches.has(key)) {
      this.batches.set(key, {
        items: [],
        timer: null,
        resolve: null,
        reject: null
      });
      
      setTimeout(() => this.executeBatch(key, batchFn), this.batchWindow);
    }
    
    const batch = this.batches.get(key);
    
    return new Promise((resolve, reject) => {
      batch.items.push({ data, resolve, reject });
      
      if (batch.items.length >= this.maxBatchSize) {
        this.executeBatch(key, batchFn);
      }
    });
  }

  async executeBatch(key, batchFn) {
    const batch = this.batches.get(key);
    if (!batch || batch.items.length === 0) return;
    
    this.batchedCount += batch.items.length;
    
    const items = batch.items.splice(0, batch.items.length);
    
    try {
      const results = await batchFn(items.map(item => item.data));
      
      items.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      items.forEach(item => {
        item.reject(error);
      });
    }
    
    if (batch.items.length === 0) {
      this.batches.delete(key);
    }
  }

  getStats() {
    return {
      activeBatches: this.batches.size,
      batchedCount: this.batchedCount
    };
  }

  clear() {
    this.batches.forEach((batch, key) => {
      batch.items.forEach(item => {
        item.reject(new Error('批处理已清空'));
      });
    });
    this.batches.clear();
  }
}

export const requestQueue = new RequestQueue();
export const rateLimiter = new RateLimiter();
export const requestDeduplicator = new RequestDeduplicator();
export const requestBatcher = new RequestBatcher();
