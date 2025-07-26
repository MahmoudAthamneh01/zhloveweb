import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Users, DollarSign, Globe, SlidersHorizontal } from 'lucide-react';

interface TournamentFiltersProps {}

const TournamentFilters: React.FC<TournamentFiltersProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    format: 'all',
    prizeRange: 'all',
    participantRange: 'all',
    region: 'all',
    gameMode: 'all',
    sortBy: 'startDate',
    sortOrder: 'desc'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { id: 'all', name: 'جميع الحالات', color: 'text-gray-400' },
    { id: 'upcoming', name: 'قريباً', color: 'text-blue-400' },
    { id: 'open', name: 'مفتوح للتسجيل', color: 'text-green-400' },
    { id: 'live', name: 'جاري الآن', color: 'text-red-400' },
    { id: 'completed', name: 'منتهية', color: 'text-gray-400' },
    { id: 'cancelled', name: 'ملغية', color: 'text-red-600' }
  ];

  const formatOptions = [
    { id: 'all', name: 'جميع الأنواع' },
    { id: 'single_elimination', name: 'إقصاء مباشر' },
    { id: 'double_elimination', name: 'إقصاء مزدوج' },
    { id: 'round_robin', name: 'دوري' },
    { id: 'swiss', name: 'نظام سويسري' }
  ];

  const prizeRanges = [
    { id: 'all', name: 'جميع الجوائز' },
    { id: 'free', name: 'مجاني (بدون جوائز)' },
    { id: '1-100', name: '$1 - $100' },
    { id: '101-500', name: '$101 - $500' },
    { id: '501-1000', name: '$501 - $1000' },
    { id: '1000+', name: '$1000+' }
  ];

  const participantRanges = [
    { id: 'all', name: 'جميع الأحجام' },
    { id: '4-16', name: '4-16 مشارك' },
    { id: '17-32', name: '17-32 مشارك' },
    { id: '33-64', name: '33-64 مشارك' },
    { id: '65+', name: '65+ مشارك' }
  ];

  const regions = [
    { id: 'all', name: 'جميع المناطق' },
    { id: 'global', name: 'عالمي' },
    { id: 'mena', name: 'الشرق الأوسط وشمال أفريقيا' },
    { id: 'europe', name: 'أوروبا' },
    { id: 'asia', name: 'آسيا' },
    { id: 'americas', name: 'الأمريكتين' }
  ];

  const gameModes = [
    { id: 'all', name: 'جميع الأنماط' },
    { id: 'classic', name: 'كلاسيكي' },
    { id: 'tournament', name: 'بطولة' },
    { id: 'ranked', name: 'مرتب' },
    { id: 'custom', name: 'مخصص' }
  ];

  const sortOptions = [
    { id: 'startDate', name: 'تاريخ البداية' },
    { id: 'prizePool', name: 'حجم الجائزة' },
    { id: 'participants', name: 'عدد المشاركين' },
    { id: 'createdAt', name: 'تاريخ الإنشاء' },
    { id: 'popularity', name: 'الشعبية' }
  ];

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      emitFilterChange();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters]);

  const emitFilterChange = () => {
    window.dispatchEvent(new CustomEvent('tournamentFilterChanged', {
      detail: {
        search: searchTerm,
        ...filters
      }
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      format: 'all',
      prizeRange: 'all',
      participantRange: 'all',
      region: 'all',
      gameMode: 'all',
      sortBy: 'startDate',
      sortOrder: 'desc'
    });
    setShowAdvanced(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== 'all' && value !== 'startDate' && value !== 'desc').length;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في البطولات..."
            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-3 rounded-lg border transition-all flex items-center space-x-2 rtl:space-x-reverse ${
              showAdvanced || getActiveFilterCount() > 0
                ? 'border-green-500 bg-green-900/20 text-green-300'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فلاتر متقدمة</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-red-400 hover:text-red-300 transition-colors"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {statusOptions.map((status) => (
          <button
            key={status.id}
            onClick={() => handleFilterChange('status', status.id)}
            className={`px-4 py-2 rounded-lg border transition-all flex items-center space-x-2 rtl:space-x-reverse ${
              filters.status === status.id
                ? 'border-green-500 bg-green-900/20 text-green-300'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              status.id === 'live' ? 'bg-red-500 animate-pulse' :
              status.id === 'open' ? 'bg-green-500' :
              status.id === 'upcoming' ? 'bg-blue-500' :
              status.id === 'completed' ? 'bg-gray-500' :
              status.id === 'cancelled' ? 'bg-red-600' :
              'bg-gray-400'
            }`} />
            <span className={status.color}>{status.name}</span>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-700 pt-6 space-y-6 animate-fade-in">
          {/* Format and Prize */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">نوع البطولة</label>
              <select
                value={filters.format}
                onChange={(e) => handleFilterChange('format', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {formatOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">مدى الجائزة</label>
              <select
                value={filters.prizeRange}
                onChange={(e) => handleFilterChange('prizeRange', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {prizeRanges.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">عدد المشاركين</label>
              <select
                value={filters.participantRange}
                onChange={(e) => handleFilterChange('participantRange', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {participantRanges.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">المنطقة</label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {regions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Game Mode and Sorting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">نمط اللعب</label>
              <select
                value={filters.gameMode}
                onChange={(e) => handleFilterChange('gameMode', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {gameModes.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ترتيب حسب</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">نوع الترتيب</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>
          </div>

          {/* Applied Filters Summary */}
          {getActiveFilterCount() > 0 && (
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">الفلاتر المطبقة:</h4>
                <button
                  onClick={clearFilters}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  مسح الكل
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (value === 'all' || value === 'startDate' || value === 'desc') return null;
                  
                  let label = '';
                  let displayValue = '';
                  
                  switch (key) {
                    case 'status':
                      label = 'الحالة';
                      displayValue = statusOptions.find(s => s.id === value)?.name || value;
                      break;
                    case 'format':
                      label = 'النوع';
                      displayValue = formatOptions.find(f => f.id === value)?.name || value;
                      break;
                    case 'prizeRange':
                      label = 'الجائزة';
                      displayValue = prizeRanges.find(p => p.id === value)?.name || value;
                      break;
                    case 'participantRange':
                      label = 'المشاركين';
                      displayValue = participantRanges.find(p => p.id === value)?.name || value;
                      break;
                    case 'region':
                      label = 'المنطقة';
                      displayValue = regions.find(r => r.id === value)?.name || value;
                      break;
                    case 'gameMode':
                      label = 'نمط اللعب';
                      displayValue = gameModes.find(g => g.id === value)?.name || value;
                      break;
                    case 'sortBy':
                      label = 'ترتيب';
                      displayValue = sortOptions.find(s => s.id === value)?.name || value;
                      break;
                    case 'sortOrder':
                      if (value !== 'desc') {
                        label = 'الترتيب';
                        displayValue = value === 'asc' ? 'تصاعدي' : value;
                      }
                      break;
                  }
                  
                  if (!label || !displayValue) return null;
                  
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-full text-green-300 text-xs"
                    >
                      <span>{label}: {displayValue}</span>
                      <button
                        onClick={() => handleFilterChange(key, key === 'sortBy' ? 'startDate' : key === 'sortOrder' ? 'desc' : 'all')}
                        className="text-green-400 hover:text-green-300"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentFilters; 