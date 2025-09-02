/**
 * Press Context Rules Engine
 * Generates context chips based on press rules and extracted data
 */

class PressContextEngine {
    constructor() {
        this.rules = [];
        this.roleLabels = {
            en: {
                journalist: 'Journalist',
                photojournalist: 'Photojournalist',
                editor: 'Editor',
                presenter: 'Presenter',
                media_worker: 'Media Worker'
            },
            ar: {
                journalist: 'صحفي',
                photojournalist: 'مصوّر صحفي',
                editor: 'محرر',
                presenter: 'مذيع',
                media_worker: 'عامل إعلامي'
            }
        };
    }

    /**
     * Load press rules from JSON file
     */
    async loadRules() {
        try {
            const response = await fetch('./data/press_rules.json');
            this.rules = await response.json();
            console.log(`✅ Loaded ${this.rules.length} press context rules`);
        } catch (error) {
            console.error('❌ Failed to load press rules:', error);
            this.rules = [];
        }
    }

    /**
     * Generate context chips for a press person
     * @param {Object} person - Normalized PressPerson object
     * @returns {Array} - Array of ContextChip objects
     */
    generateContextChips(person) {
        const chips = [];
        
        // Apply each rule
        this.rules.forEach(rule => {
            if (this.shouldApplyRule(rule, person)) {
                const chip = this.createChip(rule, person);
                if (chip) {
                    chips.push(chip);
                }
            }
        });
        
        // Limit to 4 chips to avoid overwhelming the UI
        return chips.slice(0, 4);
    }

    /**
     * Check if a rule should be applied to a person
     * @param {Object} rule - Rule object from press_rules.json
     * @param {Object} person - PressPerson object
     * @returns {boolean} - Whether rule should be applied
     */
    shouldApplyRule(rule, person) {
        // Check required fields
        if (rule.requires) {
            for (const field of rule.requires) {
                if (!person[field] || (Array.isArray(person[field]) && person[field].length === 0)) {
                    return false;
                }
            }
        }
        
        // Check conditional criteria
        if (rule.when) {
            for (const [field, value] of Object.entries(rule.when)) {
                if (person[field] !== value) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Create a context chip from a rule
     * @param {Object} rule - Rule object
     * @param {Object} person - PressPerson object
     * @returns {Object|null} - ContextChip object or null if invalid
     */
    createChip(rule, person) {
        try {
            const textEn = this.interpolateText(rule.context.en, person, 'en');
            const textAr = this.interpolateText(rule.context.ar, person, 'ar');
            
            if (!textEn || !textAr) {
                return null;
            }
            
            return {
                id: rule.id,
                text_en: textEn,
                text_ar: textAr,
                type: this.determineChipType(rule)
            };
        } catch (error) {
            console.error('Error creating chip for rule:', rule.id, error);
            return null;
        }
    }

    /**
     * Interpolate template variables in text
     * @param {string} template - Text template with {{variable}} placeholders
     * @param {Object} person - PressPerson object
     * @param {string} language - 'en' or 'ar'
     * @returns {string} - Interpolated text
     */
    interpolateText(template, person, language) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, field) => {
            if (field === 'role_en' || field === 'role_ar') {
                const role = person.role;
                if (role && this.roleLabels[language][role]) {
                    return this.roleLabels[language][role];
                }
                return '';
            }
            
            if (field === 'outlet_en' || field === 'outlet_ar') {
                const outlets = person.outlet;
                if (outlets && outlets.length > 0) {
                    // Show first outlet, add "+ more" if multiple
                    if (outlets.length === 1) {
                        return outlets[0];
                    } else {
                        return `${outlets[0]} + ${outlets.length - 1} more`;
                    }
                }
                return '';
            }
            
            if (field === 'family_killed_count') {
                return person.family_killed_count?.toString() || '';
            }
            
            if (field === 'location') {
                return person.location || '';
            }
            
            return '';
        }).trim();
    }

    /**
     * Determine the type of a chip for styling
     * @param {Object} rule - Rule object
     * @returns {string} - Chip type
     */
    determineChipType(rule) {
        if (rule.id.includes('role')) return 'role';
        if (rule.id.includes('outlet')) return 'outlet';
        if (rule.id.includes('circumstance')) return 'circumstance';
        if (rule.id.includes('location')) return 'location';
        if (rule.id.includes('family')) return 'family';
        return 'info';
    }

    /**
     * Get all unique values for a field across all press people
     * @param {Array} pressPeople - Array of PressPerson objects
     * @param {string} field - Field name to extract
     * @returns {Array} - Array of unique values
     */
    getUniqueValues(pressPeople, field) {
        const values = new Set();
        
        pressPeople.forEach(person => {
            if (person[field]) {
                if (Array.isArray(person[field])) {
                    person[field].forEach(value => values.add(value));
                } else {
                    values.add(person[field]);
                }
            }
        });
        
        return Array.from(values).sort();
    }

    /**
     * Get filter options for the UI
     * @param {Array} pressPeople - Array of PressPerson objects
     * @returns {Object} - Filter options organized by category
     */
    getFilterOptions(pressPeople) {
        return {
            roles: this.getUniqueValues(pressPeople, 'role').filter(r => r !== null),
            outlets: this.getUniqueValues(pressPeople, 'outlet'),
            circumstances: this.getUniqueValues(pressPeople, 'circumstance').filter(c => c !== 'unknown'),
            locations: this.getUniqueValues(pressPeople, 'location').filter(l => l !== null)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PressContextEngine;
} 