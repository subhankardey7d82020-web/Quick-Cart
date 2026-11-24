import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[3/4] w-full bg-sand-200/60" />
      <div className="pt-4 space-y-2">
        <div className="h-3 bg-sand-200 w-1/3 rounded" />
        <div className="h-4 bg-sand-200 w-3/4 rounded" />
        <div className="h-4 bg-sand-200 w-1/4 rounded" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-sand-100">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-sand-200 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};
