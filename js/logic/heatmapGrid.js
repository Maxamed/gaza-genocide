/**
 * Heat Map Grid Component
 * Renders the 31×23 grid visualization with proper color mapping and interactions
 */

class HeatmapGrid {
    constructor(containerId, dataProcessor) {
        this.container = document.getElementById(containerId);
        this.dataProcessor = dataProcessor;
        this.gridData = null;
        this.months = [];
        this.stats = null;
        this.selectedCell = null;
        this.isInitialized = false;
        
        // Grid configuration
        this.cellSize = 14;
        this.cellGutter = 2;
        this.headerHeight = 40;
        this.headerWidth = 60;
        
        this.init();
    }

    /**
     * Initialize the heat map grid
     */
    init() {
        if (!this.container) {
            console.error('❌ Heat map container not found');
            return;
        }

        this.isInitialized = true;
        console.log('✅ HeatmapGrid initialized');
    }

    /**
     * Update grid data and render
     */
    updateData() {
        if (!this.isInitialized || !this.dataProcessor) return;
        
        this.gridData = this.dataProcessor.getGridData();
        this.months = this.dataProcessor.getMonths();
        this.stats = this.dataProcessor.getStats();
        
        this.render();
    }

    /**
     * Render the complete heat map grid
     */
    render() {
        if (!this.gridData || !this.months) return;
        
        this.container.innerHTML = '';
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'heatmap-grid-container';
        
        // Add headers
        this.renderHeaders(gridContainer);
        
        // Add grid
        this.renderGrid(gridContainer);
        
        // Add legend
        this.renderLegend(gridContainer);
        
        // Add metric selector
        this.renderMetricSelector(gridContainer);
        
        this.container.appendChild(gridContainer);
    }

    /**
     * Render column and row headers
     */
    renderHeaders(container) {
        // Column headers (months)
        const columnHeaders = document.createElement('div');
        columnHeaders.className = 'heatmap-column-headers';
        columnHeaders.style.cssText = `
            display: flex;
            margin-left: ${this.headerWidth}px;
            margin-bottom: 10px;
        `;
        
        this.months.forEach(month => {
            const header = document.createElement('div');
            header.className = 'heatmap-month-header';
            header.textContent = `${month.monthName} ${month.year}`;
            header.style.cssText = `
                width: ${this.cellSize}px;
                height: ${this.headerHeight}px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 600;
                color: var(--text-muted);
                transform: rotate(-45deg);
                transform-origin: center;
                white-space: nowrap;
            `;
            columnHeaders.appendChild(header);
        });
        
        container.appendChild(columnHeaders);
    }

    /**
     * Render the main grid
     */
    renderGrid(container) {
        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';
        grid.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${this.cellGutter}px;
        `;
        
        // Render each row
        this.gridData.forEach((row, dayIndex) => {
            const day = dayIndex + 1;
            const rowElement = this.renderRow(row, day);
            grid.appendChild(rowElement);
        });
        
        container.appendChild(grid);
    }

    /**
     * Render a single row
     */
    renderRow(row, day) {
        const rowElement = document.createElement('div');
        rowElement.className = 'heatmap-row';
        rowElement.style.cssText = `
            display: flex;
            gap: ${this.cellGutter}px;
            align-items: center;
        `;
        
        // Day label
        const dayLabel = document.createElement('div');
        dayLabel.className = 'heatmap-day-label';
        dayLabel.textContent = day;
        dayLabel.style.cssText = `
            width: ${this.headerWidth}px;
            height: ${this.cellSize}px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
        `;
        rowElement.appendChild(dayLabel);
        
        // Grid cells
        row.forEach((cell, monthIndex) => {
            const cellElement = this.renderCell(cell, day, monthIndex);
            rowElement.appendChild(cellElement);
        });
        
        return rowElement;
    }

    /**
     * Render a single cell
     */
    renderCell(cell, day, monthIndex) {
        const cellElement = document.createElement('div');
        cellElement.className = `heatmap-cell heatmap-cell-${cell.type}`;
        cellElement.dataset.date = cell.date;
        cellElement.dataset.day = day;
        cellElement.dataset.monthIndex = monthIndex;
        
        // Base cell styles
        cellElement.style.cssText = `
            width: ${this.cellSize}px;
            height: ${this.cellSize}px;
            border-radius: 2px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        `;
        
        // Apply cell type styling
        this.styleCell(cellElement, cell);
        
        // Add event listeners
        this.addCellEventListeners(cellElement, cell);
        
        return cellElement;
    }

    /**
     * Apply styling based on cell type
     */
    styleCell(cellElement, cell) {
        switch (cell.type) {
            case 'nonexistent':
                // Empty cell - no styling needed
                cellElement.style.background = 'transparent';
                cellElement.style.border = 'none';
                cellElement.style.cursor = 'default';
                break;
                
            case 'missing':
                // Missing data - light hatch pattern
                cellElement.style.background = 'white';
                cellElement.style.border = '1px dashed #E5E7EB';
                cellElement.style.cursor = 'default';
                break;
                
            case 'present':
                // Present data - color based on value
                this.stylePresentCell(cellElement, cell);
                break;
        }
    }

    /**
     * Style a cell with present data
     */
    stylePresentCell(cellElement, cell) {
        if (!this.stats || cell.value === 0) {
            // Zero value - very light border
            cellElement.style.background = 'white';
            cellElement.style.border = '1px solid #F3F4F6';
            return;
        }
        
        // Calculate color based on sqrt scaling
        const sqrtValue = Math.sqrt(cell.value);
        const sqrtMin = Math.sqrt(this.stats.minPositive);
        const sqrtMax = Math.sqrt(this.stats.p95);
        
        let intensity;
        if (sqrtValue <= sqrtMin) {
            intensity = 0.1; // Very light
        } else if (sqrtValue >= sqrtMax) {
            intensity = 0.8; // Dark (capped at p95)
        } else {
            // Linear interpolation between min and max
            intensity = 0.1 + (0.7 * (sqrtValue - sqrtMin) / (sqrtMax - sqrtMin));
        }
        
        // Apply grayscale color
        const colorValue = Math.round(255 * (1 - intensity));
        cellElement.style.background = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
        cellElement.style.border = '1px solid #E5E7EB';
        
        // Add correction indicator if needed
        if (cell.corrected) {
            this.addCorrectionIndicator(cellElement);
        }
    }

    /**
     * Add correction indicator to cell
     */
    addCorrectionIndicator(cellElement) {
        const indicator = document.createElement('div');
        indicator.className = 'correction-indicator';
        indicator.textContent = '†';
        indicator.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            font-size: 8px;
            color: var(--accent-red);
            font-weight: bold;
            line-height: 1;
        `;
        cellElement.appendChild(indicator);
    }

