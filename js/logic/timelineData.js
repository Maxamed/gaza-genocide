/**
 * Timeline Data Preprocessing Module
 * Handles loading, processing, and organizing daily casualties data
 */

class TimelineDataProcessor {
    constructor() {
        this.rawData = null;
        this.processedData = null;
        this.annotations = null;
        this.warStartDate = new Date('2023-10-07');
        this.currentState = {
            metric: 'all',
            source: 'official',
            selectedDay: new Date().getDate(),
            hoveredDate: null,
            pinnedDate: null
        };
    }

    /**
     * Initialize the data processor
     */
    async init() {
        try {
            await this.loadData();
            this.processData();
            this.loadAnnotations();
            console.log('✅ TimelineDataProcessor initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize TimelineDataProcessor:', error);
            return false;
        }
    }

    /**
     * Load raw data from JSON files
     */
    async loadData() {
        try {
            // Load main casualties data
            const response = await fetch('./data/casualties_daily.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.rawData = await response.json();
            console.log(`📊 Loaded ${this.rawData.length} daily records`);
            
            // Load summary data for KPIs
            const summaryResponse = await fetch('./data/summary.json');
            if (summaryResponse.ok) {
                this.summaryData = await summaryResponse.json();
                console.log(`📊 Loaded summary data`);
            } else {
                console.warn('⚠️ Could not load summary data, using fallback');
                this.summaryData = null;
            }
        } catch (error) {
            console.error('❌ Failed to load casualties data:', error);
            throw error;
        }
    }

    /**
     * Load annotations for peak days
     */
    async loadAnnotations() {
        try {
            const response = await fetch('./data/annotations.json');
            if (response.ok) {
                this.annotations = await response.json();
                console.log(`📝 Loaded ${this.annotations.length} annotations`);
            } else {
                // Create default annotations if file doesn't exist
                this.annotations = this.createDefaultAnnotations();
                console.log('📝 Using default annotations');
            }
        } catch (error) {
            this.annotations = this.createDefaultAnnotations();
            console.log('📝 Using default annotations due to error:', error);
        }
    }

    /**
     * Create default annotations for peak days
     */
    createDefaultAnnotations() {
        return [
            {
                "date": "2023-10-13",
                "en": "Mass displacement escalates; heavy strikes across the north.",
                "ar": "تصاعد النزوح الجماعي وسط قصف شديد في الشمال."
            },
            {
                "date": "2023-11-18",
                "en": "Hospitals under siege; reports of strikes near medical facilities.",
                "ar": "حصار مستشفيات وتقارير عن قصف قرب مرافق طبية."
            },
            {
                "date": "2024-01-15",
                "en": "Intense bombardment continues; civilian infrastructure targeted.",
                "ar": "استمرار القصف الشديد؛ استهداف البنية التحتية المدنية."
            },
            {
                "date": "2024-03-13",
                "en": "Hospitals under siege; reports of strikes near medical facilities.",
                "ar": "حصار مستشفيات وتقارير عن قصف قرب مرافق طبية."
            }
        ];
    }

    /**
     * Process raw data into organized structure
     */
    processData() {
        if (!this.rawData) {
            throw new Error('No raw data available for processing');
        }

        const processed = [];
        let previousCumulative = 0;

        for (let i = 0; i < this.rawData.length; i++) {
            const record = this.rawData[i];
            const date = new Date(record.report_date);
            
            // Calculate week of war (0-based)
            const weekOfWar = Math.floor((date - this.warStartDate) / (7 * 24 * 60 * 60 * 1000));
            
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

            // Create processed day object
            const day = {
                date: record.report_date,
                dayOfMonth: date.getDate(),
                weekOfWar: weekOfWar,
                killed: killed,
                corrected: corrected,
                killed_children: record.killed_children_cum,
                killed_women: record.killed_women_cum,
                killed_medical: record.ext_med_killed_cum,
                killed_press: record.ext_press_killed_cum,
                massacres: record.ext_massacres_cum,
                source: 'official',
                // Extended data
                ext_killed: record.ext_killed,
                ext_killed_cum: record.ext_killed_cum,
                ext_killed_children_cum: record.ext_killed_children_cum,
                ext_killed_women_cum: record.ext_killed_women_cum,
                ext_med_killed_cum: record.ext_med_killed_cum,
                ext_press_killed_cum: record.ext_press_killed_cum
            };

            processed.push(day);
        }

        // Sort by date
        processed.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        this.processedData = processed;
        console.log(`✅ Processed ${processed.length} daily records`);
    }

    /**
     * Get data organized by different views
     */
    getOrganizedData() {
        if (!this.processedData) {
            throw new Error('Data not yet processed');
        }

        const byDate = [...this.processedData];
        const byDayOfMonth = new Map();
        const weeklyTotals = this.calculateWeeklyTotals();
        const peaks = this.calculatePeaks();

        // Organize by day of month
        for (const day of this.processedData) {
            const dayOfMonth = day.dayOfMonth;
            if (!byDayOfMonth.has(dayOfMonth)) {
                byDayOfMonth.set(dayOfMonth, []);
            }
            byDayOfMonth.get(dayOfMonth).push(day);
        }

        // Sort each day of month array by date
        for (const [dayOfMonth, days] of byDayOfMonth) {
            days.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        return {
            byDate,
            byDayOfMonth,
            peaks,
            weeklyTotals
        };
    }

    /**
     * Calculate weekly totals
     */
    calculateWeeklyTotals() {
        const weeklyTotals = [];
        const weeklyData = new Map();

        for (const day of this.processedData) {
            const week = day.weekOfWar;
            if (!weeklyData.has(week)) {
                weeklyData.set(week, 0);
            }
            weeklyData.set(week, weeklyData.get(week) + day.killed);
        }

        // Convert to array and sort by week
        for (let week = 0; week <= Math.max(...weeklyData.keys()); week++) {
            weeklyTotals.push(weeklyData.get(week) || 0);
        }

        return weeklyTotals;
    }

    /**
     * Calculate peak days (top 7 by casualties)
     */
    calculatePeaks() {
        if (!this.processedData) return [];

        // Sort by killed count (descending)
        const sorted = [...this.processedData].sort((a, b) => b.killed - a.killed);
        
        // Get top 7, debouncing near-duplicates
        const peaks = [];
        const usedWeeks = new Set();
        
        for (const day of sorted) {
            if (peaks.length >= 7) break;
            
            // Check if we already have a peak from this week (±2 days)
            const week = day.weekOfWar;
            const hasNearby = Array.from(usedWeeks).some(usedWeek => 
                Math.abs(usedWeek - week) <= 2
            );
            
            if (!hasNearby) {
                peaks.push(day);
                usedWeeks.add(week);
            }
        }

        return peaks;
    }

    /**
     * Get data for specific metric and source
     */
    getDataForMetric(metric, source) {
        if (!this.processedData) return [];

        return this.processedData.map(day => {
            let killed = day.killed;
            
            if (source === 'extended') {
                switch (metric) {
                    case 'all':
                        killed = day.ext_killed || day.killed;
                        break;
                    case 'children':
                        killed = this.getDailyFromCumulative(day.ext_killed_children_cum, day.date);
                        break;
                    case 'women':
                        killed = this.getDailyFromCumulative(day.ext_killed_women_cum, day.date);
                        break;
                    case 'medical':
                        killed = this.getDailyFromCumulative(day.ext_med_killed_cum, day.date);
                        break;
                    case 'press':
                        killed = this.getDailyFromCumulative(day.ext_press_killed_cum, day.date);
                        break;
                }
            } else {
                switch (metric) {
                    case 'children':
                        killed = this.getDailyFromCumulative(day.killed_children, day.date);
                        break;
                    case 'women':
                        killed = this.getDailyFromCumulative(day.killed_women, day.date);
                        break;
                    case 'medical':
                        killed = this.getDailyFromCumulative(day.killed_medical, day.date);
                        break;
                    case 'press':
                        killed = this.getDailyFromCumulative(day.killed_press, day.date);
                        break;
                }
            }

            return {
                ...day,
                killed: killed || 0,
                source: source
            };
        });
    }

    /**
     * Get daily count from cumulative data
     */
    getDailyFromCumulative(cumulative, date) {
        if (cumulative === undefined || cumulative === null) return 0;
        
        // Find previous day's cumulative
        const currentIndex = this.processedData.findIndex(d => d.date === date);
        if (currentIndex <= 0) return cumulative;
        
        const previousCumulative = this.processedData[currentIndex - 1].killed_cum || 0;
        return Math.max(0, cumulative - previousCumulative);
    }

    /**
     * Get annotation for a specific date
     */
    getAnnotation(date) {
        if (!this.annotations) return null;
        return this.annotations.find(ann => ann.date === date) || null;
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.currentState };
    }

    /**
     * Update state
     */
    updateState(newState) {
        this.currentState = { ...this.currentState, ...newState };
    }

    /**
     * Get KPIs for current data
     */
    getKPIs() {
        // Use summary data if available, otherwise fall back to processed data
        if (this.summaryData && this.summaryData.gaza) {
            const gaza = this.summaryData.gaza;
            const lastUpdate = new Date(gaza.last_update);
            const today = new Date();
            
            // Calculate days since last update
            const daysSinceUpdate = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
            
            // Get recent data from daily records if available
            let recentData = { killed: 0, week: 0, month: 0 };
            if (this.processedData && this.processedData.length > 0) {
                const latest = this.processedData[this.processedData.length - 1];
                
                // Get last 7 days data
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const weekData = this.processedData.filter(d => new Date(d.date) >= weekAgo);
                recentData.week = weekData.reduce((sum, d) => sum + d.killed, 0);
                
                // Get last 30 days data
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                const monthData = this.processedData.filter(d => new Date(d.date) >= monthAgo);
                recentData.month = monthData.reduce((sum, d) => sum + d.killed, 0);
                
                // Get most recent daily count
                recentData.killed = latest.killed || 0;
            }
            
            return {
                total: gaza.killed.total || 0,
                today: recentData.killed,
                week: recentData.week,
                month: recentData.month,
                lastUpdate: gaza.last_update,
                daysSinceUpdate: daysSinceUpdate
            };
        }
        
        // Fallback to processed data if no summary available
        if (!this.processedData || this.processedData.length === 0) {
            return {
                total: 0,
                today: 0,
                week: 0,
                month: 0,
                lastUpdate: null,
                daysSinceUpdate: 0
            };
        }

        const latest = this.processedData[this.processedData.length - 1];
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Find today's data or use latest
        const todayData = this.processedData.find(d => d.date === todayStr) || latest;
        
        // Calculate week total (last 7 days)
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekData = this.processedData.filter(d => new Date(d.date) >= weekAgo);
        const weekTotal = weekData.reduce((sum, d) => sum + d.killed, 0);
        
        // Calculate month total (last 30 days)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthData = this.processedData.filter(d => new Date(d.date) >= monthAgo);
        const monthTotal = monthData.reduce((sum, d) => sum + d.killed, 0);

        return {
            total: latest.killed_cum || latest.ext_killed_cum || 0,
            today: todayData.killed || 0,
            week: weekTotal,
            month: monthTotal,
            lastUpdate: latest.date,
            daysSinceUpdate: 0
        };
    }
}

// Export for use in other modules
window.TimelineDataProcessor = TimelineDataProcessor; 