/**
 * Press Filters Component
 * Handles filtering and search for the press memorial
 */

class PressFilters {
    constructor() {
        this.currentFilters = {
            role: null,
            outlet: null,
            circumstance: null,
            search: ''
        };
        
        this.filterOptions = {
            roles: [],
            outlets: [],
            circumstances: []
        };
        
        this.onFilterChange = null;
        this.onSearchChange = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.container = document.querySelector('.press-filters');
        this.searchInput = document.querySelector('.press-search-input');
        this.clearFiltersBtn = document.querySelector('.press-clear-filters');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Clear filters button
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    /**
     * Set filter options from press data
     * @param {Object} options - Filter options object
     */
    setFilterOptions(options) {
        this.filterOptions = options;
        this.renderFilterButtons();
    }

    /**
     * Render filter dropdowns based on available options
     */
    renderFilterButtons() {
        // Role filters
        this.renderFilterDropdown('roles', 'role', 'Role', 'الدور');
        
        // Outlet filters
        this.renderFilterDropdown('outlets', 'outlet', 'Outlet', 'الوسيلة');
        
        // Circumstance filters
        this.renderFilterDropdown('circumstances', 'circumstance', 'Circumstance', 'الظرف');
    }

    /**
     * Render a filter dropdown
     * @param {string} optionKey - Key in filterOptions
     * @param {string} filterKey - Key in currentFilters
     * @param {string} labelEn - English label
     * @param {string} labelAr - Arabic label
     */
    renderFilterDropdown(optionKey, filterKey, labelEn, labelAr) {
        const container = document.querySelector(`.press-filter-group[data-type="${filterKey}"]`);
        if (!container) return;

        const options = this.filterOptions[optionKey] || [];
        
        // Clear existing content
        container.innerHTML = '';
        
        // Create label
        const label = document.createElement('label');
        label.className = 'press-filter-label';
        label.innerHTML = `
            <span class="en">${labelEn}</span>
            <span class="ar" style="display: none;">${labelAr}</span>
        `;
        
        // Create select element
        const select = document.createElement('select');
        select.className = 'press-filter-select';
        select.dataset.filter = filterKey;
        
        // Add default "All" option
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All'; // Use simple text, not HTML
        select.appendChild(allOption);
        
        // Add option elements
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        
        // Add change event listener
        select.addEventListener('change', (e) => {
            this.handleFilterChange(e.target);
        });
        
        // Append label and select to container
        container.appendChild(label);
        container.appendChild(select);
        
        // Set initial language state
        this.updateFilterLanguage();
    }

    /**
     * Update filter language display based on current language
     */
    updateFilterLanguage() {
        const currentLang = document.documentElement.getAttribute('lang') || 'en';
        const isArabic = currentLang === 'ar';
        
        // Update labels
        const filterLabels = document.querySelectorAll('.press-filter-label');
        filterLabels.forEach(label => {
            const textEn = label.querySelector('.en');
            const textAr = label.querySelector('.ar');
            
            if (isArabic) {
                textEn.style.display = 'none';
                textAr.style.display = 'inline';
            } else {
                textEn.style.display = 'inline';
                textAr.style.display = 'none';
            }
        });
        
        // Update "All" options
        const filterSelects = document.querySelectorAll('.press-filter-select');
        filterSelects.forEach(select => {
            const allOption = select.querySelector('option[value=""]');
            if (allOption) {
                allOption.textContent = isArabic ? 'الكل' : 'All';
            }
        });
    }



    /**
     * Handle filter select change
     * @param {HTMLSelectElement} select - Changed select element
     */
    handleFilterChange(select) {
        const filterType = select.dataset.filter;
        const value = select.value;
        
        // Update current filters
        if (value === '') {
            this.currentFilters[filterType] = null;
        } else {
            this.currentFilters[filterType] = value;
        }
        
        // Trigger filter change callback
        if (this.onFilterChange) {
            this.onFilterChange(this.currentFilters);
        }
    }



    /**
     * Handle search input
     * @param {string} searchTerm - Search term
     */
    handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm.toLowerCase();
        
        // Trigger search change callback
        if (this.onSearchChange) {
            this.onSearchChange(searchTerm);
        }
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        this.currentFilters = {
            role: null,
            outlet: null,
            circumstance: null,
            search: this.currentFilters.search // Keep search term
        };
        
        // Reset search input
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // Reset select elements
        const selects = document.querySelectorAll('.press-filter-select');
        selects.forEach(select => {
            select.value = '';
        });
        
        // Trigger filter change callback
        if (this.onFilterChange) {
            this.onFilterChange(this.currentFilters);
        }
    }

    /**
     * Get current filter state
     * @returns {Object} - Current filters object
     */
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    /**
     * Set filter change callback
     * @param {Function} callback - Callback function
     */
    setFilterChangeCallback(callback) {
        this.onFilterChange = callback;
    }

    /**
     * Set search change callback
     * @param {Function} callback - Callback function
     */
    setSearchChangeCallback(callback) {
        this.onSearchChange = callback;
    }

    /**
     * Update language display
     * @param {string} language - 'en' or 'ar'
     */
    updateLanguage(language) {
        // Update search placeholder
        if (this.searchInput) {
            if (language === 'ar') {
                this.searchInput.placeholder = 'البحث في الأسماء والملاحظات...';
            } else {
                this.searchInput.placeholder = 'Search names and notes...';
            }
        }

        // Update filter labels
        const filterLabels = document.querySelectorAll('.press-filter-label');
        filterLabels.forEach(label => {
            const textEn = label.querySelector('.en');
            const textAr = label.querySelector('.ar');
            
            if (language === 'ar') {
                textEn.style.display = 'none';
                textAr.style.display = 'inline';
            } else {
                textEn.style.display = 'inline';
                textAr.style.display = 'none';
            }
        });

        // Update select options to show only current language
        const filterSelects = document.querySelectorAll('.press-filter-select');
        filterSelects.forEach(select => {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                if (option.value === '') {
                    // This is the "All" option - update its text
                    if (language === 'ar') {
                        option.textContent = 'الكل';
                    } else {
                        option.textContent = 'All';
                    }
                }
                // Other options keep their original text (outlet names, etc.)
            });
        });

        // Update clear filters button
        if (this.clearFiltersBtn) {
            const clearEn = this.clearFiltersBtn.querySelector('.en');
            const clearAr = this.clearFiltersBtn.querySelector('.ar');
            
            if (language === 'ar') {
                clearEn.style.display = 'none';
                clearAr.style.display = 'inline';
            } else {
                clearEn.style.display = 'inline';
                clearAr.style.display = 'none';
            }
        }
    }

    /**
     * Apply filters to press data
     * @param {Array} pressData - Array of PressPerson objects
     * @returns {Array} - Filtered data
     */
    applyFilters(pressData) {
        return pressData.filter(person => {
            // Role filter
            if (this.currentFilters.role && person.role !== this.currentFilters.role) {
                return false;
            }
            
            // Outlet filter
            if (this.currentFilters.outlet && !person.outlet.includes(this.currentFilters.outlet)) {
                return false;
            }
            
            // Circumstance filter
            if (this.currentFilters.circumstance && person.circumstance !== this.currentFilters.circumstance) {
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = [
                    person.name_ar,
                    person.name_en,
                    person.notes
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PressFilters;
} 