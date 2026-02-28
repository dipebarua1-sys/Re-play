export interface ImagePreset {
  id: string;
  name: string;
  heading: string;
  title: string;
  theme: 'Ramadan' | 'Special Offer' | 'Regular';
  backgroundType: string;
  specialRequirement: string;
}

export const IMAGE_PRESETS: ImagePreset[] = [
  {
    id: 'ramadan-mubarak',
    name: '🌙 Ramadan Mubarak',
    heading: 'Ramadan Mubarak',
    title: 'Special Collection',
    theme: 'Ramadan',
    backgroundType: 'Studio',
    specialRequirement: 'Warm lanterns, crescent moon in background, soft lighting'
  },
  {
    id: 'summer-sale',
    name: '☀️ Summer Sale',
    heading: 'SUMMER SALE',
    title: 'Up to 50% OFF',
    theme: 'Special Offer',
    backgroundType: 'Nature',
    specialRequirement: 'Bright sunlight, tropical leaves, vibrant colors'
  },
  {
    id: 'minimal-studio',
    name: '✨ Minimalist Studio',
    heading: '',
    title: 'Premium Quality',
    theme: 'Regular',
    backgroundType: 'Studio',
    specialRequirement: 'Clean white background, soft shadows, high-end look'
  },
  {
    id: 'urban-arrival',
    name: '🏙️ Urban Arrival',
    heading: 'NEW ARRIVAL',
    title: 'Streetwear Series',
    theme: 'Regular',
    backgroundType: 'Urban',
    specialRequirement: 'City street background, cool lighting, edgy feel'
  },
  {
    id: 'luxury-glow',
    name: '💎 Luxury Glow',
    heading: 'EXCLUSIVELY YOURS',
    title: 'Limited Edition',
    theme: 'Regular',
    backgroundType: 'Gradient',
    specialRequirement: 'Golden lighting, luxury feel, elegant gradient background'
  }
];