    /**
     * Add event listeners to cell
     */
    addCellEventListeners(cellElement, cell) {
        if (cell.type !== 'present') return;
        
        // Hover effects
        cellElement.addEventListener('mouseenter', () => {
            this.handleCellHover(cellElement, cell);
        });
        
        cellElement.addEventListener('mouseleave', () => {
            this.handleCellLeave();
        });
        
        // Click to select
        cellElement.addEventListener('click', () => {
            this.handleCellClick(cell);
        });
        
        // Keyboard navigation
        cellElement.addEventListener('keydown', (e) => {
            this.handleCellKeydown(e, cell);
        });
        
        // Make focusable
        cellElement.tabIndex = 0;
    }

    /**
     * Handle cell hover
     */
    handleCellHover(cellElement, cell) {
        // Highlight cell
        cellElement.style.transform = 'scale(1.2)';
        cellElement.style.zIndex = '10';
        
        // Show caption
        this.showCaption(cell, cellElement);
    }

    /**
     * Handle cell leave
     */
    handleCellLeave() {
        // Reset all cells
        document.querySelectorAll('.heatmap-cell').forEach(cell => {
            cell.style.transform = 'scale(1)';
            cell.style.zIndex = 'auto';
        });
        
        // Hide caption
        this.hideCaption();
    }

    /**
     * Handle cell click
     */
    handleCellClick(cell) {
        this.selectedCell = cell;
        
        // Update UI
        document.querySelectorAll('.heatmap-cell').forEach(c => {
            c.classList.remove('selected');
        });
        
        const cellElement = document.querySelector(`[data-date="${cell.date}"]`);
        if (cellElement) {
            cellElement.classList.add('selected');
        }
        
        // Dispatch event for other components
        this.container.dispatchEvent(new CustomEvent('cellSelected', {
            detail: { cell: cell }
        }));
        
        console.log(`📅 Cell selected: ${cell.date} - ${cell.value} killed`);
    }

