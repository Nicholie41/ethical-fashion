import React, { useState, useEffect } from 'react';
import { FaFilter, FaSort, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function ProductFilters({ 
  filters, 
  setFilters, 
  categories = [], 
  brands = [],
  onApplyFilters,
  onClearFilters 
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Best Match', icon: '🎯' },
    { value: 'price_asc', label: 'Price: Low to High', icon: '💰' },
    { value: 'price_desc', label: 'Price: High to Low', icon: '💰' },
    { value: 'newest', label: 'Newest First', icon: '🆕' },
    { value: 'oldest', label: 'Oldest First', icon: '📅' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'sustainability', label: 'Most Sustainable', icon: '🌱' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' }
  ];

  // Price ranges
  const priceRanges = [
    { min: 0, max: 25, label: 'Under $25' },
    { min: 25, max: 50, label: '$25 - $50' },
    { min: 50, max: 100, label: '$50 - $100' },
    { min: 100, max: 200, label: '$100 - $200' },
    { min: 200, max: null, label: 'Over $200' }
  ];

  // Date ranges
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: 'year', label: 'This Year' }
  ];

  // Sustainability levels
  const sustainabilityLevels = [
    { value: 'all', label: 'All Levels', icon: '🌍' },
    { value: '9-10', label: 'Excellent (9-10)', icon: '🌱' },
    { value: '7-8', label: 'Very Good (7-8)', icon: '🌿' },
    { value: '5-6', label: 'Good (5-6)', icon: '🍃' },
    { value: '3-4', label: 'Fair (3-4)', icon: '🌾' },
    { value: '1-2', label: 'Poor (1-2)', icon: '🌵' }
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onApplyFilters?.(localFilters);
    setIsExpanded(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      sortBy: 'relevance',
      minPrice: '',
      maxPrice: '',
      category: 'all',
      brand: 'all',
      sustainability: 'all',
      dateRange: 'all',
      materials: [],
      colors: [],
      sizes: []
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    onClearFilters?.();
  };

  const hasActiveFilters = () => {
    return Object.entries(localFilters).some(([key, value]) => {
      if (key === 'search') return value && value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== 'all' && value !== 'relevance';
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.search && localFilters.search.trim() !== '') count++;
    if (localFilters.sortBy !== 'relevance') count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.category !== 'all') count++;
    if (localFilters.brand !== 'all') count++;
    if (localFilters.sustainability !== 'all') count++;
    if (localFilters.dateRange !== 'all') count++;
    if (localFilters.materials.length > 0) count++;
    if (localFilters.colors.length > 0) count++;
    if (localFilters.sizes.length > 0) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gold/20 p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/20 rounded-lg">
            <FaFilter className="text-gold text-xl" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-primary text-xl">Filters & Sort</h3>
            <p className="text-stone/60 text-sm">Refine your search to find exactly what you're looking for</p>
          </div>
          {hasActiveFilters() && (
            <span className="bg-accent text-white text-xs font-bold rounded-full px-3 py-1 ml-2">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sage/20 text-primary hover:bg-sage/30 transition-colors font-medium"
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          {hasActiveFilters() && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-medium"
            >
              <FaTimes />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Quick Sort Bar */}
      <div className="mb-4">
        <span className="text-sm font-semibold text-primary mb-2 block">Sort by:</span>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleFilterChange('sortBy', option.value)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                localFilters.sortBy === option.value
                  ? 'bg-gold text-primary shadow-md'
                  : 'bg-sage/20 text-primary hover:bg-sage/30'
              }`}
            >
              <span>{option.icon}</span>
              <span className="hidden sm:inline">{option.label}</span>
              <span className="sm:hidden">{option.label.split(':')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t border-gold/20 pt-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Search Products</label>
            <input
              type="text"
              placeholder="Search by name, description, or materials..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border-2 border-sage/30 rounded-xl focus:border-gold focus:outline-none transition-colors"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Price Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="px-3 py-2 border-2 border-sage/30 rounded-lg focus:border-gold focus:outline-none transition-colors"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="px-3 py-2 border-2 border-sage/30 rounded-lg focus:border-gold focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {priceRanges.map(range => (
                <button
                  key={range.label}
                  onClick={() => {
                    handleFilterChange('minPrice', range.min);
                    handleFilterChange('maxPrice', range.max);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    localFilters.minPrice == range.min && localFilters.maxPrice == range.max
                      ? 'bg-gold text-primary'
                      : 'bg-sage/20 text-primary hover:bg-sage/30'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Category</label>
              <select
                value={localFilters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border-2 border-sage/30 rounded-lg focus:border-gold focus:outline-none transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Brand</label>
              <select
                value={localFilters.brand || 'all'}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full px-3 py-2 border-2 border-sage/30 rounded-lg focus:border-gold focus:outline-none transition-colors"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sustainability Level */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Sustainability Level</label>
            <div className="flex flex-wrap gap-2">
              {sustainabilityLevels.map(level => (
                <button
                  key={level.value}
                  onClick={() => handleFilterChange('sustainability', level.value)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.sustainability === level.value
                      ? 'bg-gold text-primary shadow-md'
                      : 'bg-sage/20 text-primary hover:bg-sage/30'
                  }`}
                >
                  <span>{level.icon}</span>
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Date Listed</label>
            <div className="flex flex-wrap gap-2">
              {dateRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange('dateRange', range.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.dateRange === range.value
                      ? 'bg-gold text-primary shadow-md'
                      : 'bg-sage/20 text-primary hover:bg-sage/30'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Materials, Colors, Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Materials</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {['Organic Cotton', 'Hemp', 'Bamboo', 'Recycled Polyester', 'Tencel', 'Linen', 'Wool', 'Silk'].map(material => (
                  <label key={material} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.materials.includes(material)}
                      onChange={(e) => {
                        const newMaterials = e.target.checked
                          ? [...localFilters.materials, material]
                          : localFilters.materials.filter(m => m !== material);
                        handleFilterChange('materials', newMaterials);
                      }}
                      className="rounded border-sage/30 text-gold focus:ring-gold"
                    />
                    <span className="text-sm text-primary">{material}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Colors</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {['Black', 'White', 'Blue', 'Green', 'Red', 'Yellow', 'Purple', 'Pink', 'Brown', 'Gray'].map(color => (
                  <label key={color} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.colors.includes(color)}
                      onChange={(e) => {
                        const newColors = e.target.checked
                          ? [...localFilters.colors, color]
                          : localFilters.colors.filter(c => c !== color);
                        handleFilterChange('colors', newColors);
                      }}
                      className="rounded border-sage/30 text-gold focus:ring-gold"
                    />
                    <span className="text-sm text-primary">{color}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Sizes</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map(size => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.sizes.includes(size)}
                      onChange={(e) => {
                        const newSizes = e.target.checked
                          ? [...localFilters.sizes, size]
                          : localFilters.sizes.filter(s => s !== size);
                        handleFilterChange('sizes', newSizes);
                      }}
                      className="rounded border-sage/30 text-gold focus:ring-gold"
                    />
                    <span className="text-sm text-primary">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gold/20">
            <div className="text-sm text-stone">
              {hasActiveFilters() && (
                <span>{getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 rounded-lg border-2 border-sage/30 text-primary hover:bg-sage/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 rounded-lg bg-gold text-primary font-semibold hover:bg-gold/90 transition-colors shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 