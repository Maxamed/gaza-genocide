/**
 * Memorial Context Helper Functions
 * Provides contextual information for memorial wall display
 */

let lifeContextMap = null;

/**
 * Load the life context mapping data
 */
async function loadLifeContextMap() {
    try {
        const response = await fetch('./data/life_context_map.json');
        lifeContextMap = await response.json();
        console.log('✅ Life context map loaded successfully');
        return lifeContextMap;
    } catch (error) {
        console.error('❌ Error loading life context map:', error);
        return null;
    }
}

/**
 * Get school year context for children (0-17 years)
 */
function getSchoolYearContext(age) {
    if (!lifeContextMap || age >= 18) return null;
    
    const schoolYear = lifeContextMap.school_years.find(grade => 
        age >= grade.min && age <= grade.max
    );
    
    if (!schoolYear) return null;
    
    return {
        grade: schoolYear,
        context_en: schoolYear.context_en,
        context_ar: schoolYear.context_ar
    };
}

/**
 * Get life stage context for adults (18+ years)
 */
function getLifeStageContext(age) {
    if (!lifeContextMap || age < 18) return null;
    
    const lifeStage = lifeContextMap.life_stages.find(stage => 
        age >= stage.min && age <= stage.max
    );
    
    if (!lifeStage) return null;
    
    return {
        stage: lifeStage,
        context_en: lifeStage.context_en,
        context_ar: lifeStage.context_ar
    };
}

/**
 * Get seasonal context from birth month
 */
function getSeasonalContext(birthMonth) {
    if (!lifeContextMap) return null;
    
    const season = lifeContextMap.seasons.find(s => 
        s.months.includes(birthMonth)
    );
    
    if (!season) return null;
    
    return {
        season: season,
        context_en: season.context_en,
        context_ar: season.context_ar
    };
}

/**
 * Calculate life duration in days
 */
function calculateLifeDuration(dob, dateOfDeath) {
    try {
        const birthDate = new Date(dob);
        const deathDate = new Date(dateOfDeath);
        
        if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
            return null;
        }
        
        const timeDiff = deathDate.getTime() - birthDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return daysDiff;
    } catch (error) {
        console.error('Error calculating life duration:', error);
        return null;
    }
}

/**
 * Format birthday context
 */
function getBirthdayContext(dob, dateOfDeath, language = 'en') {
    try {
        const birthDate = new Date(dob);
        const deathDate = new Date(dateOfDeath);
        
        if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
            return null;
        }
        
        const birthMonth = birthDate.getMonth() + 1; // JavaScript months are 0-indexed
        const birthDay = birthDate.getDate();
        
        // Calculate age at death
        const ageAtDeath = deathDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = deathDate.getMonth() - birthDate.getMonth();
        
        let actualAge = ageAtDeath;
        if (monthDiff < 0 || (monthDiff === 0 && deathDate.getDate() < birthDay)) {
            actualAge--;
        }
        
        // Calculate next birthday
        const nextBirthday = new Date(deathDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < deathDate) {
            nextBirthday.setFullYear(deathDate.getFullYear() + 1);
        }
        
        const daysUntilNextBirthday = Math.ceil((nextBirthday.getTime() - deathDate.getTime()) / (1000 * 3600 * 24));
        
        if (language === 'ar') {
            return {
                age: actualAge,
                next_birthday: `${birthDay} ${getArabicMonthName(birthMonth)}`,
                days_until: daysUntilNextBirthday,
                context: `كان سيكون عمره ${actualAge} سنة، عيد ميلاده القادم ${birthDay} ${getArabicMonthName(birthMonth)}`
            };
        } else {
            return {
                age: actualAge,
                next_birthday: `${getEnglishMonthName(birthMonth)} ${birthDay}`,
                days_until: daysUntilNextBirthday,
                context: `Would have been ${actualAge} years old, next birthday ${getEnglishMonthName(birthMonth)} ${birthDay}`
            };
        }
    } catch (error) {
        console.error('Error formatting birthday context:', error);
        return null;
    }
}

/**
 * Get comprehensive life context for a person
 */
function getPersonLifeContext(person, language = 'en') {
    if (!lifeContextMap) return null;
    
    const context = {
        name: language === 'ar' ? person.name : person.en_name,
        age: person.age,
        gender: person.sex,
        language: language
    };
    
    // School year context (for children)
    if (person.age < 18) {
        const schoolContext = getSchoolYearContext(person.age);
        if (schoolContext) {
            context.school_context = schoolContext;
        }
    }
    
    // Life stage context (for adults)
    if (person.age >= 18) {
        const lifeStageContext = getLifeStageContext(person.age);
        if (lifeStageContext) {
            context.life_stage = lifeStageContext;
        }
    }
    
    // Seasonal context
    if (person.dob) {
        const birthDate = new Date(person.dob);
        if (!isNaN(birthDate.getTime())) {
            const birthMonth = birthDate.getMonth() + 1;
            const seasonalContext = getSeasonalContext(birthMonth);
            if (seasonalContext) {
                context.seasonal = seasonalContext;
            }
        }
    }
    
    // Birthday context
    if (person.dob) {
        // For now, use current date as death date since we don't have it
        // In real implementation, this would come from the casualty data
        const currentDate = new Date();
        const birthdayContext = getBirthdayContext(person.dob, currentDate, language);
        if (birthdayContext) {
            context.birthday = birthdayContext;
        }
    }
    
    return context;
}

/**
 * Helper function to get English month names
 */
function getEnglishMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
}

/**
 * Helper function to get Arabic month names
 */
function getArabicMonthName(month) {
    const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[month - 1] || '';
}

/**
 * Format memorial card text
 */
function formatMemorialText(personContext, language = 'en') {
    if (!personContext) return '';
    
    const parts = [];
    
    // Name and age
    parts.push(`${personContext.name}, ${personContext.age} years old`);
    
    // School context (children)
    if (personContext.school_context) {
        parts.push(personContext.school_context.context_en);
    }
    
    // Life stage context (adults)
    if (personContext.life_stage) {
        parts.push(personContext.life_stage.context_en);
    }
    
    // Seasonal context
    if (personContext.seasonal) {
        parts.push(personContext.seasonal.context_en);
    }
    
    // Birthday context
    if (personContext.birthday) {
        parts.push(personContext.birthday.context);
    }
    
    return parts.join('. ');
}

/**
 * Initialize the memorial context system
 */
async function initializeMemorialContext() {
    await loadLifeContextMap();
    console.log('🎯 Memorial context system initialized');
}

// Export functions for use in other modules
window.memorialContext = {
    loadLifeContextMap,
    getSchoolYearContext,
    getLifeStageContext,
    getSeasonalContext,
    calculateLifeDuration,
    getBirthdayContext,
    getPersonLifeContext,
    formatMemorialText,
    initializeMemorialContext
}; 