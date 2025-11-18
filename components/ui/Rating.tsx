
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RatingProps {
  count?: number;
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readonly?: boolean;
}

const Rating: React.FC<RatingProps> = ({
  count = 5,
  value,
  onChange,
  size = 24,
  readonly = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const stars = Array.from({ length: count }, (_, i) => i + 1);

  const handleClick = (newValue: number) => {
    if (!readonly && onChange) {
      onChange(newValue);
    }
  };

  const handleMouseMove = (newValue: number) => {
    if (!readonly) {
      setHoverValue(newValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(undefined);
    }
  };

  return (
    <div className="flex items-center" onMouseLeave={handleMouseLeave}>
      {stars.map((starValue) => (
        <Star
          key={starValue}
          size={size}
          className={cn(
            'transition-colors',
            (hoverValue || value) >= starValue ? 'text-yellow-400' : 'text-gray-600',
            !readonly ? 'cursor-pointer' : 'cursor-default'
          )}
          fill={(hoverValue || value) >= starValue ? 'currentColor' : 'transparent'}
          onClick={() => handleClick(starValue)}
          onMouseMove={() => handleMouseMove(starValue)}
        />
      ))}
    </div>
  );
};

export default Rating;
