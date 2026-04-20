export class PerformanceCache {
  constructor(config = {}) {
    this.maxSize = config.maxSize || 100;
    this.defaultTTL = config.defaultTTL || 60000;
    this.cache = new Map();
    this.accessOrder = [];
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10000);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.missCount++;
      return null;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }
    
    this.hitCount++;
    this.updateAccessOrder(key);
    
    return item.data;
  }

  set(key, data, ttl = this.defaultTTL) {
    if (this.cache.has(key)) {
      this.updateAccessOrder(key);
    } else {
      if (this.cache.size >= this.maxSize) {
        this.evict();
      }
      this.accessOrder.push(key);
    }
    
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
      accessCount: 0
    });
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    const exists = this.cache.delete(key);
    if (exists) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }
    return exists;
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }
    
    const item = this.cache.get(key);
    if (item) {
      item.accessCount++;
    }
  }

  evict() {
    if (this.accessOrder.length === 0) return;
    
    const lruKey = this.accessOrder.shift();
    this.cache.delete(lruKey);
    this.evictionCount++;
  }

  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.delete(key);
    });
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
      evictionCount: this.evictionCount,
      accessOrderLength: this.accessOrder.length
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export class MultiLevelCache {
  constructor(config = {}) {
    this.l1Cache = new PerformanceCache({
      maxSize: config.l1MaxSize || 50,
      defaultTTL: config.l1TTL || 30000
    });
    
    this.l2Cache = new PerformanceCache({
      maxSize: config.l2MaxSize || 100,
      defaultTTL: config.l2TTL || 60000
    });
    
    this.l3Cache = new PerformanceCache({
      maxSize: config.l3MaxSize || 200,
      defaultTTL: config.l3TTL || 120000
    });
  }

  get(key) {
    const l1Data = this.l1Cache.get(key);
    if (l1Data !== null) {
      return { data: l1Data, level: 'L1' };
    }
    
    const l2Data = this.l2Cache.get(key);
    if (l2Data !== null) {
      this.l1Cache.set(key, l2Data);
      return { data: l2Data, level: 'L2' };
    }
    
    const l3Data = this.l3Cache.get(key);
    if (l3Data !== null) {
      this.l1Cache.set(key, l3Data);
      this.l2Cache.set(key, l3Data);
      return { data: l3Data, level: 'L3' };
    }
    
    return { data: null, level: null };
  }

  set(key, data, options = {}) {
    const { level = 'all', ttl } = options;
    
    if (level === 'all' || level === 'L1') {
      this.l1Cache.set(key, data, ttl);
    }
    
    if (level === 'all' || level === 'L2') {
      this.l2Cache.set(key, data, ttl);
    }
    
    if (level === 'all' || level === 'L3') {
      this.l3Cache.set(key, data, ttl);
    }
  }

  delete(key) {
    this.l1Cache.delete(key);
    this.l2Cache.delete(key);
    this.l3Cache.delete(key);
  }

  clear() {
    this.l1Cache.clear();
    this.l2Cache.clear();
    this.l3Cache.clear();
  }

  getStats() {
    return {
      L1: this.l1Cache.getStats(),
      L2: this.l2Cache.getStats(),
      L3: this.l3Cache.getStats()
    };
  }

  destroy() {
    this.l1Cache.destroy();
    this.l2Cache.destroy();
    this.l3Cache.destroy();
  }
}

export const performanceCache = new PerformanceCache();
export const multiLevelCache = new MultiLevelCache();
