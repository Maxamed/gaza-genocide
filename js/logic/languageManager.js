/**
 * Language Manager - Handles language persistence across pages
 * Uses localStorage to remember user's language preference
 */

class LanguageManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.init();
    }

    /**
     * Get stored language from localStorage
     */
    getStoredLanguage() {
        return localStorage.getItem('preferredLanguage') || 'en';
    }

    /**
     * Store language preference in localStorage
     */
    setStoredLanguage(language) {
        localStorage.setItem('preferredLanguage', language);
        this.currentLanguage = language;
    }

    /**
     * Initialize language manager
     */
    init() {
        // Set the global language variable
        window.currentLanguage = this.currentLanguage;
        
        console.log(`🌐 LanguageManager initialized with language: ${this.currentLanguage}`);
        
        // Apply the stored language immediately
        this.applyLanguage(this.currentLanguage);
        
        // Set up language toggle event listeners
        this.setupLanguageToggle();
    }

        /**
     * Apply language to the page
     */
    applyLanguage(language) {
        const html = document.documentElement;
        const body = document.body;
        const englishElements = document.querySelectorAll('.en');
        const arabicElements = document.querySelectorAll('.ar');
        
        console.log(`🌐 Applying language: ${language}`);
        
        if (language === 'ar') {
            // Switch to Arabic
            html.setAttribute('dir', 'rtl');
            html.setAttribute('lang', 'ar');
            body.setAttribute('dir', 'rtl');
            
            englishElements.forEach(el => {
                el.style.display = 'none';
            });
            
            arabicElements.forEach(el => {
                el.style.display = 'inline';
            });
        } else {
            // Switch to English
            html.setAttribute('dir', 'ltr');
            html.setAttribute('lang', 'en');
            body.setAttribute('dir', 'ltr');
            
            englishElements.forEach(el => {
                el.style.display = 'inline';
            });
            
            arabicElements.forEach(el => {
                el.style.display = 'none';
            });
        }

        // Update button text
        this.updateToggleButtonText(language);

        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: language } 
        }));
        
        console.log(`✅ Language applied: ${language}`);
    }

    /**
     * Update the language toggle button text
     */
    updateToggleButtonText(language) {
        const toggleButton = document.getElementById('nav-language-toggle');
        if (toggleButton) {
            const enSpan = toggleButton.querySelector('.en');
            const arSpan = toggleButton.querySelector('.ar');
            
            if (enSpan && arSpan) {
                if (language === 'ar') {
                    enSpan.style.display = 'inline';
                    arSpan.style.display = 'none';
                } else {
                    enSpan.style.display = 'none';
                    arSpan.style.display = 'inline';
                }
            }
        }
    }

    /**
     * Toggle between languages
     */
    toggleLanguage() {
        const newLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        console.log(`🔄 Switching language from ${this.currentLanguage} to ${newLanguage}`);
        this.setStoredLanguage(newLanguage);
        this.applyLanguage(newLanguage);
    }

    /**
     * Set up language toggle event listeners
     */
    setupLanguageToggle() {
        const toggleButton = document.getElementById('nav-language-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Export for use in other modules
window.LanguageManager = LanguageManager; 