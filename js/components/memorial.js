/**
 * Memorial Wall Component
 * Handles the film credits roll, paginated list, and filtering
 */

class MemorialWall {
    constructor() {
        this.memorialData = [];
        this.filteredData = [];
        this.currentFilter = 'all';
        this.currentPage = 0;
        this.pageSize = 500;
        
        this.initializeElements();
        this.bindEvents();
    }

    async initialize() {
        try {
            // Language is now managed by LanguageManager
            // Listen for language changes
            window.addEventListener('languageChanged', (event) => {
                this.onLanguageChanged(event.detail.language);
            });
            
            await this.loadMemorialData();
            await this.initializeMemorialContext();
            this.render();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize memorial wall:', error);
            this.showError('Failed to load memorial data');
        }
    }

    async loadMemorialData() {
        try {
            console.log('🔄 Loading memorial data...');
            const response = await fetch('./data/killed-in-gaza.min.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.memorialData = await response.json();
            this.filteredData = [...this.memorialData];
            
            console.log(`✅ Loaded ${this.memorialData.length} memorial records`);
            
        } catch (error) {
            console.error('❌ Error loading memorial data:', error);
            console.error('🔍 Check if ./data/killed-in-gaza.min.json exists and is accessible');
            throw error;
        }
    }

    async initializeMemorialContext() {
        try {
            console.log('🔄 Initializing memorial context...');
            if (window.memorialContext && window.memorialContext.initializeMemorialContext) {
                await window.memorialContext.initializeMemorialContext();
                console.log('✅ Memorial context initialized successfully');
            } else {
                console.warn('⚠️ Memorial context not available');
            }
        } catch (error) {
            console.error('❌ Error initializing memorial context:', error);
        }
    }

    initializeElements() {
        // Filter buttons
        this.filterButtons = document.querySelectorAll('[data-filter]');
        
        // List elements
        this.memorialList = document.getElementById('memorialList');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.pageInfo = document.getElementById('pageInfo');
        this.currentRange = document.getElementById('currentRange');
        this.totalRecords = document.getElementById('totalRecords');
        
        // Loading
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    bindEvents() {
        // Filtering
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyFilter(e.target.dataset.filter);
            });
        });

        // Pagination
        this.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        this.currentPage = 0;
        
        // Update button states
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Filter data
        this.filteredData = this.memorialData.filter(person => {
            switch (filter) {
                case 'children':
                    return person.age < 18;
                case 'adults':
                    return person.age >= 18 && person.age < 60;
                case 'elders':
                    return person.age >= 60;
                default:
                    return true;
            }
        });

        // Re-render
        this.renderPaginatedList();
    }

    renderPaginatedList() {
        if (!this.memorialList) return;

        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        const html = pageData.map(person => this.createMemorialItem(person)).join('');
        this.memorialList.innerHTML = html;

        this.updatePaginationInfo();
    }

    createMemorialItem(person) {
        const context = this.getPersonContext(person);
        const name = window.currentLanguage === 'ar' ? person.name : person.en_name;
        
        // Special handling for newborns (0 days old)
        let ageDisplay;
        if (person.age === 0) {
            ageDisplay = window.currentLanguage === 'ar' ? 'مولود جديد' : 'Newborn';
        } else if (person.age < 1) {
            const days = Math.floor(person.age * 365);
            ageDisplay = window.currentLanguage === 'ar' ? `${days} يوم` : `${days} days old`;
        } else {
            ageDisplay = window.currentLanguage === 'ar' ? `${person.age} سنة` : `${person.age} years old`;
        }
        
        // Arabic labels for the details
        const ageLabel = window.currentLanguage === 'ar' ? 'العمر: ' : 'Age: ';
        const genderLabel = window.currentLanguage === 'ar' ? 'الجنس: ' : 'Gender: ';
        const bornLabel = window.currentLanguage === 'ar' ? 'تاريخ الميلاد: ' : 'Born: ';
        
        // Gender in Arabic
        const genderText = person.sex === 'm' 
            ? (window.currentLanguage === 'ar' ? 'ذكر' : 'Male')
            : (window.currentLanguage === 'ar' ? 'أنثى' : 'Female');
        
        return `
            <div class="memorial-item" data-id="${person.id}">
                <div class="memorial-name">${name}</div>
                <div class="memorial-context">${context}</div>
                <div class="memorial-details">
                    <span>${ageLabel}${ageDisplay}</span>
                    <span>${genderLabel}${genderText}</span>
                    ${person.dob ? `<span>${bornLabel}${new Date(person.dob).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
        `;
    }

    updatePaginationInfo() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        const startIndex = this.currentPage * this.pageSize + 1;
        const endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.filteredData.length);

        this.currentRange.textContent = `${startIndex}-${endIndex}`;
        this.totalRecords.textContent = this.filteredData.length;
        
        // Update page info with proper language
        const currentLang = window.currentLanguage || 'ar';
        const pageText = currentLang === 'ar' 
            ? `الصفحة ${this.currentPage + 1} من ${totalPages}`
            : `Page ${this.currentPage + 1} of ${totalPages}`;
        this.pageInfo.textContent = pageText;

        this.prevPageBtn.disabled = this.currentPage === 0;
        this.nextPageBtn.disabled = this.currentPage >= totalPages - 1;
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.renderPaginatedList();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.renderPaginatedList();
        }
    }

    getPersonContext(person) {
        // Special handling for newborns and very young children
        if (person.age === 0) {
            return window.currentLanguage === 'ar' ? 'مولود جديد لم يختبر الحياة بعد' : 'Newborn who never experienced life';
        } else if (person.age < 0.01) { // Less than 4 days
            const days = Math.floor(person.age * 365);
            return window.currentLanguage === 'ar' ? `رضيع عمره ${days} أيام فقط` : `Infant only ${days} days old`;
        }
        
        if (window.memorialContext && window.memorialContext.getPersonLifeContext) {
            const context = window.memorialContext.getPersonLifeContext(person, window.currentLanguage || 'en');
            
            if (context.school_context) {
                return window.currentLanguage === 'ar' ? context.school_context.context_ar : context.school_context.context_en;
            } else if (context.life_stage) {
                return window.currentLanguage === 'ar' ? context.life_stage.context_ar : context.life_stage.context_en;
            }
        }
        
        // Fallback context
        if (person.age < 18) {
            return window.currentLanguage === 'ar' ? 'طفل في رحلة التعلم' : 'Child on their learning journey';
        } else if (person.age < 60) {
            return window.currentLanguage === 'ar' ? 'بالغ في سن العمل' : 'Working-age adult';
        } else {
            return window.currentLanguage === 'ar' ? 'كبير السن محترم' : 'Respected elder';
        }
    }

    handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowLeft':
                this.previousPage();
                break;
            case 'ArrowRight':
                this.nextPage();
                break;
            case 'PageUp':
                this.currentPage = Math.max(0, this.currentPage - 5);
                this.renderPaginatedList();
                break;
            case 'PageDown':
                const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
                this.currentPage = Math.min(totalPages - 1, this.currentPage + 5);
                this.renderPaginatedList();
                break;
        }
    }

    render() {
        this.renderPaginatedList();
    }

    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    showError(message) {
        console.error(message);
        // You can implement a proper error display here
    }

    /**
     * Handle language changes from LanguageManager
     */
    onLanguageChanged(language) {
        // Update filter button text
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(btn => {
            const enText = btn.getAttribute('data-en');
            const arText = btn.getAttribute('data-ar');
            if (enText && arText) {
                btn.textContent = language === 'en' ? enText : arText;
            }
        });
        
        // Update pagination text
        const paginationElements = document.querySelectorAll('[data-en], [data-ar]');
        paginationElements.forEach(el => {
            const enText = el.getAttribute('data-en');
            const arText = el.getAttribute('data-ar');
            if (enText && arText) {
                el.textContent = language === 'en' ? enText : arText;
            }
        });
        
        // Re-render the memorial list with new language
        this.render();
    }
}

// Language toggle functionality is now handled by LanguageManager
// This function is kept for backward compatibility but simplified
function initializeLanguageToggle() {
    // Language toggle is now handled by the global LanguageManager
    // This function is kept for any legacy code that might call it
    console.log('Language toggle initialized by LanguageManager');
}

// Initialize memorial wall
async function initializeMemorialWall() {
    // Initialize language toggle first
    initializeLanguageToggle();
    
    // Initialize memorial wall
    window.memorialWall = new MemorialWall();
    await window.memorialWall.initialize();
} 