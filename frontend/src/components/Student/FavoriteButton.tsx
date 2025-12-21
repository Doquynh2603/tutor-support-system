import React from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  tutorId: string;
  isFavorite: boolean;
  onToggle: (tutorId: string) => Promise<boolean>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  tutorId,
  isFavorite,
  onToggle,
  size = 'md',
  className = '',
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onToggle(tutorId);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <Heart
        className={`${sizeClasses[size]} ${
          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
        } transition-colors`}
      />
    </button>
  );
};

export default FavoriteButton;
