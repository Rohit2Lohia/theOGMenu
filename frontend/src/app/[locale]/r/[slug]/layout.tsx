import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/public/restaurant/${params.slug}/full`);
    if (!res.ok) return { title: 'theOGMenu' };
    const data = await res.json();
    const restaurant = data?.restaurant;
    if (!restaurant) return { title: 'theOGMenu' };
    
    return {
      title: `${restaurant.name} | Digital Menu`,
      description: restaurant.description || `View the digital menu for ${restaurant.name}.`,
      openGraph: {
        title: `${restaurant.name} | Digital Menu`,
        description: restaurant.description || `View the digital menu for ${restaurant.name}.`,
        images: restaurant.cover_url ? [restaurant.cover_url] : [],
      }
    };
  } catch (err) {
    return { title: 'theOGMenu' };
  }
}

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
