import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

function AuthPage({ login, navigate, register }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    fullName: 'Nguyễn Minh Long',
    username: 'long_demo',
    email: 'long@example.com',
    phone: '0987654321',
    password: 'password123',
  });

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (mode === 'login') {
      login(form);
    } else {
      register(form);
    }

    navigate('/profile');
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="section-heading">
          <div>
            <h1>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h1>
            <p>Tài khoản mock cho frontend test</p>
          </div>
          {mode === 'login' ? <LogIn size={25} /> : <UserPlus size={25} />}
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'payment active' : 'payment'} type="button" onClick={() => setMode('login')}>
            Đăng nhập
          </button>
          <button className={mode === 'register' ? 'payment active' : 'payment'} type="button" onClick={() => setMode('register')}>
            Đăng ký
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="field wide">
              <span>Họ tên</span>
              <input value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
            </label>
          )}
          <label className="field wide">
            <span>Username</span>
            <input value={form.username} onChange={(event) => updateField('username', event.target.value)} />
          </label>
          {mode === 'register' && (
            <>
              <label className="field">
                <span>Email</span>
                <input value={form.email} onChange={(event) => updateField('email', event.target.value)} />
              </label>
              <label className="field">
                <span>Số điện thoại</span>
                <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
              </label>
            </>
          )}
          <label className="field wide">
            <span>Mật khẩu</span>
            <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
          </label>
          <button className="primary-button full" type="submit">
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AuthPage;
