import { create } from 'zustand';
import { Review } from '@/data/materials';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

interface ReviewState {
  reviews: Record<string, Review[]>; // material_id -> reviews[]
  userReview: Record<string, Review | null>; // material_id -> user's review
  isLoading: boolean;
  error: string | null;
  fetchReviews: (materialId: string) => Promise<void>;
  submitReview: (materialId: string, rating: number, comment: string) => Promise<void>;
  updateReview: (reviewId: string, rating: number, comment: string) => Promise<void>;
  deleteReview: (reviewId: string, materialId: string) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: {},
  userReview: {},
  isLoading: false,
  error: null,

  fetchReviews: async (materialId: string) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('material_id', materialId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    set((state) => ({
      reviews: { ...state.reviews, [materialId]: data || [] },
      isLoading: false,
    }));
  },

  submitReview: async (materialId: string, rating: number, comment: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ error: 'Musisz być zalogowany' });
      return;
    }

    set({ isLoading: true, error: null });

    const user_name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonim';
    const user_avatar = user.user_metadata?.avatar_url || null;

    const { error } = await supabase
      .from('reviews')
      .insert({
        material_id: materialId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
        user_name,
        user_avatar,
      });

    set({ isLoading: false });

    if (error) {
      set({ error: error.message });
      return;
    }

    // Refresh reviews for this material
    await get().fetchReviews(materialId);
  },

  updateReview: async (reviewId: string, rating: number, comment: string) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment: comment.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    set({ isLoading: false });

    if (error) {
      set({ error: error.message });
      return;
    }

    // Refetch reviews for the material (we'll get material_id from the review)
    const { data } = await supabase.from('reviews').select('material_id').eq('id', reviewId).single();
    if (data) {
      await get().fetchReviews(data.material_id);
    }
  },

  deleteReview: async (reviewId: string, materialId: string) => {
    set({ isLoading: true, error: null });

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    set({ isLoading: false });

    if (error) {
      set({ error: error.message });
      return;
    }

    // Refresh reviews
    await get().fetchReviews(materialId);
  },
}));
