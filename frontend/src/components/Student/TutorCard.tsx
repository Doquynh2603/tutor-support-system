// frontend/src/components/Student/TutorCard.tsx
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from './FavoriteButton';

interface Props {
  tutor: any;
  isSelected: boolean;
  onToggle: () => void;
}

const TutorCard: React.FC<Props> = ({ tutor, isSelected, onToggle }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
      }`}
      onClick={onToggle}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{tutor.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm text-gray-600">
                {tutor.avg_rating?.toFixed(1) || 'N/A'} ({tutor.total_reviews || 0} đánh giá)
              </span>
            </div>
          </div>

          {/* ✅ THÊM FAVORITE BUTTON */}
          <div className="flex items-center gap-2">
            <FavoriteButton
              tutorId={tutor.user_id} // Giả sử tutor có user_id hoặc id
              isFavorite={isFavorite(tutor.user_id)}
              onToggle={toggleFavorite}
              size="sm"
            />
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-5 h-5 text-blue-500"
            />
          </div>
        </div>

        <div className="text-lg font-bold text-blue-600 mb-2">
          {tutor.hourly_rate?.toLocaleString('vi-VN')} VNĐ/giờ
        </div>

        {tutor.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{tutor.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TutorCard;
