/**
 * Heat Map Data Processor
 * Handles sophisticated data processing for the 31×23 grid visualization
 */

class HeatmapDataProcessor {
    constructor() {
        this.rawData = null;
        this.byDate = new Map();
        this.months = [];
        this.gridData = null;
        this.currentMetric = 'all';
        this.isInitialized = false;
    }

    /**
     * Initialize the heat map data processor
     */
    async init() {
        try {
            console.log('🚀 Initializing HeatmapDataProcessor...');
            
            await this.loadData();
            this.processData();
            this.buildGridData();
            
            this.isInitialized = true;
            console.log('✅ HeatmapDataProcessor initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize HeatmapDataProcessor:', error);
            return false;
        }
    }

    /**
     * Load raw data from JSON files
     */
    async loadData() {
        try {
            console.log('🔄 Loading casualties data...');
            const response = await fetch('./data/casualties_daily.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.rawData = await response.json();
            console.log(`📊 Loaded ${this.rawData.length} daily records`);
            console.log('🔍 First record:', this.rawData[0]);
            console.log('🔍 Sample dates:', this.rawData.slice(0, 5).map(r => r.report_date));
        } catch (error) {
            console.error('❌ Failed to load casualties data:', error);
            throw error;
        }
    }

    /**
     * Process raw data into organized structure
     */
    processData() {
        if (!this.rawData) {
            throw new Error('No raw data available for processing');
        }

        // Parse and sort by report_date ascending
        const sortedData = [...this.rawData].sort((a, b) => 
            new Date(a.report_date) - new Date(b.report_date)
        );

        // Build byDate lookup map
        this.byDate.clear();
        let previousCumulative = 0;

        for (const record of sortedData) {
            const date = record.report_date;
            
            // Get daily killed count
            let killed = record.killed;
            let corrected = false;
            
            // If daily killed is missing, derive from cumulative
            if (killed === undefined || killed === null) {
                const currentCumulative = record.killed_cum || 0;
                killed = Math.max(0, currentCumulative - previousCumulative);
                corrected = true;
                previousCumulative = currentCumulative;
            } else {
                previousCumulative = (record.killed_cum || 0);
            }

            // Store in lookup map
            this.byDate.set(date, {
                killed: killed,
                killed_cum: record.killed_cum,
                ext_killed_cum: record.ext_killed_cum,
                killed_children_cum: record.killed_children_cum,
                killed_women_cum: record.killed_women_cum,
                ext_med_killed_cum: record.ext_med_killed_cum,
                ext_press_killed_cum: record.ext_press_killed_cum,
                corrected: corrected,
                source: record.report_source
            });
        }

        // Build ordered months array
        this.buildMonthsArray();
        
        console.log(`✅ Processed ${this.byDate.size} date records`);
        console.log(`📅 Generated ${this.months.length} months`);
        
        // Debug: show first few dates
        console.log('🔍 First 5 dates in data:', Array.from(this.byDate.keys()).slice(0, 5));
        console.log('🔍 Sample data entry:', Array.from(this.byDate.entries())[0]);
    }

    /**
     * Build ordered months array from Oct 2023 to Sep 2025
     */
    buildMonthsArray() {
        this.months = [];
        const startDate = new Date('2023-10-01');
        const endDate = new Date('2025-09-01');
        
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            
            this.months.push({
                key: monthKey,
                year: year,
                month: month,
                monthName: currentDate.toLocaleDateString('en-US', { month: 'short' }),
                monthNameAr: currentDate.toLocaleDateString('ar-EG', { month: 'short' }),
                daysInMonth: new Date(year, month, 0).getDate()
            });
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        console.log('🔍 First 5 months:', this.months.slice(0, 5));
        console.log('🔍 Sample month key:', this.months[0]?.key);
    }

    /**
     * Build grid data for the 31×23 heat map
     */
    buildGridData() {
        if (!this.byDate.size || !this.months.length) {
            throw new Error('Data not yet processed');
        }

        const grid = [];
        
        // For each day 1-31
        for (let day = 1; day <= 31; day++) {
            const row = [];
            
            // For each month
            for (const month of this.months) {
                const cell = this.createCell(day, month);
                row.push(cell);
            }
            
            grid.push(row);
        }
        
        this.gridData = grid;
        console.log(`✅ Built ${grid.length}×${grid[0].length} grid`);
    }

    /**
     * Create a single cell for the grid
     */
    createCell(day, month) {
        // Check if this day exists in this month
        if (day > month.daysInMonth) {
            return {
                type: 'nonexistent',
                value: null,
                corrected: false,
                date: null
            };
        }

        // Form the date string
        const dateStr = `${month.key}-${day.toString().padStart(2, '0')}`;
        const dateData = this.byDate.get(dateStr);

        if (!dateData) {
            return {
                type: 'missing',
                value: null,
                corrected: false,
                date: dateStr
            };
        }

        // Get value for current metric
        const value = this.getValueForMetric(dateData, dateStr);
        
        return {
            type: 'present',
            value: value.value,
            corrected: value.corrected,
            date: dateStr,
            source: dateData.source
        };
    }

    /**
     * Get value for specific metric
     */
    getValueForMetric(dateData, dateStr) {
        let value = 0;
        let corrected = dateData.corrected;

        switch (this.currentMetric) {
            case 'all':
                value = dateData.killed;
                break;
            case 'children':
                value = this.getDailyFromCumulative(dateData.killed_children_cum, dateStr);
                break;
            case 'women':
                value = this.getDailyFromCumulative(dateData.killed_women_cum, dateStr);
                break;
            case 'medical':
                value = this.getDailyFromCumulative(dateData.ext_med_killed_cum, dateStr);
                break;
            case 'press':
                value = this.getDailyFromCumulative(dateData.ext_press_killed_cum, dateStr);
                break;
            default:
                value = dateData.killed;
        }

        return { value: value || 0, corrected };
    }

    /**
     * Get daily count from cumulative data
     */
    getDailyFromCumulative(cumulative, dateStr) {
        if (cumulative === undefined || cumulative === null) return 0;
        
        // Find previous day's cumulative
        const currentDate = new Date(dateStr);
        const previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousDateStr = previousDate.toISOString().split('T')[0];
        
        const previousData = this.byDate.get(previousDateStr);
        const previousCumulative = previousData ? previousData.killed_cum : 0;
        
        return Math.max(0, cumulative - previousCumulative);
    }

    /**
     * Update metric and rebuild grid
     */
    updateMetric(metric) {
        this.currentMetric = metric;
        this.buildGridData();
        console.log(`📊 Metric updated to: ${metric}`);
    }

    /**
     * Get grid data
     */
    getGridData() {
        return this.gridData;
    }

    /**
     * Get months array
     */
    getMonths() {
        return this.months;
    }

    /**
     * Get statistics for scaling
     */
    getStats() {
        if (!this.gridData) return null;

        const values = [];
        for (const row of this.gridData) {
            for (const cell of row) {
                if (cell.type === 'present' && cell.value > 0) {
                    values.push(cell.value);
                }
            }
        }

        if (values.length === 0) return null;

        values.sort((a, b) => a - b);
        const minPositive = Math.min(...values.filter(v => v > 0));
        const p95 = values[Math.floor(values.length * 0.95)];

        return {
            minPositive,
            p95,
            total: values.length
        };
    }

    /**
     * Get cell data for specific date
     */
    getCellData(dateStr) {
        const data = this.byDate.get(dateStr);
        return data;
    }

    /**
     * Get peak days (top casualty days)
     */
    getPeaks() {
        if (!this.byDate.size) return [];
        
        const peaks = [];
        for (const [date, data] of this.byDate) {
            if (data.killed > 0) {
                peaks.push({
                    date: date,
                    killed: data.killed,
                    corrected: data.corrected,
                    source: data.source
                });
            }
        }
        
        // Sort by killed count (descending)
        peaks.sort((a, b) => b.killed - a.killed);
        
        // Return top 20 for variety
        return peaks.slice(0, 20);
    }

    /**
     * Get annotation for a specific date
     */
    getAnnotation(dateStr) {
        if (!this.annotations) return null;
        
        const annotation = this.annotations.find(a => a.date === dateStr);
        return annotation || null;
    }

    /**
     * Get KPIs for display
     */
    getKPIs() {
        if (!this.summaryData || !this.byDate.size) {
            return {
                total: 0,
                today: 0,
                week: 0,
                month: 0,
                lastUpdate: '-',
                daysSinceUpdate: 0
            };
        }

        // Get latest date from byDate
        const dates = Array.from(this.byDate.keys()).sort();
        const latestDate = dates[dates.length - 1];
        
        // Calculate recent totals
        const today = this.byDate.get(latestDate)?.killed || 0;
        
        // Calculate week total (last 7 days)
        let weekTotal = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date(latestDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const data = this.byDate.get(dateStr);
            if (data) {
                weekTotal += data.killed || 0;
            }
        }
        
        // Calculate month total (last 30 days)
        let monthTotal = 0;
        for (let i = 0; i < 30; i++) {
            const date = new Date(latestDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const data = this.byDate.get(dateStr);
            if (data) {
                monthTotal += data.killed || 0;
            }
        }

        return {
            total: this.summaryData.gaza?.total || 0,
            today: today,
            week: weekTotal,
            month: monthTotal,
            lastUpdate: this.summaryData.gaza?.lastUpdate || '-',
            daysSinceUpdate: this.summaryData.gaza?.daysSinceUpdate || 0
        };
    }

    /**
     * Get current state
     */
    getState() {
        return {
            metric: this.currentMetric,
            source: 'official' // Default source
        };
    }

    /**
     * Test method to check if data is loaded
     */
    testData() {
        console.log('🧪 Testing data processor...');
        console.log('📊 Raw data length:', this.rawData?.length || 0);
        console.log('🗓️ ByDate size:', this.byDate.size);
        console.log('📅 Months length:', this.months.length);
        console.log('🔍 Sample byDate keys:', Array.from(this.byDate.keys()).slice(0, 5));
        console.log('🔍 Sample months:', this.months.slice(0, 5));
        
        // Test a specific date
        const testDate = '2023-10-07';
        const testData = this.byDate.get(testDate);
        console.log(`🔍 Test date ${testDate}:`, testData);
        
        return {
            rawDataLength: this.rawData?.length || 0,
            byDateSize: this.byDate.size,
            monthsLength: this.months.length,
            testDateData: testData
        };
    }
}

// Export for use in other modules
window.HeatmapDataProcessor = HeatmapDataProcessor; 