/**
 * @file use-monitor.ts
 * @description React hook for AF-03: Intelligent Performance Monitor.
 *   Manages real-time metrics collection, anomaly detection, and health monitoring.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,hooks,monitor,performance
 */

import { useCallback, useEffect, useRef } from 'react'

import { useMonitorStore } from '../advanced-stores'
import { metricConfigs, performanceMonitor } from '../services/performance-monitor-service'

import type { MetricName } from '../advanced-types'

export function useMonitor() {
  const {
    series,
    anomalies,
    alertRules,
    health,
    isCollecting,
    selectedMetric,
    timeRange,
    updateMetric,
    appendPoint,
    addAnomaly,
    acknowledgeAnomaly,
    resolveAnomaly,
    setHealth,
    setIsCollecting,
    setSelectedMetric,
    setTimeRange,
  } = useMonitorStore()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCollection = useCallback(() => {
    if (intervalRef.current) return
    setIsCollecting(true)

    // Initialize all metrics with initial data
    for (const config of metricConfigs) {
      const initialSeries = performanceMonitor.generateMetricSeries(config.name, timeRange, 60)
      updateMetric(initialSeries)
    }

    // Update metrics every 2 seconds
    intervalRef.current = setInterval(() => {
      for (const config of metricConfigs) {
        const now = Date.now()
        // Simulate realistic metric behavior
        const baseValue = config.min + (config.max - config.min) * (0.2 + Math.random() * 0.3)
        const spike = Math.random() < 0.03 ? (config.max - config.min) * 0.4 : 0
        const value = Math.max(config.min, Math.min(config.max, baseValue + spike))

        appendPoint(config.name, { timestamp: now, value })

        // Check for anomalies
        const existingSeries = useMonitorStore.getState().series[config.name]
        if (existingSeries && existingSeries.points.length >= 20) {
          const detectedAnomalies = performanceMonitor.detectAnomalies(existingSeries)
          for (const anomaly of detectedAnomalies) {
            addAnomaly(anomaly)
          }
        }
      }

      // Update health snapshot
      const allSeries = Object.values(useMonitorStore.getState().series)
      const newHealth = performanceMonitor.getHealthSnapshot(allSeries)
      setHealth(newHealth)
    }, 2000)
  }, [timeRange, updateMetric, appendPoint, addAnomaly, setHealth, setIsCollecting])

  const stopCollection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsCollecting(false)
  }, [setIsCollecting])

  // Auto-start collection on first use
  useEffect(() => {
    startCollection()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startCollection])

  const getMetricConfig = useCallback((metricName: MetricName) => {
    return metricConfigs.find((c) => c.name === metricName) ?? null
  }, [])

  const unacknowledgedAnomalies = anomalies.filter((a) => !a.acknowledged && !a.resolvedAt)
  const criticalAnomalies = anomalies.filter((a) => a.severity === 'critical' && !a.resolvedAt)

  const metricsList = metricConfigs.map((config) => ({
    ...config,
    currentData: series[config.name] ?? null,
  }))

  return {
    series,
    anomalies,
    alertRules,
    health,
    isCollecting,
    selectedMetric,
    timeRange,
    metricsList,
    unacknowledgedAnomalies,
    criticalAnomalies,
    appendPoint,
    addAnomaly,
    acknowledgeAnomaly,
    resolveAnomaly,
    startCollection,
    stopCollection,
    setSelectedMetric,
    setTimeRange,
    getMetricConfig,
  }
}