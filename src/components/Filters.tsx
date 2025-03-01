/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface IFiltersProps {
  collectionFilter: string;
  setCollectionFilter: (value: string) => void;
  sortByPrice: "asc" | "desc" | "";
  setSortByPrice: (value: "asc" | "desc" | "") => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
}

const Filters: React.FC<IFiltersProps> = ({
  collectionFilter,
  setCollectionFilter,
  sortByPrice,
  setSortByPrice,
  showFilters,
  setShowFilters,
}) => {
  return (
    <div className="w-full max-w-5xl mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="mb-3 px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold"
      >
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Filter by Collection"
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-64"
          />

          <select
            value={sortByPrice}
            onChange={(e) =>
              setSortByPrice(e.target.value as "asc" | "desc" | "")
            }
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Sort by Price</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Filters;
