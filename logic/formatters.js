/**
 * Formatters - Utility functions for dates, numbers, and language
 */

class Formatters {
    constructor() {
        this.currentLanguage = 'en'; // 'en' or 'ar'
        this.warStartDate = new Date('2023-10-07');
    }

    /**
     * Toggle between English and Arabic
     */
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        return this.currentLanguage;
    }

    /**
     * Set language explicitly
     */
    setLanguage(lang) {
        this.currentLanguage = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }

    /**
     * Get text in current language
     */
    t(key) {
        const translations = {
            en: {
                'days_since_war': 'Days since war began',
                'total_killed': 'Total martyred',
                'children_killed': 'Children martyred',
                'women_killed': 'Women martyred',
                'journalists_killed': 'Journalists martyred',
                'injured': 'Injured',
                'last_update': 'Last updated',
                'see_another': 'See Another',
                'share': 'Share',
                'loading': 'Loading...',
                'error': 'Error loading data'
            },
            ar: {
                'days_since_war': 'أيام منذ بداية الحرب',
                'total_killed': 'إجمالي الشهداء',
                'children_killed': 'الأطفال الشهداء',
                'women_killed': 'النساء الشهيدات',
                'journalists_killed': 'الصحفيون الشهداء',
                'injured': 'المصابون',
                'last_update': 'آخر تحديث',
                'see_another': 'شاهد آخر',
                'share': 'شارك',
                'loading': 'جاري التحميل...',
                'error': 'خطأ في تحميل البيانات'
            }
        };

        return translations[this.currentLanguage][key] || key;
    }

    /**
     * Format number with appropriate separators
     */
    formatNumber(num, language = null) {
        const lang = language || this.currentLanguage;
        
        if (lang === 'ar') {
            // Arabic number formatting
            return num.toLocaleString('ar-EG');
        } else {
            // English number formatting
            return num.toLocaleString('en-US');
        }
    }

    /**
     * Calculate days since war began
     */
    getDaysSinceWar() {
        const today = new Date();
        const diffTime = Math.abs(today - this.warStartDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Format date in current language
     */
    formatDate(date, format = 'long') {
        const lang = this.currentLanguage;
        
        if (format === 'short') {
            return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } else {
            return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    /**
     * Format relative time (e.g., "2 days ago")
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (this.currentLanguage === 'ar') {
            if (diffDays === 0) return 'اليوم';
            if (diffDays === 1) return 'أمس';
            if (diffDays < 7) return `منذ ${diffDays} أيام`;
            if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
            if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
            return `منذ ${Math.floor(diffDays / 365)} سنوات`;
        } else {
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
            return `${Math.floor(diffDays / 365)} years ago`;
        }
    }

    /**
     * Format percentage
     */
    formatPercentage(value, total) {
        const percentage = (value / total) * 100;
        return `${percentage.toFixed(1)}%`;
    }

    /**
     * Format large numbers with abbreviations
     */
    formatLargeNumber(num) {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    }

    /**
     * Get ordinal suffix for numbers
     */
    getOrdinalSuffix(num) {
        if (this.currentLanguage === 'ar') {
            // Arabic ordinal numbers
            if (num === 1) return 'الأول';
            if (num === 2) return 'الثاني';
            if (num === 3) return 'الثالث';
            return `${num}`;
        } else {
            // English ordinal numbers
            const j = num % 10;
            const k = num % 100;
            if (j === 1 && k !== 11) return `${num}st`;
            if (j === 2 && k !== 12) return `${num}nd`;
            if (j === 3 && k !== 13) return `${num}rd`;
            return `${num}th`;
        }
    }

    /**
     * Format currency (if needed)
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat(this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
} else {
    // Browser environment
    window.Formatters = Formatters;
} 