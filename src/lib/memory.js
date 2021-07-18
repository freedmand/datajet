import localForage from "localforage";

localForage.config({
  driver: localForage.INDEXEDDB,
});

export class LocalDb {
  constructor() {}

  async put(key, value) {
    localForage.setItem(key, value);
  }

  async get(key) {
    return localForage.getItem(key);
  }

  static async init() {
    return new LocalDb();
  }
}

export let db = null;

async function initDb() {
  if (db != null) return;
  db = await LocalDb.init();
}

export function cachedWritable(cacheKey, initValue) {
  const subscriptions = {};

  let id = 0;

  let value = initValue;

  function updateAllSubscribers() {
    for (const key in subscriptions) {
      if (subscriptions.hasOwnProperty(key)) {
        subscriptions[key](value);
      }
    }
  }

  const store = {
    subscribe: (subscription) => {
      const subscriberId = id++;
      subscriptions[subscriberId] = subscription;
      updateAllSubscribers(value);
      return () => delete subscriptions[subscriberId];
    },
    set: (newValue) => {
      value = newValue;
      db.put(cacheKey, value);
      updateAllSubscribers();
    },
  };

  // Try to load cached value
  initDb().then(async () => {
    const newValue = await db.get(cacheKey);
    store.set(newValue);
  });

  return store;
}
