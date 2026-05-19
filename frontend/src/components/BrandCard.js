import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandCard({ brand }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 transition hover:shadow-lg">
      <Link to={`/brands/${brand._id || brand.id}`}>
        {brand.imageUrl ? (
          <img
            src={brand.imageUrl}
            alt={brand.name || "Brand"}
            className="w-full h-40 object-cover rounded"
          />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded text-gray-400">
            No image
          </div>
        )}
        <h2 className="font-bold text-lg mt-2 truncate">{brand.name || "Unnamed Brand"}</h2>
      </Link>
      <p className="text-sm mt-1">{brand.description || "No description."}</p>
      {brand.website && (
        <p className="mt-1 text-green-700 text-sm break-words">
          <a href={brand.website} target="_blank" rel="noopener noreferrer" className="underline">
            {brand.website}
          </a>
        </p>
      )}
      <p className="mt-1 text-sm text-gray-500">
        {brand.approved ? "✅ Approved" : "⏳ Pending Approval"}
      </p>
    </div>
  );
}