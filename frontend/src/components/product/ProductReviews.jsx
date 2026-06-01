import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Star, MessageSquare, CheckCircle, Trash2, Edit2 } from 'lucide-react'
import { reviewAPI } from '../../services/api'
import { StarRating } from '../common'
import toast from 'react-hot-toast'
import styles from './ProductReviews.module.css'

export default function ProductReviews({ productId, initialStats, onStatsUpdate }) {
  const [summary, setSummary] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ rating: 5, title: '', comment: '' })
  
  const { user } = useSelector(state => state.auth)

  const fetchReviews = async () => {
    try {
      const [sumRes, revRes] = await Promise.all([
        reviewAPI.getRatingSummary(productId),
        reviewAPI.getProductReviews(productId, 0, 100)
      ])
      const summary = sumRes ?? {}
      const avg = summary?.average_rating ?? 0
      const total = summary?.total_reviews ?? 0
      
      const reviewsData = Array.isArray(revRes?.data) ? revRes.data : Array.isArray(revRes) ? revRes : []

      setSummary(summary)
      setReviews(reviewsData)
      if (onStatsUpdate) {
        onStatsUpdate({
          average_rating: avg,
          total_reviews: total
        })
      }
    } catch (err) {
      console.error('Failed to load reviews', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.comment.trim()) {
      return toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung đánh giá")
    }
    
    setSubmitting(true)
    try {
      await reviewAPI.createReview({
        product_id: parseInt(productId),
        ...formData
      })
      toast.success("Đánh giá của bạn đã được gửi thành công")
      setShowForm(false)
      setFormData({ rating: 5, title: '', comment: '' })
      fetchReviews()
    } catch (err) {
      toast.error(err.response?.data?.detail || "Không thể gửi đánh giá. Bạn đã đánh giá sản phẩm này chưa?")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá đánh giá này?")) return
    try {
      await reviewAPI.deleteReview(id)
      toast.success("Đã xoá đánh giá")
      fetchReviews()
    } catch (err) {
      toast.error("Không thể xoá đánh giá")
    }
  }

  if (loading) return <div className={styles.loading}>Đang tải đánh giá...</div>

  const breakdown = summary?.rating_breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const total = summary?.total_reviews ?? initialStats?.total_reviews ?? 0
  const avg = summary?.average_rating ?? initialStats?.average_rating ?? 5

  return (
    <div className={styles.container}>
      <div className={styles.summarySection}>
        <div className={styles.avgBox}>
          <div className={styles.avgScore}>{avg.toFixed(1)}</div>
          <StarRating rating={avg} size={24} />
          <div className={styles.totalReviews}>{total} đánh giá</div>
        </div>

        <div className={styles.breakdownBox}>
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className={styles.breakdownRow}>
              <span className={styles.starLabel}>{star} <Star size={12} fill="currentColor" /></span>
              <div className={styles.barWrap}>
                <div 
                  className={styles.barFill} 
                  style={{ width: `${breakdown[star]}%` }}
                />
              </div>
              <span className={styles.percentLabel}>{breakdown[star]}%</span>
            </div>
          ))}
        </div>

        <div className={styles.actionBox}>
          <p>Chia sẻ trải nghiệm của bạn với sản phẩm này</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (!user) return toast.error("Vui lòng đăng nhập để đánh giá")
              setShowForm(!showForm)
            }}
          >
            {showForm ? 'Đóng' : 'Viết đánh giá'}
          </button>
        </div>
      </div>

      {showForm && user && (
        <form className={styles.reviewForm} onSubmit={handleSubmit}>
          <h3>Đánh giá của bạn</h3>
          <div className={styles.formGroup}>
            <label>Chất lượng sản phẩm:</label>
            <div className={styles.ratingSelect}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFormData({...formData, rating: star})}
                  className={star <= formData.rating ? styles.starSelected : styles.starUnselected}
                >
                  <Star size={24} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <input 
              type="text" 
              placeholder="Tiêu đề đánh giá" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <textarea 
              placeholder="Chia sẻ thêm thông tin về trải nghiệm của bạn..." 
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
              rows={4}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      <div className={styles.reviewList}>
        {reviews?.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquare size={48} opacity={0.2} />
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <div className={styles.avatar}>
                    {review.user_id}
                  </div>
                  <div>
                    <div className={styles.reviewerName}>Khách hàng #{review.user_id}</div>
                    {review.is_verified_purchase && (
                      <div className={styles.verified}>
                        <CheckCircle size={12} /> Đã mua hàng
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div className={styles.reviewContent}>
                <StarRating rating={review.rating} size={14} />
                <h4 className={styles.reviewTitle}>{review.title}</h4>
                <p className={styles.reviewText}>{review.comment}</p>
              </div>
              
              {user && user.id === review.user_id && (
                <div className={styles.reviewActions}>
                  <button type="button" onClick={() => handleDelete(review.id)}>
                    <Trash2 size={14} /> Xoá
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
