export interface AdItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  locationName: string;
  latitude: number;
  longitude: number;
  authorId?: string;
  authorName: string;
  contactInfo?: string;
  imageUrl?: string;
  price?: number;
  createdAt?: Date;
}
