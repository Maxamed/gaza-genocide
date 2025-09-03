/**
 * Journalists Memorial Main Controller
 * Coordinates all components and manages the overall functionality
 */

class JournalistsMemorial {
    constructor() {
        this.pressData = [];
        this.normalizedData = [];
        this.filteredData = [];
        this.currentPage = 0;
        this.pageSize = 50;

        
        // Components
        this.pressContext = null;
        this.pressCard = null;
        this.pressFilters = null;
        this.pressRoll = null;
        
        // DOM elements
        this.pressList = null;
        this.loadingOverlay = null;
        this.paginationElements = null;
    }

    /**
     * Initialize all components
     */
    async initializeComponents() {
        try {
            console.log('🔄 Initializing press context engine...');
            // Initialize press context engine
            this.pressContext = new PressContextEngine();
            await this.pressContext.loadRules();
            console.log('✅ Press context engine ready');
            
            console.log('🔄 Initializing press card component...');
            // Initialize other components
            this.pressCard = new PressCard();
            console.log('✅ Press card component ready');
            
            console.log('🔄 Initializing press filters component...');
            this.pressFilters = new PressFilters();
            console.log('✅ Press filters component ready');
            
            console.log('🔄 Press roll component disabled...');
            this.pressRoll = null; // Disabled for now
            console.log('✅ Press roll component disabled');
            
            console.log('✅ All components initialized');
        } catch (error) {
            console.error('❌ Failed to initialize components:', error);
        }
    }



    /**
     * Initialize DOM elements
     */
    initializeElements() {
        console.log('🔄 Initializing DOM elements...');
        
        this.pressList = document.getElementById('pressList');
        console.log('Press list element:', this.pressList);
        
        this.loadingOverlay = document.getElementById('loadingOverlay');
        console.log('Loading overlay element:', this.loadingOverlay);
        
        this.paginationElements = {
            prevPage: document.getElementById('prevPage'),
            nextPage: document.getElementById('nextPage'),
            pageInfo: document.getElementById('pageInfo'),
            currentRange: document.getElementById('currentRange'),
            totalRecords: document.getElementById('totalRecords')
        };
        
        console.log('Pagination elements:', this.paginationElements);
        console.log('✅ DOM elements initialized');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Pagination
        if (this.paginationElements.prevPage) {
            this.paginationElements.prevPage.addEventListener('click', () => {
                this.previousPage();
            });
        }
        
        if (this.paginationElements.nextPage) {
            this.paginationElements.nextPage.addEventListener('click', () => {
                this.nextPage();
            });
        }



        // Set up filter callbacks
        if (this.pressFilters) {
            this.pressFilters.setFilterChangeCallback((filters) => {
                this.handleFilterChange(filters);
            });
            
            this.pressFilters.setSearchChangeCallback((searchTerm) => {
                this.handleSearchChange(searchTerm);
            });
        }
    }

    /**
     * Initialize the memorial
     */
    async initialize() {
        try {
            this.showLoading();
            
            // Initialize components first
            await this.initializeComponents();
            
            // Initialize DOM elements
            this.initializeElements();
            
            // Bind events
            this.bindEvents();
            
            // Load and normalize press data
            await this.loadPressData();
            await this.normalizePressData();
            
            // Set up filters
            this.setupFilters();
            
            // Render initial view
            this.renderCurrentView();
            
            // Listen for language changes from LanguageManager
            window.addEventListener('languageChanged', (event) => {
                this.onLanguageChanged(event.detail.language);
            });
            
            this.hideLoading();
            
            console.log('✅ Journalists memorial initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize journalists memorial:', error);
            this.showError('Failed to load journalists data');
        }
    }

    /**
     * Load raw press data
     */
    async loadPressData() {
        try {
            console.log('🔄 Loading press data...');
            const response = await fetch('./data/press_killed_in_gaza.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.pressData = await response.json();
            console.log(`✅ Loaded ${this.pressData.length} press records`);
            
        } catch (error) {
            console.error('❌ Error loading press data:', error);
            throw error;
        }
    }

    /**
     * Normalize press data using extractors
     */
    async normalizePressData() {
        try {
            console.log('🔄 Normalizing press data...');
            
            this.normalizedData = this.pressData.map(rawRecord => {
                return normalizePress(rawRecord);
            });
            
            this.filteredData = [...this.normalizedData];
            
            console.log(`✅ Normalized ${this.normalizedData.length} press records`);
            
        } catch (error) {
            console.error('❌ Error normalizing press data:', error);
            throw error;
        }
    }

    /**
     * Set up filter options
     */
    setupFilters() {
        if (!this.pressContext || !this.pressFilters) {
            console.warn('⚠️ Components not ready for filter setup');
            return;
        }
        
        try {
            const filterOptions = this.pressContext.getFilterOptions(this.normalizedData);
            this.pressFilters.setFilterOptions(filterOptions);
        } catch (error) {
            console.error('Error setting up filters:', error);
        }
    }



    /**
     * Render the current view
     */
    renderCurrentView() {
        // For now, only render list view since press roll is hidden
        this.renderListView();
    }

    /**
     * Render list view with pagination
     */
    renderListView() {
        if (!this.pressList || !this.pressCard || !this.pressContext) {
            console.warn('⚠️ Components not ready for list view rendering');
            return;
        }
        
        this.pressList.innerHTML = '';
        
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredData.length);
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        // Create press cards
        pageData.forEach(person => {
            try {
                const chips = this.pressContext.generateContextChips(person);
                const card = this.pressCard.createCard(person, chips);
                this.pressList.appendChild(card);
            } catch (error) {
                console.error('Error creating card for person:', person, error);
            }
        });
        
        // Update pagination
        this.updatePagination();
        
        // Update language for new cards
        this.pressCard.updateLanguage(window.currentLanguage);
    }

