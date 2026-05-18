import React from 'react';

const ShippingForm = ({ form, onChange }) => {
  const fields = [
    { name: 'fullName', label: 'Họ và tên', placeholder: 'Nguyễn Văn A', type: 'text' },
    { name: 'phone', label: 'Số điện thoại', placeholder: '0901 234 567', type: 'tel' },
    { name: 'email', label: 'Email', placeholder: 'email@example.com', type: 'email' },
    { name: 'address', label: 'Địa chỉ nhận hàng', placeholder: 'Số nhà, tên đường', type: 'text' },
    { name: 'city', label: 'Tỉnh/Thành phố', placeholder: 'TP. Hồ Chí Minh', type: 'text' },
    { name: 'note', label: 'Ghi chú (tùy chọn)', placeholder: 'Giao hàng giờ hành chính...', type: 'text' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Thông tin giao hàng</h2>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={onChange}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingForm;
