/**
 * Timeline Chart Component
 * Renders the main daily casualties chart using HTML5 Canvas
 */

class TimelineChart {
    constructor(containerId, dataProcessor) {
        this.container = document.getElementById(containerId);
        this.dataProcessor = dataProcessor;
        this.canvas = null;
        this.ctx = null;
        this.data = [];
        this.currentMetric = 'all';
        this.currentSource = 'official';
        this.hoveredDate = null;
        this.pinnedDate = null;
        this.isInitialized = false;
        
        // Chart dimensions and margins
        this.margin = { top: 20, right: 20, bottom: 40, left: 60 };
        this.width = 0;
        this.height = 0;
        
        // Animation and interaction
        this.animationFrame = null;
        this.isHovering = false;
        
        this.init();
    }

    /**
     * Initialize the chart
     */
    init() {
        if (!this.container) {
            console.error('❌ Chart container not found');
            return;
        }

        this.createCanvas();
        this.setupEventListeners();
        this.resize();
        this.isInitialized = true;
        
        console.log('✅ TimelineChart initialized');
    }

    /**
     * Create canvas element
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Resize handling
        window.addEventListener('resize', () => this.resize());
        
        // Mouse interactions
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Touch interactions for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e));
        this.canvas.addEventListener('touchend', () => this.handleMouseLeave());
    }

    /**
     * Handle canvas resize
     */
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // Set canvas resolution
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Update canvas style dimensions
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        this.render();
    }

    /**
     * Update chart data and render
     */
    updateData(metric, source) {
        this.currentMetric = metric;
        this.currentSource = source;
        this.data = this.dataProcessor.getDataForMetric(metric, source);
        this.render();
    }

    /**
     * Set hovered date
     */
    setHoveredDate(date) {
        this.hoveredDate = date;
        this.render();
    }

    /**
     * Set pinned date
     */
    setPinnedDate(date) {
        this.pinnedDate = date;
        this.render();
    }

    /**
     * Render the chart
     */
    render() {
        if (!this.isInitialized || !this.data.length) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Calculate chart dimensions
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Find data bounds
        const bounds = this.calculateBounds();
        
        // Draw chart
        this.drawGrid(chartWidth, chartHeight, bounds);
        this.drawData(chartWidth, chartHeight, bounds);
        this.drawAxes(chartWidth, chartHeight, bounds);
        this.drawLabels(chartWidth, chartHeight);
        
        // Draw interactions
        if (this.hoveredDate) {
            this.drawHoverIndicator(chartWidth, chartHeight, bounds);
        }
        
        if (this.pinnedDate) {
            this.drawPinnedIndicator(chartWidth, chartHeight, bounds);
        }
    }

    /**
     * Calculate data bounds
     */
    calculateBounds() {
        const dates = this.data.map(d => new Date(d.date));
        const killed = this.data.map(d => d.killed);
        
        return {
            xMin: Math.min(...dates),
            xMax: Math.max(...dates),
            yMin: 0,
            yMax: Math.max(...killed) * 1.1 // Add 10% padding
        };
    }

    /**
     * Draw grid lines
     */
    drawGrid(chartWidth, chartHeight, bounds) {
        this.ctx.strokeStyle = '#E5E7EB';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);
        
        // Horizontal grid lines
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = this.margin.top + (i / ySteps) * chartHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left, y);
            this.ctx.lineTo(this.margin.left + chartWidth, y);
            this.ctx.stroke();
        }
        
        // Vertical grid lines (monthly)
        const months = this.getMonthBoundaries(bounds.xMin, bounds.xMax);
        months.forEach(date => {
            const x = this.margin.left + this.xScale(date, bounds.xMin, bounds.xMax, chartWidth);
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.margin.top);
            this.ctx.lineTo(x, this.margin.top + chartHeight);
            this.ctx.stroke();
        });
        
        this.ctx.setLineDash([]);
    }

    /**
     * Get month boundaries for grid
     */
    getMonthBoundaries(startDate, endDate) {
        const boundaries = [];
        const current = new Date(startDate);
        current.setDate(1);
        
        while (current <= endDate) {
            boundaries.push(new Date(current));
            current.setMonth(current.getMonth() + 1);
        }
        
        return boundaries;
    }

    /**
     * Draw data line
     */
    drawData(chartWidth, chartHeight, bounds) {
        if (this.data.length < 2) return;
        
        this.ctx.strokeStyle = '#DC2626';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        
        this.data.forEach((day, index) => {
            const x = this.margin.left + this.xScale(new Date(day.date), bounds.xMin, bounds.xMax, chartWidth);
            const y = this.margin.top + this.yScale(day.killed, bounds.yMin, bounds.yMax, chartHeight);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        
        // Draw data points
        this.drawDataPoints(chartWidth, chartHeight, bounds);
    }

    /**
     * Draw data points
     */
    drawDataPoints(chartWidth, chartHeight, bounds) {
        this.ctx.fillStyle = '#DC2626';
        
        this.data.forEach(day => {
            const x = this.margin.left + this.xScale(new Date(day.date), bounds.xMin, bounds.xMax, chartWidth);
            const y = this.margin.top + this.yScale(day.killed, bounds.yMin, bounds.yMax, chartHeight);
            
            // Draw point
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Highlight corrected data
            if (day.corrected) {
                this.ctx.strokeStyle = '#6B7280';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }

    /**
     * Draw axes
     */
    drawAxes(chartWidth, chartHeight, bounds) {
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 2;
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top + chartHeight);
        this.ctx.lineTo(this.margin.left + chartWidth, this.margin.top + chartHeight);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin.left, this.margin.top);
        this.ctx.lineTo(this.margin.left, this.margin.top + chartHeight);
        this.ctx.stroke();
    }

    /**
     * Draw axis labels
     */
    drawLabels(chartWidth, chartHeight) {
        this.ctx.fillStyle = '#6B7280';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'center';
        
        // X-axis labels (months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Draw month labels at bottom
        this.ctx.textBaseline = 'top';
        const currentYear = new Date().getFullYear();
        const yearRange = [2023, 2024, 2025];
        
        yearRange.forEach(year => {
            months.forEach((month, monthIndex) => {
                const date = new Date(year, monthIndex, 1);
                if (date >= new Date('2023-10-07') && date <= new Date()) {
                    const x = this.margin.left + this.xScale(date, new Date('2023-10-07'), new Date(), chartWidth);
                    const y = this.margin.top + chartHeight + 20;
                    
                    this.ctx.fillText(`${month} ${year}`, x, y);
                }
            });
        });
        
        // Y-axis labels
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = this.margin.top + (i / ySteps) * chartHeight;
            const value = Math.round((ySteps - i) / ySteps * this.getMaxKilled());
            
            this.ctx.fillText(value.toLocaleString(), this.margin.left - 10, y);
        }
    }

    /**
     * Draw hover indicator
     */
    drawHoverIndicator(chartWidth, chartHeight, bounds) {
        const day = this.data.find(d => d.date === this.hoveredDate);
        if (!day) return;
        
        const x = this.margin.left + this.xScale(new Date(day.date), bounds.xMin, bounds.xMax, chartWidth);
        const y = this.margin.top + this.yScale(day.killed, bounds.yMin, bounds.yMax, chartHeight);
        
        // Vertical line
        this.ctx.strokeStyle = '#DC2626';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.margin.top);
        this.ctx.lineTo(x, this.margin.top + chartHeight);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // Hover point
        this.ctx.fillStyle = '#DC2626';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Tooltip
        this.drawTooltip(day, x, y);
    }

    /**
     * Draw pinned indicator
     */
    drawPinnedIndicator(chartWidth, chartHeight, bounds) {
        const day = this.data.find(d => d.date === this.pinnedDate);
        if (!day) return;
        
        const x = this.margin.left + this.xScale(new Date(day.date), bounds.xMin, bounds.xMax, chartWidth);
        const y = this.margin.top + this.yScale(day.killed, bounds.yMin, bounds.yMax, chartHeight);
        
        // Pinned point with different style
        this.ctx.strokeStyle = '#DC2626';
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = '#FFFFFF';
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }

    /**
     * Draw tooltip
     */
    drawTooltip(day, x, y) {
        const tooltipWidth = 200;
        const tooltipHeight = 80;
        const tooltipX = Math.min(x + 10, this.width - tooltipWidth - 20);
        const tooltipY = Math.max(y - tooltipHeight - 10, 20);
        
        // Tooltip background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
        
        // Tooltip text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const date = new Date(day.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        this.ctx.fillText(dateStr, tooltipX + 10, tooltipY + 10);
                    this.ctx.fillText(`${day.killed.toLocaleString()} martyred`, tooltipX + 10, tooltipY + 30);
        
        if (day.corrected) {
            this.ctx.fillStyle = '#F59E0B';
            this.ctx.fillText('Data corrected', tooltipX + 10, tooltipY + 50);
        }
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find closest data point
        const closestDate = this.findClosestDate(x, y);
        if (closestDate !== this.hoveredDate) {
            this.hoveredDate = closestDate;
            this.render();
        }
    }

    /**
     * Handle mouse leave
     */
    handleMouseLeave() {
        this.hoveredDate = null;
        this.render();
    }

    /**
     * Handle click
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedDate = this.findClosestDate(x, y);
        if (clickedDate) {
            // Dispatch custom event for other components
            this.container.dispatchEvent(new CustomEvent('dateClicked', {
                detail: { date: clickedDate }
            }));
        }
    }

    /**
     * Handle touch events
     */
    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const closestDate = this.findClosestDate(x, y);
        if (closestDate !== this.hoveredDate) {
            this.hoveredDate = closestDate;
            this.render();
        }
    }

    /**
     * Find closest date to mouse position
     */
    findClosestDate(x, y) {
        if (!this.data.length) return null;
        
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const bounds = this.calculateBounds();
        
        let closestDate = null;
        let closestDistance = Infinity;
        
        this.data.forEach(day => {
            const dayX = this.margin.left + this.xScale(new Date(day.date), bounds.xMin, bounds.xMax, chartWidth);
            const dayY = this.margin.top + this.yScale(day.killed, bounds.yMin, bounds.yMax, this.height - this.margin.top - this.margin.bottom);
            
            const distance = Math.sqrt((x - dayX) ** 2 + (y - dayY) ** 2);
            if (distance < closestDistance && distance < 20) { // 20px threshold
                closestDistance = distance;
                closestDate = day.date;
            }
        });
        
        return closestDate;
    }

    /**
     * Utility functions for scaling
     */
    xScale(value, min, max, range) {
        return ((value - min) / (max - min)) * range;
    }

    yScale(value, min, max, range) {
        return ((max - value) / (max - min)) * range;
    }

    /**
     * Get maximum killed value
     */
    getMaxKilled() {
        return Math.max(...this.data.map(d => d.killed));
    }

    /**
     * Destroy the chart
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.isInitialized = false;
    }
}

// Export for use in other modules
window.TimelineChart = TimelineChart; 