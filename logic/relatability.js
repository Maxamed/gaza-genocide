/**
 * Relatability Engine - Core benchmark comparison system
 * Transforms abstract numbers into relatable human experiences
 */

class RelatabilityEngine {
    constructor() {
        this.benchmarks = [];
        this.cache = new Map();
    }

    /**
     * Load benchmarks from JSON file
     */
    async loadBenchmarks() {
        try {
            const response = await fetch('./data/benchmarks.json');
            this.benchmarks = await response.json();
            console.log(`Loaded ${this.benchmarks.length} benchmarks`);
        } catch (error) {
            console.error('Failed to load benchmarks:', error);
            this.benchmarks = [];
        }
    }

    /**
     * Find the best benchmark comparison for a given number
     * @param {number} casualtyNumber - The casualty number to compare
     * @param {string} category - Optional category filter
     * @param {string} scale - 'daily' or 'cumulative'
     * @returns {Object} Best benchmark comparison
     */
    findBestComparison(casualtyNumber, category = null, scale = 'cumulative') {
        if (!this.benchmarks.length) {
            console.warn('No benchmarks loaded yet');
            return null;
        }
        
        console.log(`Finding best comparison for ${casualtyNumber}, category: ${category}, scale: ${scale}`);
        console.log(`Available benchmarks: ${this.benchmarks.length}`);

        let filteredBenchmarks = this.benchmarks;

        // Filter by category if specified
        if (category) {
            filteredBenchmarks = this.benchmarks.filter(b => b.category === category);
            console.log(`After category filter (${category}): ${filteredBenchmarks.length} benchmarks`);
        }

        // Filter by scale (daily vs cumulative)
        if (scale === 'daily') {
            // For daily numbers, prefer smaller benchmarks
            filteredBenchmarks = filteredBenchmarks.filter(b => 
                b.value <= 2000 && ['transport', 'education'].includes(b.category)
            );
            console.log(`After daily scale filter: ${filteredBenchmarks.length} benchmarks`);
        } else {
            // For cumulative numbers, prefer larger benchmarks
            filteredBenchmarks = filteredBenchmarks.filter(b => 
                b.value >= 1000 && ['cities', 'venues', 'transport'].includes(b.category)
            );
            console.log(`After cumulative scale filter: ${filteredBenchmarks.length} benchmarks`);
        }
        
        console.log('Available categories:', [...new Set(this.benchmarks.map(b => b.category))]);
        console.log('Filtered benchmarks:', filteredBenchmarks.map(b => ({ id: b.id, category: b.category, value: b.value })));

        // Calculate equivalents and find best fit
        let bestBenchmark = null;
        let bestScore = 0;

        filteredBenchmarks.forEach(benchmark => {
            const equivalent = casualtyNumber / benchmark.value;
            
            // Consider both cases: casualty >= benchmark (equivalent >= 1) and casualty < benchmark (equivalent < 1)
            if (equivalent >= 1) {
                // Casualty number is larger than benchmark (e.g., 63,633 vs 50,000 stadium)
                const wholeNumber = Math.round(equivalent);
                const score = 1 / Math.abs(equivalent - wholeNumber);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestBenchmark = {
                        ...benchmark,
                        equivalent: wholeNumber,
                        exactEquivalent: equivalent,
                        comparisonType: 'multiple'
                    };
                }
            } else if (equivalent > 0.1) {
                // Casualty number is smaller than benchmark but still significant (e.g., 63,633 vs 145,000 Cambridge)
                const percentage = Math.round(equivalent * 100);
                const score = equivalent; // Higher score for closer to 1
                
                if (score > bestScore) {
                    bestScore = score;
                    bestBenchmark = {
                        ...benchmark,
                        equivalent: percentage,
                        exactEquivalent: equivalent,
                        comparisonType: 'percentage'
                    };
                }
            }
        });

        return bestBenchmark;
    }

    /**
     * Generate a human-readable comparison string
     * @param {Object} comparison - The benchmark comparison object
     * @param {number} casualtyNumber - Original casualty number
     * @returns {string} Formatted comparison string
     */
    formatComparison(comparison, casualtyNumber) {
        if (!comparison) return '';

        const { label, equivalent, unit, context } = comparison;
        
        // Format based on unit type
        if (unit === 'children') {
            return `${casualtyNumber.toLocaleString()} killed = ${equivalent} ${label}s full of children`;
        } else if (unit === 'people') {
            return `${casualtyNumber.toLocaleString()} killed = ${equivalent} ${label}s worth of people`;
        } else if (unit === 'passengers') {
            return `${casualtyNumber.toLocaleString()} killed = ${equivalent} ${label}s full of passengers`;
        } else if (unit === 'seats') {
            return `${casualtyNumber.toLocaleString()} killed = ${equivalent} ${label}s full of people`;
        } else if (unit === 'deaths') {
            return `${casualtyNumber.toLocaleString()} killed = ${equivalent} ${label}s worth of deaths`;
        } else {
            return `${casualtyNumber.toLocaleString()} killed = ${equivalent} ${label}s`;
        }
    }

    /**
     * Get multiple comparisons for a number
     * @param {number} casualtyNumber - The casualty number
     * @param {number} count - Number of comparisons to return
     * @returns {Array} Array of comparison objects
     */
    getMultipleComparisons(casualtyNumber, count = 3) {
        const comparisons = [];
        const usedCategories = new Set();

        // Get best comparison for each category
        const categories = ['education', 'transport', 'cities', 'historic_events'];
        
        categories.forEach(category => {
            if (comparisons.length < count) {
                const comparison = this.findBestComparison(casualtyNumber, category);
                if (comparison && !usedCategories.has(category)) {
                    comparisons.push(comparison);
                    usedCategories.add(category);
                }
            }
        });

        return comparisons.slice(0, count);
    }

    /**
     * Get a random comparison for variety
     * @param {number} casualtyNumber - The casualty number
     * @returns {Object} Random benchmark comparison
     */
    getRandomComparison(casualtyNumber) {
        console.log(`Getting random comparison for ${casualtyNumber}`);
        console.log(`Total benchmarks: ${this.benchmarks.length}`);
        
        const validBenchmarks = this.benchmarks.filter(b => 
            casualtyNumber / b.value >= 1
        );
        
        console.log(`Valid benchmarks: ${validBenchmarks.length}`);
        
        if (validBenchmarks.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * validBenchmarks.length);
        const benchmark = validBenchmarks[randomIndex];
        
        console.log(`Selected benchmark:`, benchmark);
        
        const equivalent = casualtyNumber / benchmark.value;
        let comparisonType, finalEquivalent;
        
        if (equivalent >= 1) {
            comparisonType = 'multiple';
            finalEquivalent = Math.round(equivalent);
        } else if (equivalent > 0.1) {
            comparisonType = 'percentage';
            finalEquivalent = Math.round(equivalent * 100);
        } else {
            comparisonType = 'percentage';
            finalEquivalent = Math.round(equivalent * 100);
        }
        
        return {
            ...benchmark,
            equivalent: finalEquivalent,
            exactEquivalent: equivalent,
            comparisonType: comparisonType
        };
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RelatabilityEngine;
} else {
    // Browser environment
    window.RelatabilityEngine = RelatabilityEngine;
} 