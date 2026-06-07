import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { User, MapPin, Lock, Plus, Edit, Trash2, Save, X, Star, Check, Home, Briefcase } from 'lucide-react';

export const Profile: React.FC = () => {
  const { showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'password' | 'ratings'>('info');

  // Profile
  const [profile, setProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phoneNumber: '', address: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressForm, setAddressForm] = useState<any>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  // Password
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Ratings
  const [ratings, setRatings] = useState<any[]>([]);

  const loadProfile = async () => {
    try {
      const p = await api.getMyProfile();
      setProfile(p);
      setProfileForm({ fullName: p.fullName || '', email: p.email || '', phoneNumber: p.phoneNumber || '', address: p.address || '' });
    } catch (err: any) { showNotification(err.message, 'error'); }
  };

  const loadAddresses = async () => {
    try { setAddresses(await api.getMyAddresses()); } catch (err: any) { showNotification(err.message, 'error'); }
  };

  const loadRatings = async () => {
    try { setRatings(await api.getMyRatings()); } catch (err: any) { showNotification(err.message, 'error'); }
  };

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  useEffect(() => {
    if (activeTab === 'ratings') loadRatings();
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.updateMyProfile(profileForm);
      showNotification('Profile updated!', 'success');
      loadProfile();
    } catch (err: any) { showNotification(err.message, 'error'); }
    finally { setProfileLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await api.changePassword(passwordForm);
      showNotification('Password changed!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { showNotification(err.message, 'error'); }
    finally { setPasswordLoading(false); }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      if (addressForm.addressId) {
        await api.updateAddress(addressForm.addressId, addressForm);
        showNotification('Address updated!', 'success');
      } else {
        await api.createAddress(addressForm);
        showNotification('Address added!', 'success');
      }
      setAddressForm(null);
      loadAddresses();
    } catch (err: any) { showNotification(err.message, 'error'); }
    finally { setAddressLoading(false); }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.deleteAddress(id);
      showNotification('Address deleted', 'success');
      loadAddresses();
    } catch (err: any) { showNotification(err.message, 'error'); }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.setDefaultAddress(id);
      showNotification('Default address set', 'success');
      loadAddresses();
    } catch (err: any) { showNotification(err.message, 'error'); }
  };

  const handleDeleteRating = async (id: number) => {
    if (!window.confirm('Delete this rating?')) return;
    try {
      await api.deleteRating(id);
      showNotification('Rating deleted', 'success');
      loadRatings();
    } catch (err: any) { showNotification(err.message, 'error'); }
  };

  const newAddressForm = { label: 'Home', recipientName: '', phoneNumber: '', street: '', ward: '', district: '', city: '', isDefault: false };

  const tabStyle = (tab: string) => ({
    padding: '10px 20px', fontSize: '14px', fontWeight: 500 as const,
    background: activeTab === tab ? 'rgba(99,102,241,0.12)' : 'transparent',
    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
    border: activeTab === tab ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
    transition: 'all 0.2s',
  });

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '8px' }}>My Account</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
        Manage your profile, addresses, and security settings
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button style={tabStyle('info')} onClick={() => setActiveTab('info')}><User size={16} /> Profile Info</button>
        <button style={tabStyle('addresses')} onClick={() => setActiveTab('addresses')}><MapPin size={16} /> Addresses</button>
        <button style={tabStyle('password')} onClick={() => setActiveTab('password')}><Lock size={16} /> Password</button>
        <button style={tabStyle('ratings')} onClick={() => setActiveTab('ratings')}><Star size={16} /> My Ratings</button>
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'info' && (
        <div className="glass-panel" style={{ maxWidth: '600px' }}>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--primary)" /> Personal Information
          </h2>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Username</label>
              <input type="text" value={profile?.username || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Full Name</label>
              <input type="text" value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} placeholder="Your full name" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Email</label>
                <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="your@email.com" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Phone Number</label>
                <input type="text" value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} placeholder="0901234567" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Default Address</label>
              <input type="text" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="Your address" />
            </div>
            <button type="submit" className="primary" style={{ alignSelf: 'flex-start', padding: '11px 28px' }} disabled={profileLoading}>
              {profileLoading ? <span className="loader" /> : <><Save size={14} /> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Shipping Addresses ({addresses.length})</h2>
            <button className="primary" onClick={() => setAddressForm({ ...newAddressForm })} style={{ gap: '6px' }}>
              <Plus size={15} /> Add Address
            </button>
          </div>

          {/* Address Form */}
          {addressForm && (
            <div className="glass-panel animate-fade-in" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '16px' }}>{addressForm.addressId ? 'Edit Address' : 'New Address'}</h3>
              <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Label *</label>
                    <select value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}>
                      <option value="Home">🏠 Home</option>
                      <option value="Office">🏢 Office</option>
                      <option value="Other">📍 Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Recipient Name *</label>
                    <input type="text" value={addressForm.recipientName} onChange={e => setAddressForm({ ...addressForm, recipientName: e.target.value })} required placeholder="Recipient name" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Phone *</label>
                    <input type="text" value={addressForm.phoneNumber} onChange={e => setAddressForm({ ...addressForm, phoneNumber: e.target.value })} required placeholder="0901234567" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>City *</label>
                    <input type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required placeholder="TP. Hồ Chí Minh" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Street Address *</label>
                  <input type="text" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} required placeholder="123 Đường ABC" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Ward</label>
                    <input type="text" value={addressForm.ward || ''} onChange={e => setAddressForm({ ...addressForm, ward: e.target.value })} placeholder="Phường 1" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>District</label>
                    <input type="text" value={addressForm.district || ''} onChange={e => setAddressForm({ ...addressForm, district: e.target.value })} placeholder="Quận 1" />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addressForm.isDefault || false} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} style={{ width: 'auto' }} />
                  Set as default address
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="outline" onClick={() => setAddressForm(null)}><X size={14} /> Cancel</button>
                  <button type="submit" className="primary" disabled={addressLoading}>
                    {addressLoading ? <span className="loader" /> : <><Save size={14} /> {addressForm.addressId ? 'Update' : 'Save'}</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {addresses.map((addr: any) => (
              <div key={addr.addressId} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {addr.label === 'Home' ? <Home size={18} color="var(--primary)" /> :
                     addr.label === 'Office' ? <Briefcase size={18} color="var(--primary)" /> :
                     <MapPin size={18} color="var(--primary)" />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{addr.label}</span>
                      {addr.isDefault && <span className="badge success" style={{ fontSize: '10px' }}>Default</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{addr.recipientName} · {addr.phoneNumber}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>{addr.fullAddress}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!addr.isDefault && (
                    <button className="outline" onClick={() => handleSetDefault(addr.addressId)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                      <Check size={13} /> Set Default
                    </button>
                  )}
                  <button className="outline" onClick={() => setAddressForm({ ...addr })} style={{ padding: '6px 10px', fontSize: '12px' }}>
                    <Edit size={13} />
                  </button>
                  <button className="danger" onClick={() => handleDeleteAddress(addr.addressId)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {addresses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-subtle)' }}>
                <MapPin size={40} style={{ marginBottom: '12px' }} />
                <p>No saved addresses yet. Add one to speed up checkout!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="glass-panel" style={{ maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="var(--primary)" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Current Password *</label>
              <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>New Password * (6-40 chars)</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} maxLength={40} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Confirm New Password *</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="primary" style={{ alignSelf: 'flex-start', padding: '11px 28px' }} disabled={passwordLoading}>
              {passwordLoading ? <span className="loader" /> : <><Lock size={14} /> Update Password</>}
            </button>
          </form>
        </div>
      )}

      {/* Ratings Tab */}
      {activeTab === 'ratings' && (
        <div style={{ maxWidth: '800px' }}>
          <h2 style={{ marginBottom: '20px' }}>My Ratings ({ratings.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ratings.map((r: any) => (
              <div key={r.ratingId} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{r.productName}</div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} fill={s <= r.stars ? '#fbbf24' : 'transparent'} color={s <= r.stars ? '#fbbf24' : 'var(--text-subtle)'} />
                    ))}
                  </div>
                  {r.comment && <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>"{r.comment}"</p>}
                  <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Order #{r.orderId} · {new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <button className="danger" onClick={() => handleDeleteRating(r.ratingId)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {ratings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-subtle)' }}>
                <Star size={40} style={{ marginBottom: '12px' }} />
                <p>No ratings yet. Rate products from your delivered orders!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
