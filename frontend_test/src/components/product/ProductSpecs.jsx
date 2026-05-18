import React from 'react';

const ProductSpecs = ({ specs }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Thông số kỹ thuật</h2>
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(specs).map(([key, value], index) => (
            <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="py-2.5 px-4 font-medium text-gray-600 w-1/3">{key}</td>
              <td className="py-2.5 px-4 text-gray-800">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductSpecs;
