'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useTheme } from '@/hooks/useTheme'
import { getChartChrome, getTooltipStyle, getTooltipItemStyle, getTooltipLabelStyle, getCursorStyle } from '../utils/chartTheme'
import { capitalize } from '../utils/formatters'
import { ChartCard } from './ChartCard'

interface RemediationStatusBarProps {
  data: { status: string; count: number }[] | undefined
  isLoading: boolean
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  verified: '#14b8a6',
  failed: '#ef4444',
  none: '#71717a',
}

export function RemediationStatusBar({ data, isLoading }: RemediationStatusBarProps) {
  const { theme } = useTheme()
  const chrome = useMemo(() => getChartChrome(), [theme])
  const tooltipStyle = useMemo(() => getTooltipStyle(), [theme])
  const tooltipItemStyle = useMemo(() => getTooltipItemStyle(), [theme])
  const tooltipLabelStyle = useMemo(() => getTooltipLabelStyle(), [theme])
  const cursorStyle = useMemo(() => getCursorStyle(), [theme])

  const statusMap: Record<string, string> = {
    pending: '대기 중',
    in_progress: '진행 중',
    completed: '완료',
    verified: '검증됨',
    failed: '실패',
    none: '없음',
  }

  const chartData = useMemo(() => {
    if (!data) return []
    return data.map(d => ({ 
      ...d, 
      label: statusMap[d.status.toLowerCase()] || capitalize(d.status.replace(/_/g, ' ')) 
    }))
  }, [data])

  const total = chartData.reduce((s, d) => s + d.count, 0)

  return (
    <ChartCard title="조치 상태" subtitle={`전체 ${total}개`} isLoading={isLoading} isEmpty={total === 0}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: chrome.axisColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: chrome.axisColor }} axisLine={false} tickLine={false} width={35} />
          <Tooltip cursor={cursorStyle} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32} name="수량">
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#71717a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

