import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Material } from '../data/materials';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isPremium: boolean;
  premiumExpiresAt?: string;
  credits: number;
  bonusDownloads: number;
  materialsUploaded: number;
}

interface DownloadRecord {
  materialId: string;
  downloadedAt: string;
}

interface UserStore {
  user: User | null;
  downloads: DownloadRecord[];
  isAuthenticated: boolean;
  
  login: (email: string, name: string, avatar?: string) => void;
  logout: () => void;
  upgradeToPremium: () => void;
  cancelPremium: () => void;
  updateProfile: (updates: { name?: string; avatar?: string; password?: string; oldPassword?: string }) => boolean;
  
  getDownloadsThisMonth: () => number;
  canDownload: () => boolean;
  recordDownload: (materialId: string) => boolean;
  getAvailableDownloads: () => number;
  getUserName: () => string;
  
  uploadMaterial: () => void;
  addBonusDownload: () => void;
  updateMaterial: (materialId: string, updates: Partial<Material>) => boolean;
  deleteMaterial: (materialId: string) => boolean;
}

const getCurrentMonthDownloads = (downloads: DownloadRecord[]): number => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return downloads.filter(d => 
    new Date(d.downloadedAt) >= startOfMonth
  ).length;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      downloads: [],
      isAuthenticated: false,
      
      login: (email: string, name: string, avatar?: string) => {
        set({
          user: {
            id: crypto.randomUUID(),
            email,
            name,
            avatar: avatar || "",
            isPremium: false,
            credits: 3,
            bonusDownloads: 0,
            materialsUploaded: 0,
          },
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false, downloads: [] });
      },
      
      upgradeToPremium: () => {
        const { user } = get();
        if (user) {
          const expires = new Date();
          expires.setMonth(expires.getMonth() + 1);
          
          set({
            user: {
              ...user,
              isPremium: true,
              premiumExpiresAt: expires.toISOString(),
            },
          });
        }
      },
      
      cancelPremium: () => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              isPremium: false,
              premiumExpiresAt: undefined,
            },
          });
        }
      },
      
      getDownloadsThisMonth: () => {
        return getCurrentMonthDownloads(get().downloads);
      },
      
      canDownload: () => {
        const { user, downloads } = get();
        if (!user) return false;
        if (user.isPremium) return true;
        
        const monthlyDownloads = getCurrentMonthDownloads(downloads);
        const available = 3 + user.bonusDownloads;
        
        return monthlyDownloads < available;
      },
      
      recordDownload: (materialId: string) => {
        const { user, canDownload } = get();
        if (!user || !canDownload()) return false;
        
        set(state => ({
          downloads: [
            ...state.downloads,
            {
              materialId,
              downloadedAt: new Date().toISOString(),
            },
          ],
        }));
        
        return true;
      },
      
      getAvailableDownloads: () => {
        const { user, downloads } = get();
        if (!user) return 0;
        if (user.isPremium) return Infinity;
        
        const monthlyDownloads = getCurrentMonthDownloads(downloads);
        const available = 3 + user.bonusDownloads;
        
        return Math.max(0, available - monthlyDownloads);
      },
      
      updateMaterial: (materialId, updates) => {
        // W rzeczywistej aplikacji to wywołałoby API
        console.log(`Aktualizacja materiału ${materialId}:`, updates);
        return true;
      },
      
      deleteMaterial: (materialId) => {
        // W rzeczywistej aplikacji to wywołałoby API
        console.log(`Usuwanie materiału ${materialId}`);
        return true;
      },
      
      uploadMaterial: () => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              materialsUploaded: user.materialsUploaded + 1,
              bonusDownloads: user.bonusDownloads + 1,
            },
          });
        }
       },
        
      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return false;
        if (updates.name !== undefined) {
          user.name = updates.name;
        }
        if (updates.avatar !== undefined) {
          user.avatar = updates.avatar;
        }
        set({ user: { ...user } });
        return true;
      },
      
      getUserName: () => {
        const { user } = get();
        return user?.name || '';
      },
      
      addBonusDownload: () => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              bonusDownloads: user.bonusDownloads + 1,
            },
          });
        }
      },
    }),
    {
      name: 'linguashare-user',
    }
  )
);