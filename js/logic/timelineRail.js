/**
 * Timeline Day Rail Component
 * Shows "On This Day of Month" as a simple, relatable story
 */

class TimelineRail {
    constructor(containerId, dataProcessor) {
        this.container = document.getElementById(containerId);
        this.dataProcessor = dataProcessor;
        this.selectedDay = new Date().getDate();
        this.currentMetric = 'all';
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the day rail component
     */
    init() {
        if (!this.container) {
            console.error('❌ Day rail container not found');
            return;
        }

        this.createDaySelector();
        this.setupEventListeners();
        this.isInitialized = true;
        
        console.log('✅ TimelineRail initialized');
    }

    /**
     * Create day selector buttons (1-31)
     */
    createDaySelector() {
        const selector = document.getElementById('day-selector');
        console.log('🔍 Looking for day-selector element:', selector);
        if (!selector) {
            console.error('❌ Day selector element not found!');
            return;
        }
        
        selector.innerHTML = '';
        console.log('📅 Creating day buttons for days 1-31...');
        
        for (let day = 1; day <= 31; day++) {
            const button = document.createElement('button');
            button.className = 'day-btn';
            button.textContent = day;
            button.dataset.day = day;
            
            // Set today as default active
            if (day === this.selectedDay) {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                this.selectDay(day);
            });
            
            selector.appendChild(button);
        }
        
        console.log('✅ Created', selector.children.length, 'day buttons');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for metric changes
        document.addEventListener('metricChanged', (e) => {
            this.currentMetric = e.detail.metric;
            this.updateRail();
        });
        
        // Listen for date clicks from peaks
        document.addEventListener('peakClicked', (e) => {
            const date = new Date(e.detail.date);
            this.selectDay(date.getDate());
        });
    }

