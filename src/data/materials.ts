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
