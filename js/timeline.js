/**
 * Main Timeline Application
 * Initializes and coordinates all timeline components with the new heat map system
 */

class TimelineApp {
    constructor() {
        this.dataProcessor = null;
        this.peaks = null;
        this.rail = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the timeline application
     */
    async init() {
        try {
            console.log('🚀 Initializing Timeline App with Heat Map...');
            
            // Initialize heat map data processor
            this.dataProcessor = new HeatmapDataProcessor();
            await this.dataProcessor.init();
            
            // Initialize components
            this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update KPIs
            this.updateKPIs();
            

            
            // Initial render
            this.refreshAll();
            
            // Set initial page title based on current language
            const currentLang = document.documentElement.getAttribute('lang') || 'en';
            this.updatePageTitle(currentLang);
            
            this.isInitialized = true;
            console.log('✅ Timeline App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Timeline App:', error);
            this.showError({
                en: 'Failed to load timeline data. Please refresh the page.',
                ar: 'فشل في تحميل بيانات الجدول الزمني. يرجى تحديث الصفحة.'
            });
        }
    }

    /**
     * Initialize all timeline components
     */
    initializeComponents() {
        console.log('🔧 Initializing components with data processor:', this.dataProcessor);
        
        // Initialize peaks
        this.peaks = new TimelinePeaks('peaks-list', this.dataProcessor);
        
        // Initialize day rail (for day selection)
        this.rail = new TimelineRail('day-rail', this.dataProcessor);
        
        console.log('✅ Components initialized');
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Peaks interactions
        this.setupPeaksInteractions();
        
        // Rail interactions
        this.setupRailInteractions();
        
        // Language change handling
        document.addEventListener('languageChanged', (e) => {
            this.updatePageTitle(e.detail.language);
            this.peaks?.updateLanguage(e.detail.language);
            this.rail?.updateLanguage(e.detail.language);
            this.refreshAll();
        });
    }



    /**
     * Setup peaks interaction events
     */
    setupPeaksInteractions() {
        if (!this.peaks) return;
        
        // Peak card click events
        document.addEventListener('peakClicked', (e) => {
            const { date } = e.detail;
            this.handlePeakClicked(date);
        });
    }

    /**
     * Setup rail interaction events
     */
    setupRailInteractions() {
        if (!this.rail) return;
        
        // Day selection events
        document.addEventListener('daySelected', (e) => {
            const { day } = e.detail;
            this.handleDaySelected(day);
        });
    }



    /**
     * Handle peak card click
     */
    handlePeakClicked(date) {
        console.log(`📊 Peak clicked: ${date}`);
        
        // Update rail to show this day of month
        if (this.rail) {
            const dateObj = new Date(date);
            const dayOfMonth = dateObj.getDate();
            this.rail.selectDay(dayOfMonth);
        }
    }

    /**
     * Handle day selection from rail
     */
    handleDaySelected(day) {
        console.log(`📅 Day selected: ${day}`);
        
        // The heat map will automatically update when metric changes
        // This is handled by the data processor
    }



    /**
     * Update KPIs display
     */
    updateKPIs() {
        try {
            const kpis = this.dataProcessor.getKPIs();
            
            // Update KPI values
            const totalElement = document.getElementById('total-killed');
            const todayElement = document.getElementById('today-killed');
            const weekElement = document.getElementById('week-killed');
            const monthElement = document.getElementById('month-killed');
            
            if (totalElement) totalElement.textContent = kpis.total.toLocaleString();
            if (todayElement) todayElement.textContent = kpis.today.toLocaleString();
            if (weekElement) weekElement.textContent = kpis.week.toLocaleString();
            if (monthElement) monthElement.textContent = kpis.month.toLocaleString();
            
        } catch (error) {
            console.error('❌ Failed to update KPIs:', error);
        }
    }

    /**
     * Update page title based on language
     */
    updatePageTitle(language) {
        const titles = {
            en: 'Timeline — Daily Casualties | Gaza Genocide Memorial - Human Scale',
            ar: 'الجدول الزمني — الضحايا اليومية | نصب ذكرى إبادة غزة - المقياس البشري'
        };
        document.title = titles[language] || titles.en;
    }

    /**
     * Refresh all components
     */
    refreshAll() {
        try {
            // Update peaks
            if (this.peaks) {
                this.peaks.refresh();
            }
            
            // Update rail
            if (this.rail) {
                this.rail.refresh();
            }
            
            // Update KPIs
            this.updateKPIs();
            
        } catch (error) {
            console.error('❌ Failed to refresh components:', error);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #FEE2E2;
            color: #DC2626;
            padding: 1rem;
            margin: 1rem;
            border-radius: 8px;
            border: 1px solid #FCA5A5;
            text-align: center;
        `;
        // Support bilingual error messages
        if (typeof message === 'object' && message.en && message.ar) {
            errorDiv.innerHTML = `
                <span class="en">${message.en}</span>
                <span class="ar" style="display: none;">${message.ar}</span>
            `;
        } else {
            errorDiv.textContent = message;
        }
        
        const container = document.querySelector('.main-container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
        }
    }

    /**
     * Get current state
     */
    getState() {
        return this.dataProcessor ? this.dataProcessor.getState() : null;
    }

    /**
     * Destroy the application
     */
    destroy() {
        if (this.peaks) this.peaks.destroy();
        if (this.rail) this.rail.destroy();
        
        this.isInitialized = false;
        console.log('🗑️ Timeline App destroyed');
    }
}

// Initialize the timeline app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM ready, initializing timeline with heat map...');
    window.timelineApp = new TimelineApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.timelineApp) {
        window.timelineApp.destroy();
    }
}); 