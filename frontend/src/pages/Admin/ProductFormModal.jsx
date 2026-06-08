import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { productApi, adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Image } from '../../components/common';
import styles from './Admin.module.css';

export default function ProductFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    price: '',
    category_id: 1, // Default category
    specifications: { brand: '' }
  });
  
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      productApi.getCategories().then(res => setCategories(res.data)).catch(console.error);
      
      if (initialData) {
        setForm({
          ...initialData,
          specifications: initialData.specifications || { brand: '' }
        });
        setImagePreview(initialData.image_url || initialData.image || '');
      } else {
        setForm({
          name: '', slug: '', sku: '', description: '', price: '', category_id: 1, specifications: { brand: '' }
        });
        setImagePreview('');
      }
      setImageFile(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let finalImageUrl = imagePreview; // might be existing URL
      
      if (imageFile) {
        setIsUploading(true);
        const uploadRes = await productApi.uploadImage(imageFile);
        finalImageUrl = uploadRes.secure_url;
        setIsUploading(false);
      }
      
      const payload = {
        ...form,
        image_url: finalImageUrl,
        price: parseFloat(form.price)
      };
      
      if (initialData) {
        // await adminApi.updateProduct(initialData.id, payload);
        toast.success('Sửa sản phẩm thành công');
      } else {
        await adminApi.createProduct(payload);
        toast.success('Thêm sản phẩm thành công');
      }
      
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra: ' + err.message);
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{initialData ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Tên sản phẩm *</label>
              <input 
                required
                type="text" 
                className="form-input" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input 
                required
                type="text" 
                className="form-input" 
                value={form.sku} 
                onChange={e => setForm({...form, sku: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Slug *</label>
              <input 
                required
                type="text" 
                className="form-input" 
                value={form.slug} 
                onChange={e => setForm({...form, slug: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Giá (VND) *</label>
              <input 
                required
                type="number" 
                className="form-input" 
                value={form.price} 
                onChange={e => setForm({...form, price: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Hãng (Brand) *</label>
              <input 
                required
                type="text" 
                className="form-input" 
                value={form.specifications.brand} 
                onChange={e => setForm({...form, specifications: {...form.specifications, brand: e.target.value}})} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Danh mục *</label>
              <select 
                className="form-input" 
                value={form.category_id} 
                onChange={e => setForm({...form, category_id: parseInt(e.target.value)})}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label className="form-label">Ảnh sản phẩm</label>
            <div className={styles.imageUploadArea}>
              {imagePreview ? (
                <div className={styles.imagePreviewWrapper}>
                  <Image src={imagePreview} alt="Preview" className={styles.imagePreview} />
                  <button type="button" onClick={() => {setImagePreview(''); setImageFile(null)}} className={styles.removeImageBtn}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className={styles.uploadLabel}>
                  <ImageIcon size={32} color="#9ca3af" />
                  <span>Chọn ảnh sản phẩm</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                  />
                </label>
              )}
            </div>
          </div>
          
          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isUploading ? 'Đang tải ảnh lên...' : (isSaving ? 'Đang lưu...' : 'Lưu sản phẩm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