    /**
     * Render roll view
     */
    renderRollView() {
        // Press roll disabled for now
        console.log('⚠️ Press roll view disabled');
        return;
        
        // if (!this.pressRoll) {
        //     console.warn('⚠️ Press roll component not ready');
        //     return;
        // }
        
        // try {
        //     this.pressRoll.setData(this.filteredData);
        //     this.pressRoll.updateLanguage(window.currentLanguage);
        // } catch (error) {
        //     console.error('Error rendering roll view:', error);
        // }
    }

    /**
     * Handle filter changes
     * @param {Object} filters - Current filter state
     */
    handleFilterChange(filters) {
        // Apply filters to data
        this.filteredData = this.pressFilters.applyFilters(this.normalizedData);
        
        // Reset to first page
        this.currentPage = 0;
        
        // Update both views
        this.renderCurrentView();
        
        // Press roll disabled for now
        // Update roll view if active
        // if (this.currentView === 'roll' && this.pressRoll) {
        //     this.pressRoll.filterData(filters);
        // }
    }

    /**
     * Handle search changes
     * @param {string} searchTerm - Search term
     */
    handleSearchChange(searchTerm) {
        // Search is handled by the filter system
        // This method can be used for additional search-specific logic
    }

    /**
     * Update pagination display
     */
    updatePagination() {
        if (!this.paginationElements) return;
        
        const total = this.filteredData.length;
        const startIndex = this.currentPage * this.pageSize + 1;
        const endIndex = Math.min((this.currentPage + 1) * this.pageSize, total);
        
        // Update range display
        if (this.paginationElements.currentRange) {
            this.paginationElements.currentRange.textContent = `${startIndex}-${endIndex}`;
        }
        
        // Update total records
        if (this.paginationElements.totalRecords) {
            this.paginationElements.totalRecords.textContent = total;
        }
        
        // Update page info
        if (this.paginationElements.pageInfo) {
            const currentPage = this.currentPage + 1;
            const totalPages = Math.ceil(total / this.pageSize);
            
            if (window.currentLanguage === 'ar') {
                this.paginationElements.pageInfo.innerHTML = `<span class="ar">الصفحة ${currentPage}</span>`;
            } else {
                this.paginationElements.pageInfo.innerHTML = `<span class="en">Page ${currentPage}</span>`;
            }
        }
        
        // Update button states
        if (this.paginationElements.prevPage) {
            this.paginationElements.prevPage.disabled = this.currentPage === 0;
        }
        
        if (this.paginationElements.nextPage) {
            this.paginationElements.nextPage.disabled = endIndex >= total;
        }
    }

    /**
     * Go to previous page
     */
    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.renderCurrentView();
        }
    }

    /**
     * Go to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.renderCurrentView();
        }
    }

    /**
     * Toggle language
     * @deprecated This method is deprecated. Language switching is now handled by LanguageManager.
     */
    toggleLanguage() {
        console.warn('toggleLanguage() is deprecated. Use LanguageManager instead.');
        // This method is kept for backward compatibility but no longer functional
    }

    /**
     * Show loading overlay
     */
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('Error:', message);
        // You can implement a more user-friendly error display here
    }

    /**
     * Handle language changes from LanguageManager
     */
    onLanguageChanged(language) {
        // Update filter labels and options
        if (this.pressFilters) {
            this.pressFilters.updateLanguage(language);
        }
        
        // Re-render the current view with new language
        this.renderCurrentView();
    }
}

// Global initialization function
async function initializeJournalistsMemorial() {
    const memorial = new JournalistsMemorial();
    await memorial.initialize();
    
    // Make it globally accessible for debugging
    window.journalistsMemorial = memorial;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JournalistsMemorial;
} 