/**
 * Press Roll Component
 * Handles the continuous scrolling credits mode
 */

class PressRoll {
    constructor() {
        this.isPlaying = true;
        this.scrollSpeed = 30; // pixels per second
        this.currentLanguage = 'en';
        this.pressData = [];
        this.filteredData = [];
        
        this.container = null;
        this.rollContainer = null;
        this.playPauseBtn = null;
        this.counter = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.container = document.querySelector('.press-roll-container');
        this.rollContainer = document.querySelector('.press-roll-content');
        this.playPauseBtn = document.querySelector('.press-roll-play-pause');
        this.counter = document.querySelector('.press-roll-counter');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Play/pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlayPause();
            }
        });

        // Hover to pause
        if (this.container) {
            this.container.addEventListener('mouseenter', () => {
                this.pause();
            });
            
            this.container.addEventListener('mouseleave', () => {
                if (this.isPlaying) {
                    this.play();
                }
            });
        }
    }

    /**
     * Set press data and start the roll
     * @param {Array} pressData - Array of PressPerson objects
     */
    setData(pressData) {
        this.pressData = pressData;
        this.filteredData = [...pressData];
        this.renderRoll();
        this.startRoll();
    }

    /**
     * Filter the roll data
     * @param {Object} filters - Filter object
     */
    filterData(filters) {
        // Apply filters (same logic as PressFilters)
        this.filteredData = this.pressData.filter(person => {
            if (filters.role && person.role !== filters.role) return false;
            if (filters.outlet && !person.outlet.includes(filters.outlet)) return false;
            if (filters.circumstance && person.circumstance !== filters.circumstance) return false;
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const searchableText = [
                    person.name_ar,
                    person.name_en,
                    person.notes
                ].join(' ').toLowerCase();
                if (!searchableText.includes(searchTerm)) return false;
            }
            return true;
        });
        
        this.renderRoll();
        this.updateCounter();
    }

    /**
     * Render the roll content
     */
    renderRoll() {
        if (!this.rollContainer) return;
        
        this.rollContainer.innerHTML = '';
        
        // Create roll items
        this.filteredData.forEach(person => {
            const rollItem = this.createRollItem(person);
            this.rollContainer.appendChild(rollItem);
        });
        
        // Duplicate items for seamless loop
        this.filteredData.forEach(person => {
            const rollItem = this.createRollItem(person);
            this.rollContainer.appendChild(rollItem);
        });
        
        this.updateCounter();
    }

    /**
     * Create a roll item
     * @param {Object} person - PressPerson object
     * @returns {HTMLElement} - Roll item element
     */
    createRollItem(person) {
        const item = document.createElement('div');
        item.className = 'press-roll-item';
        
        // Arabic name
        const nameAr = document.createElement('span');
        nameAr.className = 'press-roll-name-ar';
        nameAr.textContent = person.name_ar;
        
        // English name
        const nameEn = document.createElement('span');
        nameEn.className = 'press-roll-name-en';
        nameEn.textContent = person.name_en;
        
        // Outlet info
        const outlet = document.createElement('span');
        outlet.className = 'press-roll-outlet';
        if (person.outlet && person.outlet.length > 0) {
            outlet.textContent = person.outlet[0];
        }
        
        // Separator
        const separator = document.createElement('span');
        separator.className = 'press-roll-separator';
        separator.textContent = ' • ';
        
        item.appendChild(nameAr);
        item.appendChild(separator);
        item.appendChild(nameEn);
        if (person.outlet && person.outlet.length > 0) {
            item.appendChild(separator.cloneNode(true));
            item.appendChild(outlet);
        }
        
        return item;
    }

    /**
     * Start the rolling animation
     */
    startRoll() {
        if (!this.rollContainer) return;
        
        // Reset position
        this.rollContainer.style.transform = 'translateY(0)';
        
        // Start animation
        this.animate();
    }

    /**
     * Animate the roll
     */
    animate() {
        if (!this.isPlaying || !this.rollContainer) return;
        
        const currentY = parseFloat(this.rollContainer.style.transform.replace('translateY(', '').replace('px)', '') || 0);
        const newY = currentY - (this.scrollSpeed / 60); // 60 FPS
        
        // Check if we need to loop
        const containerHeight = this.rollContainer.offsetHeight;
        const viewportHeight = this.container?.offsetHeight || 0;
        
        if (Math.abs(newY) >= containerHeight / 2) {
            // Reset to beginning for seamless loop
            this.rollContainer.style.transform = 'translateY(0)';
        } else {
            this.rollContainer.style.transform = `translateY(${newY}px)`;
        }
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }

    /**
     * Play the roll
     */
    play() {
        this.isPlaying = true;
        this.updatePlayPauseButton();
        this.animate();
    }

    /**
     * Pause the roll
     */
    pause() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
    }

    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Update play/pause button state
     */
    updatePlayPauseButton() {
        if (!this.playPauseBtn) return;
        
        const icon = this.playPauseBtn.querySelector('.press-roll-icon');
        const text = this.playPauseBtn.querySelector('.press-roll-btn-text');
        
        if (this.isPlaying) {
            // Show pause icon
            icon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            `;
            text.innerHTML = '<span class="en">Pause</span><span class="ar" style="display: none;">إيقاف مؤقت</span>';
        } else {
            // Show play icon
            icon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
            `;
            text.innerHTML = '<span class="en">Play</span><span class="ar" style="display: none;">تشغيل</span>';
        }
    }

    /**
     * Update the counter display
     */
    updateCounter() {
        if (!this.counter) return;
        
        const total = this.pressData.length;
        const filtered = this.filteredData.length;
        
        if (total === filtered) {
            this.counter.innerHTML = `
                <span class="en">Journalists and media workers killed: ${total}</span>
                <span class="ar" style="display: none;">الصحفيون والعاملون في الإعلام الذين قُتلوا: ${total}</span>
            `;
        } else {
            this.counter.innerHTML = `
                <span class="en">Showing ${filtered} of ${total} journalists</span>
                <span class="ar" style="display: none;">عرض ${filtered} من ${total} صحفي</span>
            `;
        }
    }

    /**
     * Update language display
     * @param {string} language - 'en' or 'ar'
     */
    updateLanguage(language) {
        this.currentLanguage = language;
        
        // Update roll items
        const rollItems = this.rollContainer?.querySelectorAll('.press-roll-item') || [];
        rollItems.forEach(item => {
            const nameAr = item.querySelector('.press-roll-name-ar');
            const nameEn = item.querySelector('.press-roll-name-en');
            const outlet = item.querySelector('.press-roll-outlet');
            const separators = item.querySelectorAll('.press-roll-separator');
            
            if (language === 'ar') {
                nameAr.style.display = 'inline';
                nameEn.style.display = 'none';
                outlet.style.display = 'none';
                separators.forEach(sep => sep.style.display = 'none');
            } else {
                nameAr.style.display = 'inline';
                nameEn.style.display = 'inline';
                outlet.style.display = 'inline';
                separators.forEach(sep => sep.style.display = 'inline');
            }
        });
        
        // Update button text
        this.updatePlayPauseButton();
        
        // Update counter
        this.updateCounter();
    }

    /**
     * Set scroll speed
     * @param {number} speed - Pixels per second
     */
    setScrollSpeed(speed) {
        this.scrollSpeed = speed;
    }

    /**
     * Get current scroll speed
     * @returns {number} - Current scroll speed
     */
    getScrollSpeed() {
        return this.scrollSpeed;
    }

    /**
     * Destroy the component
     */
    destroy() {
        this.pause();
        this.isPlaying = false;
        
        // Remove event listeners
        if (this.playPauseBtn) {
            this.playPauseBtn.removeEventListener('click', this.togglePlayPause);
        }
        
        document.removeEventListener('keydown', this.handleKeydown);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PressRoll;
} 