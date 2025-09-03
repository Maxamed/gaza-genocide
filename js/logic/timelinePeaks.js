/**
 * Timeline Peaks Component
 * Displays top casualty days with annotations and interactive features
 */

class TimelinePeaks {
    constructor(containerId, dataProcessor) {
        this.container = document.getElementById(containerId);
        this.dataProcessor = dataProcessor;
        this.peaks = [];
        this.currentMetric = 'all';
        this.currentSource = 'official';
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the peaks component
     */
    init() {
        if (!this.container) {
            console.error('❌ Peaks container not found');
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;
        
        console.log('✅ TimelinePeaks initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for metric/source changes
        document.addEventListener('metricChanged', (e) => {
            this.currentMetric = e.detail.metric;
            this.updatePeaks();
        });
        
        document.addEventListener('sourceChanged', (e) => {
            this.currentSource = e.detail.source;
            this.updatePeaks();
        });
    }

    /**
     * Update peaks display
     */
    updatePeaks() {
        if (!this.isInitialized) return;
        
        try {
            // Get peaks from the heat map data processor
            if (this.dataProcessor && this.dataProcessor.getPeaks) {
                this.peaks = this.dataProcessor.getPeaks();
            } else {
                // Fallback to old method if available
                this.peaks = this.dataProcessor.getOrganizedData?.()?.peaks || [];
            }
            
            // Sort chronologically (2023 onwards)
            this.peaks.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Limit to top 7
            this.peaks = this.peaks.slice(0, 7);
            
            this.render();
        } catch (error) {
            console.error('❌ Failed to update peaks:', error);
            this.peaks = [];
            this.render();
        }
    }

    /**
     * Render peaks
     */
    render() {
        if (!this.peaks.length) {
            this.container.innerHTML = `
                <p class="no-peaks">
                    <span class="en">No peak data available</span>
                    <span class="ar" style="display: none;">لا توجد بيانات ذروة متاحة</span>
                </p>
            `;
            return;
        }

        this.container.innerHTML = '';
        
        this.peaks.forEach((peak, index) => {
            const peakCard = this.createPeakCard(peak, index);
            this.container.appendChild(peakCard);
        });
    }

    /**
     * Create individual peak card
     */
    createPeakCard(peak, index) {
        const card = document.createElement('div');
        card.className = 'peak-card';
        card.dataset.date = peak.date;
        card.dataset.index = index;
        
        // Get annotation
        const annotation = this.dataProcessor.getAnnotation(peak.date);
        
        // Format date
        const date = new Date(peak.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        // Format date in Arabic
        const dateStrAr = date.toLocaleDateString('ar-EG', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        // Format killed count
        const killedStr = peak.killed.toLocaleString();
        const killedStrAr = peak.killed.toLocaleString('ar-EG');
        
        // Create card content
        card.innerHTML = `
            <div class="peak-date">
                <span class="en">${dateStr}</span>
                <span class="ar" style="display: none;">${dateStrAr}</span>
            </div>
            <div class="peak-count">
                <span class="en">${killedStr} martyred</span>
                <span class="ar" style="display: none;">${killedStrAr} شهيد</span>
            </div>
            ${annotation ? `<div class="peak-annotation">${this.getLocalizedText(annotation)}</div>` : ''}
            <button class="peak-pin" title="Pin to chart">
                <span class="en">Pin</span>
                <span class="ar" style="display: none;">تثبيت</span>
            </button>
        `;
        
        // Add event listeners
        this.addPeakCardListeners(card, peak);
        
        return card;
    }

    /**
     * Add event listeners to peak card
     */
    addPeakCardListeners(card, peak) {
        // Hover effect
        card.addEventListener('mouseenter', () => {
            this.highlightPeak(peak.date);
        });
        
        card.addEventListener('mouseleave', () => {
            this.unhighlightPeak();
        });
        
        // Click to pin
        const pinBtn = card.querySelector('.peak-pin');
        pinBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.pinPeak(peak.date);
        });
        
        // Click card to focus
        card.addEventListener('click', () => {
            this.focusPeak(peak.date);
        });
        
        // Keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.focusPeak(peak.date);
            }
        });
        
        // Make card focusable
        card.tabIndex = 0;
    }

    /**
     * Highlight peak on chart
     */
    highlightPeak(date) {
        // Dispatch event for chart to highlight
        this.container.dispatchEvent(new CustomEvent('peakHovered', {
            detail: { date: date }
        }));
    }

    /**
     * Unhighlight peak
     */
    unhighlightPeak() {
        // Dispatch event for chart to unhighlight
        this.container.dispatchEvent(new CustomEvent('peakUnhovered'));
    }

    /**
     * Pin peak to chart
     */
    pinPeak(date) {
        // Dispatch event for chart to pin
        this.container.dispatchEvent(new CustomEvent('peakPinned', {
            detail: { date: date }
        }));
        
        // Update UI to show pinned state
        this.updatePinnedState(date);
    }

    /**
     * Focus peak (center chart on date)
     */
    focusPeak(date) {
        // Dispatch event for chart to focus
        this.container.dispatchEvent(new CustomEvent('peakFocused', {
            detail: { date: date }
        }));
    }

    /**
     * Update pinned state in UI
     */
    updatePinnedState(pinnedDate) {
        // Remove previous pinned state
        this.container.querySelectorAll('.peak-card.pinned').forEach(card => {
            card.classList.remove('pinned');
        });
        
        // Add pinned state to current card
        if (pinnedDate) {
            const pinnedCard = this.container.querySelector(`[data-date="${pinnedDate}"]`);
            if (pinnedCard) {
                pinnedCard.classList.add('pinned');
            }
        }
    }

    /**
     * Get localized text based on current language
     */
    getLocalizedText(annotation) {
        const currentLang = document.documentElement.getAttribute('lang') || 'en';
        return annotation[currentLang] || annotation.en || '';
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        const currentCard = document.activeElement;
        if (!currentCard || !currentCard.classList.contains('peak-card')) return;
        
        const currentIndex = parseInt(currentCard.dataset.index);
        let nextIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowUp':
                nextIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowDown':
                nextIndex = Math.min(this.peaks.length - 1, currentIndex + 1);
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = this.peaks.length - 1;
                break;
            default:
                return;
        }
        
        if (nextIndex !== currentIndex) {
            e.preventDefault();
            const nextCard = this.container.querySelector(`[data-index="${nextIndex}"]`);
            if (nextCard) {
                nextCard.focus();
            }
        }
    }

    /**
     * Set focus to specific peak
     */
    setFocus(index) {
        const card = this.container.querySelector(`[data-index="${index}"]`);
        if (card) {
            card.focus();
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Highlight a specific date in the peaks
     */
    highlightDate(date) {
        // Remove previous highlights
        this.container.querySelectorAll('.peak-card.highlighted').forEach(card => {
            card.classList.remove('highlighted');
        });
        
        // Add highlight to matching card
        const matchingCard = this.container.querySelector(`[data-date="${date}"]`);
        if (matchingCard) {
            matchingCard.classList.add('highlighted');
            matchingCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Update peaks when data changes
     */
    refresh() {
        this.updatePeaks();
    }

    /**
     * Update language display
     */
    updateLanguage(language) {
        this.currentLanguage = language;
        this.render();
    }

    /**
     * Destroy the component
     */
    destroy() {
        this.isInitialized = false;
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
window.TimelinePeaks = TimelinePeaks; 