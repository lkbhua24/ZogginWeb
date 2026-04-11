import localforage from 'localforage';

localforage.config({
  name: 'Zoggin',
  storeName: 'zoggin_store',
  description: 'Zoggin Vocabulary Learning App Storage'
});

const storage = {
  async get(key) {
    try {
      return await localforage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      return await localforage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item:', error);
      return null;
    }
  },

  async remove(key) {
    try {
      return await localforage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
      return null;
    }
  },

  async clear() {
    try {
      return await localforage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      return null;
    }
  },

  async keys() {
    try {
      return await localforage.keys();
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  },

  async exportData() {
    try {
      const keys = await this.keys();
      const data = {};
      
      for (const key of keys) {
        data[key] = await this.get(key);
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  async importData(data) {
    try {
      await this.clear();
      
      for (const [key, value] of Object.entries(data)) {
        await this.set(key, value);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};

export default storage;