    /**
     * Select a specific day of month
     */
    selectDay(day) {
        // Update selected day
        this.selectedDay = day;
        
        // Update UI
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedBtn = document.querySelector(`[data-day="${day}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        // Update the rail display
        this.updateRail();
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('daySelected', {
            detail: { day: day }
        }));
        
        console.log(`📅 Day selected: ${day}`);
    }

    /**
     * Update the rail display for selected day
     */
    updateRail() {
        if (!this.isInitialized || !this.dataProcessor) return;
        
        // Get data for the selected day across all months
        const dayData = this.getDayData(this.selectedDay);
        
        // Render the story
        this.renderStory(dayData);
        
        // Apply current language to newly created content
        this.applyCurrentLanguage();
    }

    /**
     * Get data for a specific day across all months
     */
    getDayData(day) {
        if (!this.dataProcessor || !this.dataProcessor.getMonths) {
            return [];
        }
        
        const months = this.dataProcessor.getMonths();
        const dayData = [];
        
        months.forEach(month => {
            const dateStr = `${month.key}-${day.toString().padStart(2, '0')}`;
            
            const cellData = this.dataProcessor.getCellData(dateStr);
            
            if (cellData && cellData.killed !== undefined) {
                dayData.push({
                    date: dateStr,
                    month: month,
                    value: cellData.killed,
                    corrected: cellData.corrected || false
                });
            }
        });
        
        return dayData;
    }

    /**
     * Render the story for the selected day
     */
    renderStory(dayData) {
        if (!this.container) return;
        
        // Clear previous content
        this.container.innerHTML = '';
        
        if (dayData.length === 0) {
            this.showNoDataMessage();
            return;
        }
        
        // Create story container
        const storyContainer = document.createElement('div');
        storyContainer.className = 'day-story-container';
        
        // Add story header
        const storyHeader = this.createStoryHeader(dayData);
        storyContainer.appendChild(storyHeader);
        
        // Add timeline dots
        const timelineDots = this.createTimelineDots(dayData);
        storyContainer.appendChild(timelineDots);
        
        // Add story summary
        const storySummary = this.createStorySummary(dayData);
        storyContainer.appendChild(storySummary);
        
        this.container.appendChild(storyContainer);
    }

    /**
     * Create story header
     */
    createStoryHeader(dayData) {
        const header = document.createElement('div');
        header.className = 'story-header';
        
        const title = document.createElement('h3');
        title.className = 'story-title';
        title.innerHTML = `
            <span class="en">The ${this.selectedDay}${this.getDaySuffix(this.selectedDay)} of Each Month</span>
            <span class="ar" style="display: none;">${this.selectedDay}${this.getDaySuffixAr(this.selectedDay)} من كل شهر</span>
        `;
        
        const subtitle = document.createElement('p');
        subtitle.className = 'story-subtitle';
        subtitle.innerHTML = `
            <span class="en">How casualties on this day changed from month to month</span>
            <span class="ar" style="display: none;">كيف تغيرت الضحايا في هذا اليوم من شهر لآخر</span>
        `;
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        return header;
    }

    /**
     * Create timeline dots
     */
    createTimelineDots(dayData) {
        const timeline = document.createElement('div');
        timeline.className = 'timeline-dots';
        
        // Find max value for scaling
        const maxValue = Math.max(...dayData.map(d => d.value));
        
        dayData.forEach((data, index) => {
            const dot = this.createTimelineDot(data, maxValue, index);
            timeline.appendChild(dot);
        });
        
        return timeline;
    }

    /**
     * Create individual timeline dot
     */
    createTimelineDot(data, maxValue, index) {
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.dataset.date = data.date;
        dot.dataset.index = index;
        
        // Calculate dot size (sqrt scaling for better visual)
        const size = Math.max(12, Math.sqrt(data.value / maxValue) * 40);
        
        // Calculate color intensity
        const intensity = Math.min(0.9, Math.sqrt(data.value / maxValue));
        const colorValue = Math.round(255 * (1 - intensity));
        
        dot.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: rgb(${colorValue}, ${colorValue}, ${colorValue});
            border: 2px solid var(--accent-red);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        `;
        
        // Add month label
        const label = document.createElement('div');
        label.className = 'dot-label';
        label.innerHTML = `
            <span class="en">${data.month.monthName}</span>
            <span class="ar" style="display: none;">${data.month.monthNameAr}</span>
        `;
        label.style.cssText = `
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 11px;
            color: var(--text-muted);
            white-space: nowrap;
            font-weight: 600;
        `;
        
        // Add value tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'dot-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-date">
                <span class="en">${this.formatDate(data.date)}</span>
                <span class="ar" style="display: none;">${this.formatDateAr(data.date)}</span>
            </div>
            <div class="tooltip-value">
                <span class="en">${data.value.toLocaleString()} martyred</span>
                <span class="ar" style="display: none;">${data.value.toLocaleString('ar-EG')} شهيد</span>
            </div>
            ${data.corrected ? `
                <div class="tooltip-corrected">
                    <span class="en">Data corrected</span>
                    <span class="ar" style="display: none;">تم تصحيح البيانات</span>
                </div>
            ` : ''}
        `;
        tooltip.style.cssText = `
            position: absolute;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-primary);
            border: 1px solid var(--bg-tertiary);
            border-radius: 6px;
            padding: 8px;
            font-size: 12px;
            color: var(--text-secondary);
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 100;
        `;
        
        dot.appendChild(label);
        dot.appendChild(tooltip);
        
        // Add event listeners
        this.addDotEventListeners(dot, data);
        
        return dot;
    }

    /**
     * Add event listeners to timeline dot
     */
    addDotEventListeners(dot, data) {
        // Hover effects
        dot.addEventListener('mouseenter', () => {
            dot.style.transform = 'scale(1.2)';
            dot.style.zIndex = '10';
            
            const tooltip = dot.querySelector('.dot-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
            }
        });
        
        dot.addEventListener('mouseleave', () => {
            dot.style.transform = 'scale(1)';
            dot.style.zIndex = 'auto';
            
            const tooltip = dot.querySelector('.dot-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
            }
        });
        
        // Click to select
        dot.addEventListener('click', () => {
            this.selectDot(data);
        });
        
        // Make focusable
        dot.tabIndex = 0;
        
        // Keyboard navigation
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectDot(data);
            }
        });
    }

    /**
     * Handle dot selection
     */
    selectDot(data) {
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('dotSelected', {
            detail: { data: data }
        }));
        
        console.log(`📅 Dot selected: ${data.date} - ${data.value} martyred`);
    }

    /**
     * Create story summary
     */
    createStorySummary(dayData) {
        const summary = document.createElement('div');
        summary.className = 'story-summary';
        
        // Find worst and best days
        const sortedData = [...dayData].sort((a, b) => b.value - a.value);
        const worstDay = sortedData[0];
        const bestDay = sortedData[sortedData.length - 1];
        
        // Calculate total and average
        const total = dayData.reduce((sum, d) => sum + d.value, 0);
        const average = Math.round(total / dayData.length);
        
        const summaryContent = document.createElement('div');
        summaryContent.className = 'summary-content';
        summaryContent.innerHTML = `
            <div class="summary-stat">
                <span class="stat-label">
                    <span class="en">Total on this day:</span>
                    <span class="ar" style="display: none;">إجمالي في هذا اليوم:</span>
                </span>
                <span class="stat-value">
                    <span class="en">${total.toLocaleString()} martyred</span>
                    <span class="ar" style="display: none;">${total.toLocaleString('ar-EG')} شهيد</span>
                </span>
            </div>
            <div class="summary-stat">
                <span class="stat-label">
                    <span class="en">Average per month:</span>
                    <span class="ar" style="display: none;">المتوسط شهرياً:</span>
                </span>
                <span class="stat-value">
                    <span class="en">${average.toLocaleString()} martyred</span>
                    <span class="ar" style="display: none;">${average.toLocaleString('ar-EG')} شهيد</span>
                </span>
            </div>
            <div class="summary-stat">
                <span class="stat-label">
                    <span class="en">Worst month:</span>
                    <span class="ar" style="display: none;">أسوأ شهر:</span>
                </span>
                <span class="stat-value">
                    <span class="en">${worstDay.month.monthName} ${worstDay.month.year} (${worstDay.value.toLocaleString()})</span>
                    <span class="ar" style="display: none;">${worstDay.month.monthNameAr} ${worstDay.month.year} (${worstDay.value.toLocaleString('ar-EG')})</span>
                </span>
            </div>
            <div class="summary-stat">
                <span class="stat-label">
                    <span class="en">Best month:</span>
                    <span class="ar" style="display: none;">أفضل شهر:</span>
                </span>
                <span class="stat-value">
                    <span class="en">${bestDay.month.monthName} ${bestDay.month.year} (${bestDay.value.toLocaleString()})</span>
                    <span class="ar" style="display: none;">${bestDay.month.monthNameAr} ${bestDay.month.year} (${bestDay.value.toLocaleString('ar-EG')})</span>
                </span>
            </div>
        `;
        
        summary.appendChild(summaryContent);
        
        return summary;
    }

    /**
     * Show no data message
     */
    showNoDataMessage() {
        const message = document.createElement('div');
        message.className = 'no-data-message';
        message.innerHTML = `
            <p>
                <span class="en">No data available for the ${this.selectedDay}${this.getDaySuffix(this.selectedDay)} of any month.</span>
                <span class="ar" style="display: none;">لا توجد بيانات متاحة لـ ${this.selectedDay}${this.getDaySuffixAr(this.selectedDay)} من أي شهر.</span>
            </p>
        `;
        
        this.container.appendChild(message);
    }

    /**
     * Format date for display
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Format date for Arabic display
     */
    formatDateAr(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-EG', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Get day suffix (1st, 2nd, 3rd, etc.)
     */
    getDaySuffix(day) {
        if (day >= 11 && day <= 13) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    /**
     * Get Arabic day suffix (Arabic doesn't use suffixes like English)
     */
    getDaySuffixAr(day) {
        return '';
    }

    /**
     * Refresh the component
     */
    refresh() {
        this.updateRail();
    }

    /**
     * Update language display
     */
    updateLanguage(language) {
        this.currentLanguage = language;
        this.updateRail();
    }

    /**
     * Destroy the component
     */
    destroy() {
        this.isInitialized = false;
        this.container.innerHTML = '';
    }

    /**
     * Apply current language to newly created content
     */
    applyCurrentLanguage() {
        const currentLang = document.documentElement.getAttribute('lang') || 'en';
        const isArabic = currentLang === 'ar';
        
        // Update all language-specific elements in this container
        const englishElements = this.container.querySelectorAll('.en');
        const arabicElements = this.container.querySelectorAll('.ar');
        
        englishElements.forEach(el => {
            el.style.display = isArabic ? 'none' : 'inline';
        });
        
        arabicElements.forEach(el => {
            el.style.display = isArabic ? 'inline' : 'none';
        });
    }
}

// Export for use in other modules
window.TimelineRail = TimelineRail; 