    /**
     * Handle cell keyboard navigation
     */
    handleCellKeydown(e, cell) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.handleCellClick(cell);
                break;
        }
    }

    /**
     * Show caption below grid
     */
    showCaption(cell, cellElement) {
        const date = new Date(cell.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        const killedStr = cell.value.toLocaleString();
        const weekOfWar = this.calculateWeekOfWar(cell.date);
        
        let captionText = `${dateStr} — ${killedStr} killed`;
        if (cell.corrected) {
            captionText += ' (data corrected)';
        }
        captionText += ` — Week ${weekOfWar} of war`;
        
        // Dispatch event for main component to show caption
        this.container.dispatchEvent(new CustomEvent('showCaption', {
            detail: { text: captionText }
        }));
    }

    /**
     * Hide caption
     */
    hideCaption() {
        this.container.dispatchEvent(new CustomEvent('hideCaption'));
    }

    /**
     * Calculate week of war
     */
    calculateWeekOfWar(dateStr) {
        const warStart = new Date('2023-10-07');
        const date = new Date(dateStr);
        const diffTime = date - warStart;
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks;
    }

    /**
     * Render legend
     */
    renderLegend(container) {
        if (!this.stats) return;
        
        const legend = document.createElement('div');
        legend.className = 'heatmap-legend';
        legend.style.cssText = `
            margin-top: 20px;
            text-align: center;
        `;
        
        // Color scale
        const colorScale = document.createElement('div');
        colorScale.className = 'color-scale';
        colorScale.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        `;
        
        // Create color swatches
        const steps = [0, 5, 20, 50, 120, this.stats.p95];
        steps.forEach((value, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            
            let intensity;
            if (value === 0) {
                intensity = 0;
            } else if (value >= this.stats.p95) {
                intensity = 0.8;
            } else {
                const sqrtValue = Math.sqrt(value);
                const sqrtMin = Math.sqrt(this.stats.minPositive);
                const sqrtMax = Math.sqrt(this.stats.p95);
                intensity = 0.1 + (0.7 * (sqrtValue - sqrtMin) / (sqrtMax - sqrtMin));
            }
            
            const colorValue = Math.round(255 * (1 - intensity));
            swatch.style.cssText = `
                width: 20px;
                height: 20px;
                background: ${intensity === 0 ? 'white' : `rgb(${colorValue}, ${colorValue}, ${colorValue})`};
                border: 1px solid #E5E7EB;
                border-radius: 2px;
            `;
            
            const label = document.createElement('div');
            label.textContent = value === this.stats.p95 ? `≥${value}` : value.toString();
            label.style.cssText = `
                font-size: 10px;
                color: var(--text-muted);
                margin-top: 5px;
            `;
            
            const swatchContainer = document.createElement('div');
            swatchContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
            `;
            swatchContainer.appendChild(swatch);
            swatchContainer.appendChild(label);
            
            colorScale.appendChild(swatchContainer);
        });
        
        legend.appendChild(colorScale);
        
        // Legend keys
        const keys = document.createElement('div');
        keys.className = 'legend-keys';
        keys.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 20px;
            font-size: 11px;
            color: var(--text-muted);
        `;
        
        const missingKey = document.createElement('div');
        missingKey.innerHTML = '□ (dotted) = data missing';
        
        const correctionKey = document.createElement('div');
        correctionKey.innerHTML = '† = source correction';
        
        keys.appendChild(missingKey);
        keys.appendChild(correctionKey);
        
        legend.appendChild(keys);
        container.appendChild(legend);
    }

    /**
     * Render metric selector
     */
    renderMetricSelector(container) {
        const selector = document.createElement('div');
        selector.className = 'metric-selector';
        selector.style.cssText = `
            margin-top: 20px;
            text-align: center;
        `;
        
        const title = document.createElement('div');
        title.textContent = 'Metric:';
        title.style.cssText = `
            font-size: 12px;
            color: var(--text-muted);
            margin-bottom: 10px;
        `;
        
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
        `;
        
        const metrics = [
            { key: 'all', label: 'All' },
            { key: 'children', label: 'Children' },
            { key: 'women', label: 'Women' },
            { key: 'medical', label: 'Medical' },
            { key: 'press', label: 'Press' }
        ];
        
        metrics.forEach(metric => {
            const button = document.createElement('button');
            button.className = 'metric-btn';
            button.textContent = metric.label;
            button.dataset.metric = metric.key;
            button.style.cssText = `
                padding: 6px 12px;
                border: 1px solid var(--bg-tertiary);
                background: var(--bg-primary);
                color: var(--text-secondary);
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            
            if (metric.key === 'all') {
                button.style.background = 'var(--accent-red)';
                button.style.color = 'white';
                button.style.borderColor = 'var(--accent-red)';
            }
            
            button.addEventListener('click', () => {
                this.selectMetric(metric.key);
            });
            
            buttons.appendChild(button);
        });
        
        selector.appendChild(title);
        selector.appendChild(buttons);
        container.appendChild(selector);
    }

    /**
     * Select metric
     */
    selectMetric(metric) {
        // Update UI
        document.querySelectorAll('.metric-btn').forEach(btn => {
            btn.style.background = 'var(--bg-primary)';
            btn.style.color = 'var(--text-secondary)';
            btn.style.borderColor = 'var(--bg-tertiary)';
        });
        
        const selectedBtn = document.querySelector(`[data-metric="${metric}"]`);
        if (selectedBtn) {
            selectedBtn.style.background = 'var(--accent-red)';
            selectedBtn.style.color = 'white';
            selectedBtn.style.borderColor = 'var(--accent-red)';
        }
        
        // Update data processor
        this.dataProcessor.updateMetric(metric);
        
        // Re-render grid
        this.updateData();
        
        console.log(`📊 Metric changed to: ${metric}`);
    }

    /**
     * Get selected cell
     */
    getSelectedCell() {
        return this.selectedCell;
    }

    /**
     * Destroy the component
     */
    destroy() {
        this.isInitialized = false;
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
window.HeatmapGrid = HeatmapGrid; 