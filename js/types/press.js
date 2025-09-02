/**
 * Press Person Type Definitions
 * Defines the normalized structure for journalists and media workers
 */

/**
 * @typedef {Object} PressPerson
 * @property {string} id - Unique identifier (slug from Arabic+EN name)
 * @property {string} name_ar - Arabic name
 * @property {string} name_en - English name
 * @property {string|null} role - Journalist role (journalist, photojournalist, editor, presenter, media worker)
 * @property {string[]} outlet - Media outlets they worked for
 * @property {string[]} organization - Umbrella organizations (IFJ, Syndicate) if found
 * @property {string|null} location - Location where they were killed
 * @property {string|null} date - Date of death (ISO format if available)
 * @property {string|null} circumstance - How they were killed
 * @property {number|null} family_killed_count - Number of family members killed with them
 * @property {string} notes - Original notes (untouched)
 * @property {string[]} sources - URLs found in notes
 */

/**
 * @typedef {Object} PressRule
 * @property {string} id - Unique rule identifier
 * @property {string[]} [requires] - Required fields for this rule
 * @property {Object} [when] - Conditional criteria
 * @property {Object} context - Context chip content
 * @property {string} context.en - English context text
 * @property {string} context.ar - Arabic context text
 */

/**
 * @typedef {Object} ContextChip
 * @property {string} id - Chip identifier
 * @property {string} text_en - English text
 * @property {string} text_ar - Arabic text
 * @property {string} type - Chip type (role, outlet, circumstance, location, family)
 */

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PressPerson, PressRule, ContextChip };
} 