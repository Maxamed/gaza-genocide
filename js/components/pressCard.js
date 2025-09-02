/**
 * Press Card Component
 * Renders individual journalist cards with context chips
 */

class PressCard {
    constructor() {
        this.currentLanguage = 'en';
    }

    /**
     * Create a press card element
     * @param {Object} person - Normalized PressPerson object
     * @param {Array} chips - Array of ContextChip objects
     * @returns {HTMLElement} - Card DOM element
     */
    createCard(person, chips) {
        const card = document.createElement('div');
        card.className = 'press-card';
        card.dataset.id = person.id;
        
        // Header with names
        const header = this.createHeader(person);
        
        // Context chips
        const chipsContainer = this.createChipsContainer(chips);
        
        // Notes section
        const notesSection = this.createNotesSection(person);
        
        // Sources section (if any)
        const sourcesSection = person.sources.length > 0 ? this.createSourcesSection(person.sources) : null;
        
        // Assemble card
        card.appendChild(header);
        card.appendChild(chipsContainer);
        card.appendChild(notesSection);
        if (sourcesSection) {
            card.appendChild(sourcesSection);
        }
        
        return card;
    }

    /**
     * Create the header section with Arabic and English names
     * @param {Object} person - PressPerson object
     * @returns {HTMLElement} - Header element
     */
    createHeader(person) {
        const header = document.createElement('div');
        header.className = 'press-card-header';
        
        // Arabic name
        const nameAr = document.createElement('h3');
        nameAr.className = 'press-name-ar';
        nameAr.textContent = person.name_ar;
        
        // English name
        const nameEn = document.createElement('h4');
        nameEn.className = 'press-name-en';
        nameEn.textContent = person.name_en;
        
        // Separator dot
        const separator = document.createElement('span');
        separator.className = 'press-name-separator';
        separator.textContent = ' · ';
        
        header.appendChild(nameAr);
        header.appendChild(separator);
        header.appendChild(nameEn);
        
        return header;
    }

    /**
     * Create the context chips container
     * @param {Array} chips - Array of ContextChip objects
     * @returns {HTMLElement} - Chips container
     */
    createChipsContainer(chips) {
        const container = document.createElement('div');
        container.className = 'press-chips-container';
        
        chips.forEach(chip => {
            const chipElement = this.createChip(chip);
            container.appendChild(chipElement);
        });
        
        return container;
    }

    /**
     * Create an individual context chip
     * @param {Object} chip - ContextChip object
     * @returns {HTMLElement} - Chip element
     */
    createChip(chip) {
        const chipElement = document.createElement('span');
        chipElement.className = `press-chip press-chip-${chip.type}`;
        chipElement.dataset.type = chip.type;
        
        // English text
        const textEn = document.createElement('span');
        textEn.className = 'press-chip-text en';
        textEn.textContent = chip.text_en;
        
        // Arabic text
        const textAr = document.createElement('span');
        textAr.className = 'press-chip-text ar';
        textAr.textContent = chip.text_ar;
        textAr.style.display = 'none';
        
        chipElement.appendChild(textEn);
        chipElement.appendChild(textAr);
        
        return chipElement;
    }

    /**
     * Create the notes section with expandable text
     * @param {Object} person - PressPerson object
     * @returns {HTMLElement} - Notes section
     */
    createNotesSection(person) {
        const section = document.createElement('div');
        section.className = 'press-notes-section';
        
        if (!person.notes) {
            section.style.display = 'none';
            return section;
        }
        
        // Notes text (truncated to reasonable length)
        const notesText = document.createElement('p');
        notesText.className = 'press-notes-text';
        
        const truncatedText = this.truncateText(person.notes, 200);
        notesText.innerHTML = truncatedText;
        
        section.appendChild(notesText);
        
        return section;
    }

    /**
     * Create the sources section with external links
     * @param {Array} sources - Array of source URLs
     * @returns {HTMLElement} - Sources section
     */
    createSourcesSection(sources) {
        const section = document.createElement('div');
        section.className = 'press-sources-section';
        
        const title = document.createElement('h5');
        title.className = 'press-sources-title';
        title.innerHTML = '<span class="en">Sources</span><span class="ar" style="display: none;">المصادر</span>';
        
        const linksContainer = document.createElement('div');
        linksContainer.className = 'press-sources-links';
        
        sources.forEach((source, index) => {
            const link = document.createElement('a');
            link.href = source;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'press-source-link';
            link.innerHTML = `
                <svg class="press-source-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15,3 21,3 21,9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span class="en">Source ${index + 1}</span>
                <span class="ar" style="display: none;">مصدر ${index + 1}</span>
            `;
            
            linksContainer.appendChild(link);
        });
        
        section.appendChild(title);
        section.appendChild(linksContainer);
        
        return section;
    }

    /**
     * Truncate text to specified length with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} - Truncated text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        
        // Find the last complete sentence or word within the limit
        const truncated = text.substring(0, maxLength);
        
        // Try to find a sentence ending first
        const lastSentence = Math.max(
            truncated.lastIndexOf('. '),
            truncated.lastIndexOf('! '),
            truncated.lastIndexOf('? ')
        );
        
        if (lastSentence > maxLength * 0.7) { // Only use sentence break if it's not too early
            return truncated.substring(0, lastSentence + 1) + '...';
        }
        
        // Otherwise find the last complete word
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > maxLength * 0.8) { // Only use word break if it's not too early
            return truncated.substring(0, lastSpace) + '...';
        }
        
        // If we can't find a good break point, just truncate and add ellipsis
        return truncated + '...';
    }

    /**
     * Update language display for all cards
     * @param {string} language - 'en' or 'ar'
     */
    updateLanguage(language) {
        this.currentLanguage = language;
        
        // Update all press cards on the page
        const cards = document.querySelectorAll('.press-card');
        cards.forEach(card => {
            this.updateCardLanguage(card, language);
        });
    }

    /**
     * Update language display for a specific card
     * @param {HTMLElement} card - Card element
     * @param {string} language - 'en' or 'ar'
     */
    updateCardLanguage(card, language) {
        // Update names
        const nameAr = card.querySelector('.press-name-ar');
        const nameEn = card.querySelector('.press-name-en');
        const separator = card.querySelector('.press-name-separator');
        
        if (language === 'ar') {
            nameAr.style.display = 'inline';
            nameEn.style.display = 'none';
            separator.style.display = 'none';
        } else {
            nameAr.style.display = 'inline';
            nameEn.style.display = 'inline';
            separator.style.display = 'inline';
        }
        
        // Update chips
        const chips = card.querySelectorAll('.press-chip');
        chips.forEach(chip => {
            const textEn = chip.querySelector('.en');
            const textAr = chip.querySelector('.ar');
            
            if (language === 'ar') {
                textEn.style.display = 'none';
                textAr.style.display = 'inline';
            } else {
                textEn.style.display = 'inline';
                textAr.style.display = 'none';
            }
        });
        

        
        // Update sources section
        const sourceLinks = card.querySelectorAll('.press-source-link');
        sourceLinks.forEach(link => {
            const linkTextEn = link.querySelector('.en');
            const linkTextAr = link.querySelector('.ar');
            
            if (language === 'ar') {
                linkTextEn.style.display = 'none';
                linkTextAr.style.display = 'inline';
            } else {
                linkTextEn.style.display = 'inline';
                linkTextAr.style.display = 'none';
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PressCard;
} 