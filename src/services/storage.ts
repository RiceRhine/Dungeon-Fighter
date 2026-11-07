import { Equipment, Gem } from '../types/game';

export interface SaveData {
  version: number;
  gems: Gem[];
  equipped: {
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  };
  inventoryEquipments: Equipment[];
  currentStageIndex: number; // 0 to 11 (Stage 1 to 12)
  currentWaveIndex: number; // 0 to 11 (Enemy 1 to 12)
  unlockedStageMax: number; // 1 to 12
  savedAt: string;
}

const SAVE_STORAGE_KEY = 'gemforge_save_data';

export const storageService = {
  hasSaveGame(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const data = localStorage.getItem(SAVE_STORAGE_KEY);
      return Boolean(data);
    } catch {
      return false;
    }
  },

  loadSaveGame(): SaveData | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SaveData;
    } catch (e) {
      console.error('Failed to load save game', e);
      return null;
    }
  },

  saveGame(data: Omit<SaveData, 'version' | 'savedAt'>): void {
    if (typeof window === 'undefined') return;
    try {
      const payload: SaveData = {
        ...data,
        version: 2,
        savedAt: new Date().toLocaleString('zh-TW', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to write save game', e);
    }
  },

  deleteSaveGame(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to delete save game', e);
    }
  },
};
