/**
 * Press Data Extractors
 * Pure functions to extract structured information from raw press notes
 */

/**
 * Create a unique ID from Arabic and English names
 * @param {string} name_ar - Arabic name
 * @param {string} name_en - English name
 * @returns {string} - URL-safe identifier
 */
function makeId(name_ar, name_en) {
    // Use English name for ID, fallback to Arabic if no English
    const baseName = name_en || name_ar;
    return baseName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract journalist role from notes
 * @param {string} notes - Raw notes text
 * @returns {string|null} - Extracted role or null
 */
function extractRole(notes) {
    if (!notes) return null;
    
    const text = notes.toLowerCase();
    
    // Priority order - more specific first
    if (/photo\s*journalist|cameraperson|camera\s*operator|photographer/i.test(text)) {
        return 'photojournalist';
    }
    if (/presenter|anchor|broadcaster|announcer/i.test(text)) {
        return 'presenter';
    }
    if (/editor|editor\s*in\s*chief|managing\s*editor/i.test(text)) {
        return 'editor';
    }
    if (/director|manager|administrative/i.test(text)) {
        return 'media_worker';
    }
    if (/journalist|reporter|correspondent|stringer/i.test(text)) {
        return 'journalist';
    }
    if (/media\s*worker|media\s*professional|freelance/i.test(text)) {
        return 'media_worker';
    }
    
    return null;
}

/**
 * Extract media outlets from notes
 * @param {string} notes - Raw notes text
 * @returns {string[]} - Array of outlet names
 */
function extractOutlets(notes) {
    if (!notes) return [];
    
    const outlets = [];
    const text = notes;
    
    // Known major outlets with exact matching
    const knownOutlets = [
        'Al Jazeera',
        'Al-Quds TV', 
        'Palestine TV',
        'Al-Aqsa TV',
        'Al Manara',
        'Sowt Al-Asra',
        'Ain Media',
        'Smart Media',
        'Khabar',
        'Al-Khamsa',
        'Palestine Today',
        'Al-Saftawi',
        'HQ News',
        'Safa',
        'TRT Arabia',
        'Shorouk News',
        'Anadolu',
        'The Guardian',
        'BBC',
        'UNESCO',
        'MADA',
        'JSC',
        'SKeyes',
        'Wafa',
        'AlWatan Voice',
        'The Independent',
        'The New Arab',
        'Legal Agenda',
        'Fourth Authority',
        'Palestinian Media Assembly',
        'Women Journalists Committee',
        'Palestinian Journalists Syndicate',
        'Palestinian Press Agency',
        'International Middle East Media Center'
    ];
    
    // Check for known outlets first
    knownOutlets.forEach(outlet => {
        if (text.includes(outlet) && !outlets.includes(outlet)) {
            outlets.push(outlet);
        }
    });
    
    // Look for "journalist for X" or "working for X" patterns
    const workingForPattern = /(?:journalist|reporter|photographer|working)\s+(?:for|at)\s+([^,\.]+?)(?:\s+(?:news\s+agency|radio|tv|channel|website|newspaper|media|agency))?/gi;
    const matches = text.matchAll(workingForPattern);
    
    for (const match of matches) {
        const outlet = match[1]?.trim();
        if (outlet && outlet.length > 3 && outlet.length < 50 && !outlets.includes(outlet)) {
            // Clean up the outlet name
            const cleanOutlet = outlet
                .replace(/^(the\s+|a\s+)/i, '') // Remove leading articles
                .replace(/\s+(news|agency|media|radio|tv|channel|website|newspaper)$/i, '') // Remove common suffixes
                .trim();
            
            if (cleanOutlet.length > 2 && cleanOutlet.length < 40) {
                outlets.push(cleanOutlet);
            }
        }
    }
    
    // Clean and deduplicate
    return [...new Set(outlets.map(o => o.trim()))].filter(o => o.length > 2 && o.length < 40);
}

/**
 * Extract location from notes
 * @param {string} notes - Raw notes text
 * @returns {string|null} - Extracted location or null
 */
function extractLocation(notes) {
    if (!notes) return null;
    
    const text = notes;
    
    // Common Gaza locations
    const locationPatterns = [
        /(?:in|at|near|from)\s+(Gaza\s*City|Gaza\s*Strip|Jabalia|Rafah|Khan\s*Yunis|Deir\s*al\s*Balah|Beit\s*Lahia|Beit\s*Hanoun|Al\s*Saftawi|Sheikh\s*Ijlin|Zeitoun|Rimal|Erez\s*Crossing|Northern\s*Gaza|Southern\s*Gaza|Central\s*Gaza)/gi,
        /(?:Gaza\s*City|Gaza\s*Strip|Jabalia|Rafah|Khan\s*Yunis|Deir\s*al\s*Balah|Beit\s*Lahia|Beit\s*Hanoun|Al\s*Saftawi|Sheikh\s*Ijlin|Zeitoun|Rimal|Erez\s*Crossing|Northern\s*Gaza|Southern\s*Gaza|Central\s*Gaza)/gi
    ];
    
    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) {
            return match[0].trim();
        }
    }
    
    return null;
}

