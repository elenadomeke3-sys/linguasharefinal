import { create } from 'zustand';
import { Collection, CollectionMaterial } from '@/data/materials';
import { supabase } from '@/lib/supabase';

interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  collectionMaterials: CollectionMaterial[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCollections: (userId: string) => Promise<void>;
  fetchCollection: (collectionId: string) => Promise<void>;
  createCollection: (collection: Omit<Collection, 'id' | 'material_count' | 'created_at' | 'updated_at'>) => Promise<Collection | null>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  fetchCollectionMaterials: (collectionId: string) => Promise<void>;
  addMaterialToCollection: (collectionId: string, materialId: string, userId: string) => Promise<void>;
  removeMaterialFromCollection: (collectionId: string, materialId: string) => Promise<void>;
  clearError: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  currentCollection: null,
  collectionMaterials: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchCollections: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      set({ collections: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCollection: async (collectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (error) throw error;
      set({ currentCollection: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createCollection: async (collection) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert(collection)
        .select()
        .single();

      if (error) throw error;
      
      set(state => ({
        collections: [data, ...state.collections],
        isLoading: false
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateCollection: async (id: string, updates: Partial<Collection>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('collections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        collections: state.collections.map(c => c.id === id ? data : c),
        currentCollection: state.currentCollection?.id === id ? data : state.currentCollection,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteCollection: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        collections: state.collections.filter(c => c.id !== id),
        currentCollection: state.currentCollection?.id === id ? null : state.currentCollection,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCollectionMaterials: async (collectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('collection_materials')
        .select(`
          *,
          material:materials(*)
        `)
        .eq('collection_id', collectionId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      set({ collectionMaterials: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addMaterialToCollection: async (collectionId: string, materialId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('collection_materials')
        .insert({
          collection_id: collectionId,
          material_id: materialId,
          added_by: userId
        });

      if (error) throw error;

      // Refresh collection materials
      await get().fetchCollectionMaterials(collectionId);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeMaterialFromCollection: async (collectionId: string, materialId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('collection_materials')
        .delete()
        .eq('collection_id', collectionId)
        .eq('material_id', materialId);

      if (error) throw error;

      // Refresh collection materials
      await get().fetchCollectionMaterials(collectionId);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
