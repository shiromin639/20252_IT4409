import { useState } from 'react';
import { initialRatings } from '../data/mockData';

export function useRatings() {
  const [ratings, setRatings] = useState(initialRatings);
  const [ratingDrafts, setRatingDrafts] = useState({});

  function submitRating(productId, orderId, draft) {
    setRatings((current) => ({
      ...current,
      [productId]: {
        stars: draft.stars,
        comment: draft.comment || 'Sản phẩm đúng mô tả.',
        orderId,
      },
    }));
  }

  return {
    ratingDrafts,
    ratings,
    setRatingDrafts,
    submitRating,
  };
}
