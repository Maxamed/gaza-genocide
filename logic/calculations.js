/**
 * Calculations - Math operations and data transforms
 */

class Calculations {
    constructor() {
        this.warStartDate = new Date('2023-10-07');
    }

    /**
     * Calculate days since war began
     */
    getDaysSinceWar() {
        const today = new Date();
        const diffTime = Math.abs(today - this.warStartDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Calculate average daily casualties
     */
    calculateDailyAverage(totalCasualties, daysSinceStart) {
        if (daysSinceStart <= 0) return 0;
        return Math.round(totalCasualties / daysSinceStart);
    }

    /**
     * Calculate percentage of total
     */
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return (value / total) * 100;
    }

    /**
     * Find the worst day in casualty data
     */
    findWorstDay(casualtyData) {
        if (!casualtyData || !casualtyData.length) return null;

        let worstDay = null;
        let maxCasualties = 0;

        casualtyData.forEach(day => {
            if (day.killed > maxCasualties) {
                maxCasualties = day.killed;
                worstDay = {
                    date: day.report_date,
                    killed: day.killed,
                    injured: day.injured || 0
                };
            }
        });

        return worstDay;
    }

    /**
     * Calculate moving average for smoothing data
     */
    calculateMovingAverage(data, windowSize = 7) {
        if (!data || data.length < windowSize) return data;

        const result = [];
        
        for (let i = 0; i < data.length; i++) {
            if (i < windowSize - 1) {
                result.push(data[i]);
            } else {
                const sum = data.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0);
                result.push(Math.round(sum / windowSize));
            }
        }

        return result;
    }

    /**
     * Calculate trend direction and slope
     */
    calculateTrend(data, days = 30) {
        if (!data || data.length < days) return { direction: 'stable', slope: 0 };

        const recentData = data.slice(-days);
        const xValues = Array.from({ length: days }, (_, i) => i);
        const yValues = recentData.map(d => d.killed || 0);

        // Simple linear regression
        const n = days;
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((a, b, i) => a + (b * yValues[i]), 0);
        const sumXX = xValues.reduce((a, b) => a + (b * b), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        let direction = 'stable';
        if (slope > 0.5) direction = 'increasing';
        else if (slope < -0.5) direction = 'decreasing';

        return { direction, slope: Math.round(slope * 100) / 100 };
    }

    /**
     * Calculate cumulative totals from daily data
     */
    calculateCumulative(dailyData, field = 'killed') {
        if (!dailyData || !dailyData.length) return [];

        let cumulative = 0;
        return dailyData.map(day => {
            cumulative += day[field] || 0;
            return {
                ...day,
                [`${field}_cum`]: cumulative
            };
        });
    }

    /**
     * Find peaks in data (days with significantly higher casualties)
     */
    findPeaks(data, threshold = 2) {
        if (!data || data.length < 3) return [];

        const peaks = [];
        const average = data.reduce((sum, day) => sum + (day.killed || 0), 0) / data.length;

        data.forEach((day, index) => {
            if (day.killed > average * threshold) {
                peaks.push({
                    date: day.report_date,
                    killed: day.killed,
                    average: Math.round(average),
                    multiplier: Math.round((day.killed / average) * 10) / 10
                });
            }
        });

        return peaks.sort((a, b) => b.killed - a.killed);
    }

    /**
     * Calculate rate of change between two periods
     */
    calculateRateOfChange(currentPeriod, previousPeriod) {
        if (previousPeriod === 0) return 0;
        return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
    }

    /**
     * Group data by time periods (weekly, monthly)
     */
    groupByPeriod(data, period = 'weekly') {
        if (!data || !data.length) return [];

        const grouped = {};
        
        data.forEach(day => {
            const date = new Date(day.report_date);
            let key;
            
            if (period === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else if (period === 'monthly') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!grouped[key]) {
                grouped[key] = {
                    period: key,
                    killed: 0,
                    injured: 0,
                    days: 0
                };
            }

            grouped[key].killed += day.killed || 0;
            grouped[key].injured += day.injured || 0;
            grouped[key].days += 1;
        });

        return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    }

    /**
     * Calculate correlation between two datasets
     */
    calculateCorrelation(data1, data2) {
        if (!data1 || !data2 || data1.length !== data2.length) return 0;

        const n = data1.length;
        const sum1 = data1.reduce((a, b) => a + b, 0);
        const sum2 = data2.reduce((a, b) => a + b, 0);
        const sum1Sq = data1.reduce((a, b) => a + b * b, 0);
        const sum2Sq = data2.reduce((a, b) => a + b * b, 0);
        const sum12 = data1.reduce((a, b, i) => a + b * data2[i], 0);

        const numerator = n * sum12 - sum1 * sum2;
        const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    /**
     * Round number to appropriate precision
     */
    roundToPrecision(num, precision = 0) {
        const multiplier = Math.pow(10, precision);
        return Math.round(num * multiplier) / multiplier;
    }

    /**
     * Format large numbers with appropriate units
     */
    formatLargeNumber(num) {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculations;
} else {
    // Browser environment
    window.Calculations = Calculations;
} 