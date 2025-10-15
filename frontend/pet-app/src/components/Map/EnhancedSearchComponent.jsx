import React, { useState, useEffect, useRef } from 'react';
import { geoapifyService } from '../../services/geoapifyService';

const EnhancedSearchComponent = ({ 
  onSearch, 
  onLocationSelect,
  userLocation,
  loading = false,
  searchRadius = 15000 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filters, setFilters] = useState({});
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load search history từ localStorage
  useEffect(() => {
    const history = localStorage.getItem('vet-search-history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Debounced suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 3) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Click outside để đóng suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) return;

    setIsLoadingSuggestions(true);
    try {
      const result = await geoapifyService.geocodeAddress(query);
      
      if (result.success && result.data) {
        let formattedSuggestions = result.data.slice(0, 8).map(item => ({
          id: item.properties.place_id || Math.random(),
          text: item.properties.formatted,
          coordinates: {
            lat: item.geometry.coordinates[1],
            lng: item.geometry.coordinates[0]
          },
          type: 'address',
          country: item.properties.country,
          state: item.properties.state,
          city: item.properties.city,
          distance: userLocation ? geoapifyService.calculateDistance(
            userLocation.latitude, 
            userLocation.longitude,
            item.geometry.coordinates[1],
            item.geometry.coordinates[0]
          ) : null
        }));

        if (userLocation) {
          formattedSuggestions = formattedSuggestions.sort((a, b) => {
            if (a.distance && b.distance) {
              return a.distance - b.distance;
            }
            return 0;
          });
        }
        
        setSuggestions(formattedSuggestions.slice(0, 5));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Thêm vào search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('vet-search-history', JSON.stringify(newHistory));

    setShowSuggestions(false);

    try {
      const searchOptions = {
        query: searchQuery,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        radius: searchRadius,
        filters: filters,
        prioritizeLocal: true
      };

      if (onSearch) {
        await onSearch(searchOptions);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect(suggestion.coordinates, suggestion.text);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleHistoryClick = (historyItem) => {
    setSearchQuery(historyItem);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-grow">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              search
            </span>
            <input
              ref={searchInputRef}
              className="w-full pl-12 pr-12 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
              placeholder="Tìm phòng khám thú y, địa chỉ hoặc khu vực..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
            
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}

            {/* Loading indicator */}
            {isLoadingSuggestions && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                    Gợi ý địa chỉ
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{suggestion.text}</div>
                          {suggestion.distance && (
                            <div className="text-xs text-blue-600 mt-1">
                              ~{suggestion.distance.toFixed(1)}km từ vị trí hiện tại
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && suggestions.length === 0 && searchQuery.length < 3 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                    Tìm kiếm gần đây
                  </div>
                  {searchHistory.slice(0, 5).map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(historyItem)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-400 text-lg">history</span>
                        <span className="text-sm text-gray-800 dark:text-gray-200">{historyItem}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
                   
          
          
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tìm...</span>
              </div>
            ) : (
              'Tìm kiếm'
            )}
          </button>
        </div>
      </div>

      
    </div>
  );
};

export default EnhancedSearchComponent;
