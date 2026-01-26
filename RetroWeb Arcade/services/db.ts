import { StoredGame, Game } from '../types';

const DB_NAME = 'RetroWebArcadeDB';
const DB_VERSION = 1;
const STORE_NAME = 'games';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject('Database error: ' + (event.target as IDBOpenDBRequest).error);

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveGame = async (game: StoredGame): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(game);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updateGameMetadata = async (id: string, updates: Partial<Game>): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);
  
      getRequest.onsuccess = () => {
        const game = getRequest.result as StoredGame;
        if (game) {
          // Merge updates into the existing game object (preserving the blob)
          const updatedGame = { ...game, ...updates };
          const putRequest = store.put(updatedGame);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
           reject("Game not found");
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  };

export const getAllGames = async (): Promise<StoredGame[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getGameBlob = async (id: string): Promise<Blob | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
        const result = request.result as StoredGame;
        resolve(result ? result.blob : undefined);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteGame = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
  
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

// -- Profile / Backup Features --

export const exportMetadata = async (settings?: any): Promise<string> => {
    const games = await getAllGames();
    // Exclude the BLOBs to create a lightweight JSON profile
    const metadataOnly = games.map(({ blob, ...rest }) => rest);
    
    return JSON.stringify({
        version: 2,
        exportedAt: Date.now(),
        profile: {
            settings: settings || {},
            games: metadataOnly
        }
    }, null, 2);
};

export const clearLibrary = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};