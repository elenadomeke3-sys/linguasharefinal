export interface Material {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  type: string;
  tags: string[];
  is_premium: boolean;
  downloads: number;
  created_at: string;
  author_id?: string;
  author_name: string;
  average_rating: number;
  total_ratings: number;
  file_url?: string;
  content?: string;
}

export interface Review {
  id: string;
  material_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_public: boolean;
  material_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionMaterial {
  id: string;
  collection_id: string;
  material_id: string;
  added_at: string;
  added_by: string;
  material?: Material; // joined data
}
