'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const CATEGORIES = [
  { name: 'Nail Salon', emoji: '💅' },
  { name: 'Hair Salon', emoji: '✂️' },
  { name: 'Beauty', emoji: '💄' },
  { name: 'Massage', emoji: '💆' },
  { name: 'Spa', emoji: '🧖' },
  { name: 'Personal Trainer', emoji: '💪' },
  { name: 'Pet Grooming', emoji: '🐕' },
  { name: 'Tattoo', emoji: '🎨' },
];

export default function CustomerHome() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await fetch(`/api/vendors/search?${params}`);
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Türkan Abla</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push('/customer/account')}>
            👤
          </Button>
        </div>
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* Categories */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Browse by category</h2>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                handleSearch();
              }}
              className={`p-4 rounded-lg text-center text-sm font-medium ${
                selectedCategory === cat.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border'
              }`}
            >
              <div className="text-2xl">{cat.emoji}</div>
              <div className="text-xs mt-1">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="p-4">
        {vendors.length === 0 && !loading && search === '' && selectedCategory === null && (
          <Card className="p-6 text-center">
            <p className="text-gray-600">Search for a vendor or select a category to get started</p>
          </Card>
        )}

        {loading && <p className="text-center text-gray-500">Loading...</p>}

        <div className="grid grid-cols-1 gap-4">
          {vendors.map((vendor: any) => (
            <Card
              key={vendor.id}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => router.push(`/vendor/${vendor.id}`)}
            >
              <div className="aspect-video bg-gray-200 rounded-t-lg" />
              <div className="p-4">
                <h3 className="font-bold text-lg">{vendor.businessName}</h3>
                <p className="text-sm text-gray-600">{vendor.category}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-yellow-500">⭐ 4.8</span>
                  <Button size="sm" onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/vendor/${vendor.id}/book`);
                  }}>
                    Book
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
