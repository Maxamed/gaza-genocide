/**
 * Hero Counters Component
 * Displays main statistics with beautiful typography and animations
 */

class HeroCounters {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = null;
        this.formatters = new Formatters();
        this.calculations = new Calculations();
        this.relatabilityEngine = new RelatabilityEngine();
        this.currentComparison = null;
        this.isAnimating = false;
        
        this.init();
    }

    async init() {
        try {
            // Load benchmarks first
            await this.relatabilityEngine.loadBenchmarks();
            
            // Load summary data
            await this.loadData();
            
            // Render the component
            this.render();
            
            // Set up event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Failed to initialize HeroCounters:', error);
            this.showError();
        }
    }

    async loadData() {
        try {
            const response = await fetch('/data/summary.json');
            this.data = await response.json();
        } catch (error) {
            console.error('Failed to load summary data:', error);
            throw error;
        }
    }

    render() {
        if (!this.data) return;

        const daysSinceWar = this.calculations.getDaysSinceWar();
        const totalKilled = this.data.gaza.killed.total;
        
        // Get the best comparison for total killed
        this.currentComparison = this.relatabilityEngine.findBestComparison(totalKilled, null, 'cumulative');

        this.container.innerHTML = `
            <div class="hero-section">
                <div class="hero-header">
                    <h1 class="en">Gaza War Memorial & Tracker</h1>
                    <h1 class="ar" style="display: none;">نصب تذكاري وتتبع لحرب غزة</h1>
                </div>
                
                <div class="hero-counters-grid">
                    <div class="counter-item">
                        <div class="hero-counter counter-animate" data-value="${daysSinceWar}">0</div>
                        <div class="hero-counter-label en">${this.formatters.t('days_since_war')}</div>
                        <div class="hero-counter-label ar" style="display: none;">${this.formatters.t('days_since_war')}</div>
                    </div>
                    
                    <div class="counter-item">
                        <div class="hero-counter counter-animate" data-value="${totalKilled}">0</div>
                        <div class="hero-counter-label en">${this.formatters.t('total_killed')}</div>
                        <div class="hero-counter-label ar" style="display: none;">${this.formatters.t('total_killed')}</div>
                    </div>
                    
                    <div class="counter-item">
                        <div class="hero-counter counter-animate" data-value="${this.data.gaza.killed.children}">0</div>
                        <div class="hero-counter-label en">${this.formatters.t('children_killed')}</div>
                        <div class="hero-counter-label ar" style="display: none;">${this.formatters.t('children_killed')}</div>
                    </div>
                    
                    <div class="counter-item">
                        <div class="hero-counter counter-animate" data-value="${this.data.gaza.killed.women}">0</div>
                        <div class="hero-counter-label en">${this.formatters.t('women_killed')}</div>
                        <div class="hero-counter-label ar" style="display: none;">${this.formatters.t('women_killed')}</div>
                    </div>
                    
                    <div class="counter-item">
                        <div class="hero-counter counter-animate" data-value="${this.data.gaza.killed.press}">0</div>
                        <div class="hero-counter-label en">${this.formatters.t('journalists_killed')}</div>
                        <div class="hero-counter-label ar" style="display: none;">${this.formatters.t('journalists_killed')}</div>
                    </div>
                </div>
                
                ${this.renderComparison()}
                
                <div class="hero-controls">
                    <button class="btn btn-primary" id="see-another-btn">
                        <span class="en">${this.formatters.t('see_another')}</span>
                        <span class="ar" style="display: none;">${this.formatters.t('see_another')}</span>
                    </button>
                    
                    <button class="btn" id="language-toggle">
                        <span class="en">العربية</span>
                        <span class="ar" style="display: none;">English</span>
                    </button>
                </div>
                
                <div class="last-update">
                    <span class="en">${this.formatters.t('last_update')}: ${this.formatters.formatDate(new Date(this.data.gaza.last_update))}</span>
                    <span class="ar" style="display: none;">${this.formatters.t('last_update')}: ${this.formatters.formatDate(new Date(this.data.gaza.last_update))}</span>
                </div>
            </div>
        `;

        // Animate counters after render
        setTimeout(() => this.animateCounters(), 100);
    }

    renderComparison() {
        if (!this.currentComparison) return '';

        const comparisonText = this.relatabilityEngine.formatComparison(
            this.currentComparison, 
            this.data.gaza.killed.total
        );

        return `
            <div class="hero-comparison fact-card fact-card-animate">
                <div class="fact-card-quote en">${comparisonText}</div>
                <div class="fact-card-quote ar" style="display: none;">${comparisonText}</div>
                <div class="fact-card-context en">${this.currentComparison.context}</div>
                <div class="fact-card-context ar" style="display: none;">${this.currentComparison.context}</div>
            </div>
        `;
    }

    animateCounters() {
        const counters = this.container.querySelectorAll('.hero-counter');
        
        counters.forEach(counter => {
            const targetValue = parseInt(counter.dataset.value);
            const duration = 2000; // 2 seconds
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(targetValue * easeOut);
                
                counter.textContent = this.formatters.formatNumber(currentValue);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = this.formatters.formatNumber(targetValue);
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    setupEventListeners() {
        // See Another button
        const seeAnotherBtn = this.container.querySelector('#see-another-btn');
        if (seeAnotherBtn) {
            seeAnotherBtn.addEventListener('click', () => this.showNewComparison());
        }

        // Language toggle
        const languageToggle = this.container.querySelector('#language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Swipe support for mobile
        this.setupSwipeSupport();
    }

    showNewComparison() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Get a new random comparison
        const newComparison = this.relatabilityEngine.getRandomComparison(this.data.gaza.killed.total);
        
        if (newComparison) {
            this.currentComparison = newComparison;
            
            // Fade out current comparison
            const currentComparison = this.container.querySelector('.hero-comparison');
            if (currentComparison) {
                currentComparison.style.opacity = '0';
                currentComparison.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    // Update content
                    const quote = currentComparison.querySelector('.fact-card-quote');
                    const context = currentComparison.querySelector('.fact-card-context');
                    
                    if (quote) {
                        quote.textContent = this.relatabilityEngine.formatComparison(
                            newComparison, 
                            this.data.gaza.killed.total
                        );
                    }
                    
                    if (context) {
                        context.textContent = newComparison.context;
                    }
                    
                    // Fade in new comparison
                    currentComparison.style.opacity = '1';
                    currentComparison.style.transform = 'translateY(0)';
                    this.isAnimating = false;
                }, 300);
            }
        }
    }

    toggleLanguage() {
        const newLang = this.formatters.toggleLanguage();
        const isArabic = newLang === 'ar';
        
        // Toggle visibility of language-specific elements
        const englishElements = this.container.querySelectorAll('.en');
        const arabicElements = this.container.querySelectorAll('.ar');
        
        englishElements.forEach(el => {
            el.style.display = isArabic ? 'none' : 'inline';
        });
        
        arabicElements.forEach(el => {
            el.style.display = isArabic ? 'inline' : 'none';
        });
        
        // Update button text
        const languageToggle = this.container.querySelector('#language-toggle');
        if (languageToggle) {
            const enSpan = languageToggle.querySelector('.en');
            const arSpan = languageToggle.querySelector('.ar');
            
            if (enSpan && arSpan) {
                enSpan.style.display = isArabic ? 'inline' : 'none';
                arSpan.style.display = isArabic ? 'none' : 'inline';
            }
        }
    }

    setupSwipeSupport() {
        let startX = 0;
        let startY = 0;
        let isSwiping = false;
        
        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = false;
        };
        
        const handleTouchMove = (e) => {
            if (!startX || !startY) return;
            
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            // Check if it's a horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                isSwiping = true;
                e.preventDefault();
            }
        };
        
        const handleTouchEnd = (e) => {
            if (!isSwiping) return;
            
            const deltaX = e.changedTouches[0].clientX - startX;
            
            if (Math.abs(deltaX) > 100) {
                if (deltaX > 0) {
                    // Swipe right - show previous comparison
                    this.showPreviousComparison();
                } else {
                    // Swipe left - show next comparison
                    this.showNewComparison();
                }
            }
            
            startX = 0;
            startY = 0;
            isSwiping = false;
        };
        
        this.container.addEventListener('touchstart', handleTouchStart, { passive: false });
        this.container.addEventListener('touchmove', handleTouchMove, { passive: false });
        this.container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    showPreviousComparison() {
        // For now, just show a new comparison
        // In the future, we could maintain a history
        this.showNewComparison();
    }

    showError() {
        this.container.innerHTML = `
            <div class="error-message">
                <h2>${this.formatters.t('error')}</h2>
                <p>${this.formatters.t('error')}</p>
            </div>
        `;
    }

    // Public method to refresh data
    async refresh() {
        await this.loadData();
        this.render();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroCounters;
} else {
    // Browser environment
    window.HeroCounters = HeroCounters;
} 