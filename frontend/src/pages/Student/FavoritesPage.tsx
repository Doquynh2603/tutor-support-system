import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'react-router-dom';
import FavoriteButton from '@/components/Student/FavoriteButton';
import { Heart, Loader, MapPin, Star } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const { favorites, loading, error, toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">❤️ Danh sách gia sư yêu thích</h1>
          <p className="text-gray-600">{favorites.length} gia sư trong danh sách yêu thích</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Chưa có gia sư yêu thích</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <div
                key={fav.favoriteId}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{fav.tutor_name}</h3>
                    <p className="text-sm text-gray-600">{fav.tutor_email}</p>
                  </div>
                  <FavoriteButton
                    tutorId={fav.tutor_id}
                    isFavorite={true}
                    onToggle={toggleFavorite}
                    size="sm"
                  />
                </div>

                {fav.bio && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 line-clamp-2">{fav.bio}</p>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-sm text-gray-700 mb-1">💰 {fav.hourly_rate}k/giờ</p>
                  {fav.experience_years && (
                    <p className="text-sm text-gray-700">
                      📅 {fav.experience_years} năm kinh nghiệm
                    </p>
                  )}
                </div>

                {(fav.ward_name || fav.district_name || fav.province_name) && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {[fav.ward_name, fav.district_name, fav.province_name]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
