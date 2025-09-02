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
            // For daily numbers, prefer smaller benchmarks but don't restrict categories
            filteredBenchmarks = filteredBenchmarks.filter(b => b.value <= 5000);
            console.log(`After daily scale filter: ${filteredBenchmarks.length} benchmarks`);
        } else {
            // For cumulative numbers, use ALL benchmarks - don't restrict categories
            console.log(`Using all ${filteredBenchmarks.length} benchmarks for cumulative comparison`);
        }
        
        console.log('=== BENCHMARK DEBUG INFO ===');
        console.log('Available categories:', [...new Set(this.benchmarks.map(b => b.category))]);
        console.log('Total benchmarks available:', this.benchmarks.length);
        console.log('Benchmarks being considered:', filteredBenchmarks.length);
        console.log('All benchmark values:', this.benchmarks.map(b => b.value).sort((a, b) => a - b));
        console.log('Sample benchmarks:', filteredBenchmarks.slice(0, 5).map(b => ({ id: b.id, category: b.category, value: b.value })));
        console.log('============================');

        // Calculate equivalents and find best fit
        let bestBenchmark = null;
        let bestScore = 0;

        filteredBenchmarks.forEach(benchmark => {
            const equivalent = casualtyNumber / benchmark.value;
            
            // Score benchmarks - skip those that would give very small percentages
            let score = 0;
            
            if (equivalent >= 1) {
                // Casualty number is larger than benchmark (e.g., 63,633 vs 50,000 stadium)
                const wholeNumber = Math.round(equivalent);
                score = 1 / Math.abs(equivalent - wholeNumber);
            } else if (equivalent > 0.05) { // Only include benchmarks that give at least 5%
                // Casualty number is smaller than benchmark (e.g., 63,633 vs 145,000 Cambridge)
                score = equivalent; // Higher score for closer to 1
            } else {
                // Skip benchmarks that would give very small percentages
                return; // Use return instead of continue in forEach
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestBenchmark = {
                    ...benchmark,
                    equivalent: equivalent >= 1 ? Math.round(equivalent) : Math.max(1, Math.round(equivalent * 100)),
                    exactEquivalent: equivalent,
                    comparisonType: equivalent >= 1 ? 'multiple' : 'percentage'
                };
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
        
        // Use ALL benchmarks, not just specific categories
        const allBenchmarks = [...this.benchmarks];
        
        // Shuffle to get variety
        for (let i = allBenchmarks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allBenchmarks[i], allBenchmarks[j]] = [allBenchmarks[j], allBenchmarks[i]];
        }
        
        // Take the first 'count' benchmarks and find best comparisons
        allBenchmarks.slice(0, count * 2).forEach(benchmark => {
            if (comparisons.length < count) {
                const equivalent = casualtyNumber / benchmark.value;
                if (equivalent > 0.1) { // Only include meaningful comparisons
                    comparisons.push({
                        ...benchmark,
                        equivalent: equivalent >= 1 ? Math.round(equivalent) : Math.max(1, Math.round(equivalent * 100)),
                        exactEquivalent: equivalent,
                        comparisonType: equivalent >= 1 ? 'multiple' : 'percentage'
                    });
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
        
        // Use ALL benchmarks, not just ones where casualty >= benchmark
        const randomIndex = Math.floor(Math.random() * this.benchmarks.length);
        const benchmark = this.benchmarks[randomIndex];
        
        console.log(`Selected benchmark:`, benchmark);
        
        const equivalent = casualtyNumber / benchmark.value;
        const comparisonType = equivalent >= 1 ? 'multiple' : 'percentage';
        const finalEquivalent = equivalent >= 1 ? Math.round(equivalent) : Math.max(1, Math.round(equivalent * 100));
        
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