/**
 * Extract circumstance of death from notes
 * @param {string} notes - Raw notes text
 * @returns {string|null} - Extracted circumstance or null
 */
function extractCircumstance(notes) {
    if (!notes) return null;
    
    const text = notes.toLowerCase();
    
    // Priority order - more specific first
    if (/airstrike\s+(?:on|at)\s+(?:his|her|the\s+)?home|strike\s+(?:on|at)\s+(?:his|her|the\s+)?home/i.test(text)) {
        return 'airstrike_on_home';
    }
    if (/airstrike\s+(?:on|at)\s+(?:his|her|the\s+)?house|strike\s+(?:on|at)\s+(?:his|her|the\s+)?house/i.test(text)) {
        return 'airstrike_on_home';
    }
    if (/drone\s*strike/i.test(text)) {
        return 'drone_strike';
    }
    if (/killed\s+while\s+covering|while\s+covering|covering\s+the\s+conflict/i.test(text)) {
        return 'killed_while_covering';
    }
    if (/siege\s+of\s+.*hospital|storming\s+.*hospital/i.test(text)) {
        return 'siege_hospital';
    }
    if (/airstrike|strike|missile\s*strike/i.test(text)) {
        return 'airstrike_other';
    }
    if (/shot|gunfire|bullet/i.test(text)) {
        return 'gunfire';
    }
    
    return 'unknown';
}

/**
 * Extract family member count killed with them
 * @param {string} notes - Raw notes text
 * @returns {number|null} - Number of family members or null
 */
function extractFamilyCount(notes) {
    if (!notes) return null;
    
    const text = notes.toLowerCase();
    
    // Patterns for family members killed
    const patterns = [
        /(?:killed\s+)?along\s+with\s+(\d{1,3})\s+(?:members?\s+of\s+)?(?:his|her|the\s+)?family/i,
        /(?:killed\s+)?with\s+(\d{1,3})\s+(?:members?\s+of\s+)?(?:his|her|the\s+)?family/i,
        /(?:his|her)\s+(\d{1,3})\s+(?:family\s+)?members?\s+(?:were\s+)?killed/i,
        /(\d{1,3})\s+(?:family\s+)?members?\s+(?:were\s+)?killed/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const count = parseInt(match[1]);
            if (count > 0 && count < 100) {
                return count;
            }
        }
    }
    
    return null;
}

/**
 * Extract URLs/sources from notes
 * @param {string} notes - Raw notes text
 * @returns {string[]} - Array of URLs
 */
function extractSources(notes) {
    if (!notes) return [];
    
    const urlPattern = /https?:\/\/[^\s,\.]+/gi;
    const matches = notes.match(urlPattern);
    
    return matches ? matches.map(url => url.trim()) : [];
}

/**
 * Normalize raw press data into structured format
 * @param {Object} rawRecord - Raw record from press_killed_in_gaza.json
 * @returns {Object} - Normalized PressPerson object
 */
function normalizePress(rawRecord) {
    const { name, name_en, notes } = rawRecord;
    
    return {
        id: makeId(name, name_en),
        name_ar: name || '',
        name_en: name_en || '',
        role: extractRole(notes),
        outlet: extractOutlets(notes),
        organization: [], // Will be populated if we find umbrella orgs
        location: extractLocation(notes),
        date: null, // Will be populated later if we have date data
        circumstance: extractCircumstance(notes),
        family_killed_count: extractFamilyCount(notes),
        notes: notes || '',
        sources: extractSources(notes)
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        makeId,
        extractRole,
        extractOutlets,
        extractLocation,
        extractCircumstance,
        extractFamilyCount,
        extractSources,
        normalizePress
    };
} 