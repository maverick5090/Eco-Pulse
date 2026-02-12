/**
 * Shared Socket.IO client for Eco Pulse
 * Connects once to backend and manages live campus data
 */

(function() {
    'use strict';

    // Global data store
    window.EcoPulseData = {
        energyUsage: 0,
        solarGeneration: 0,
        wasteLevel: 0,
        carbonScore: 0,
        lastUpdate: null
    };

    // Configuration
    const CONFIG = {
        socketUrl: 'http://localhost:5000',
        energyThreshold: 6000,
        wasteThreshold: 80,
        solarLowThreshold: 2000
    };

    // Socket connection instance
    let socket = null;
    let chartInstances = new Map();

    /**
     * Initialize Socket.IO connection
     */
    function initSocket() {
        if (socket) {
            return socket; // Already connected
        }

        socket = io(CONFIG.socketUrl);
        
        socket.on('connect', () => {
            console.log('[EcoPulse] Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('[EcoPulse] Disconnected from server');
        });

        socket.on('campusData', handleCampusData);
        
        return socket;
    }

    /**
     * Handle incoming campus data
     */
    function handleCampusData(data) {
        // Update global data store
        window.EcoPulseData.energyUsage = data.energyUsage;
        window.EcoPulseData.solarGeneration = data.solarGeneration;
        window.EcoPulseData.wasteLevel = data.wasteLevel;
        window.EcoPulseData.carbonScore = data.carbonScore;
        window.EcoPulseData.lastUpdate = new Date();

        // Update DOM elements safely
        updateDOMElements(data);
        
        // Update charts if they exist
        updateCharts(data);

        // Trigger custom event for other scripts
        window.dispatchEvent(new CustomEvent('ecoPulseDataUpdate', { detail: data }));
    }

    /**
     * Safely update DOM elements if they exist
     */
    function updateDOMElements(data) {
        const elements = {
            energyUsage: document.getElementById('energyUsage'),
            solarGeneration: document.getElementById('solarGeneration'),
            wasteLevel: document.getElementById('wasteLevel'),
            carbonScore: document.getElementById('carbonScore'),
            summaryEnergy: document.getElementById('summaryEnergy'),
            summarySolar: document.getElementById('summarySolar'),
            summaryWaste: document.getElementById('summaryWaste'),
            summaryCarbon: document.getElementById('summaryCarbon')
        };

        // Update energy usage
        if (elements.energyUsage) {
            elements.energyUsage.textContent = data.energyUsage.toLocaleString();
        }
        if (elements.summaryEnergy) {
            elements.summaryEnergy.textContent = data.energyUsage.toLocaleString() + ' kWh';
        }

        // Update solar generation
        if (elements.solarGeneration) {
            elements.solarGeneration.textContent = data.solarGeneration.toLocaleString();
        }
        if (elements.summarySolar) {
            elements.summarySolar.textContent = data.solarGeneration.toLocaleString() + ' kWh';
        }

        // Update waste level
        if (elements.wasteLevel) {
            elements.wasteLevel.textContent = data.wasteLevel;
        }
        if (elements.summaryWaste) {
            elements.summaryWaste.textContent = data.wasteLevel + '%';
        }

        // Update carbon score
        if (elements.carbonScore) {
            elements.carbonScore.textContent = data.carbonScore;
        }
        if (elements.summaryCarbon) {
            elements.summaryCarbon.textContent = data.carbonScore + '/100';
        }
    }

    /**
     * Update Chart.js charts if they exist
     */
    function updateCharts(data) {
        chartInstances.forEach((chart, chartId) => {
            if (!chart || typeof chart.update !== 'function') {
                return;
            }

            try {
                const timeLabel = new Date().toLocaleTimeString();
                
                // Add data based on chart type
                if (chart.data && chart.data.labels) {
                    chart.data.labels.push(timeLabel);
                    
                    // Update datasets if they exist
                    if (chart.data.datasets && chart.data.datasets.length > 0) {
                        // Energy Usage dataset (index 0)
                        if (chart.data.datasets[0] && chart.data.datasets[0].data) {
                            chart.data.datasets[0].data.push(data.energyUsage);
                        }
                        
                        // Solar Generation dataset (index 1)
                        if (chart.data.datasets[1] && chart.data.datasets[1].data) {
                            chart.data.datasets[1].data.push(data.solarGeneration);
                        }
                        
                        // Waste Level dataset (index 2)
                        if (chart.data.datasets[2] && chart.data.datasets[2].data) {
                            chart.data.datasets[2].data.push(data.wasteLevel);
                        }
                        
                        // Carbon Score dataset (index 3)
                        if (chart.data.datasets[3] && chart.data.datasets[3].data) {
                            chart.data.datasets[3].data.push(data.carbonScore);
                        }
                    }

                    // Keep only last 20 data points
                    const maxDataPoints = 20;
                    if (chart.data.labels.length > maxDataPoints) {
                        chart.data.labels.shift();
                        chart.data.datasets.forEach(dataset => {
                            if (dataset && dataset.data) {
                                dataset.data.shift();
                            }
                        });
                    }

                    chart.update('none');
                }
            } catch (error) {
                console.error('[EcoPulse] Error updating chart:', error);
            }
        });
    }

    /**
     * Register a Chart.js instance for automatic updates
     */
    function registerChart(chartId, chartInstance) {
        if (chartInstance && typeof chartInstance.update === 'function') {
            chartInstances.set(chartId, chartInstance);
        }
    }

    /**
     * Unregister a Chart.js instance
     */
    function unregisterChart(chartId) {
        chartInstances.delete(chartId);
    }

    /**
     * Check alerts and return alert messages
     */
    function checkAlerts(data) {
        const alerts = [];

        if (data.wasteLevel > CONFIG.wasteThreshold) {
            alerts.push({
                type: 'waste',
                priority: 'high',
                message: `Waste level is ${data.wasteLevel}%, exceeding threshold of ${CONFIG.wasteThreshold}%`
            });
        }

        if (data.energyUsage > CONFIG.energyThreshold) {
            alerts.push({
                type: 'energy',
                priority: 'high',
                message: `Energy usage is ${data.energyUsage.toLocaleString()} kWh, exceeding threshold of ${CONFIG.energyThreshold.toLocaleString()} kWh`
            });
        }

        if (data.solarGeneration < CONFIG.solarLowThreshold) {
            alerts.push({
                type: 'solar',
                priority: 'medium',
                message: `Solar generation is ${data.solarGeneration.toLocaleString()} kWh, below optimal threshold of ${CONFIG.solarLowThreshold.toLocaleString()} kWh`
            });
        }

        return alerts;
    }

    /**
     * Get current campus data
     */
    function getData() {
        return { ...window.EcoPulseData };
    }

    /**
     * Get configuration
     */
    function getConfig() {
        return { ...CONFIG };
    }

    // Public API
    window.EcoPulse = {
        init: initSocket,
        getData: getData,
        getConfig: getConfig,
        registerChart: registerChart,
        unregisterChart: unregisterChart,
        checkAlerts: checkAlerts,
        socket: function() { return socket; }
    };

    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSocket);
    } else {
        initSocket();
    }

})();
