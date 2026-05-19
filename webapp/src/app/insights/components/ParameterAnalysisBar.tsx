'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import {
  getChartChrome,
  getTooltipStyle,
  getTooltipItemStyle,
  getTooltipLabelStyle,
  getCursorStyle,
} from '../utils/chartTheme';
import { ChartCard } from './ChartCard';

interface ParameterAnalysisBarProps {
  data: { position: string; total: number; injectable: number }[] | undefined;
  isLoading: boolean;
}

export function ParameterAnalysisBar({
  data,
  isLoading,
}: ParameterAnalysisBarProps) {
  const { theme } = useTheme();
  const chrome = useMemo(() => getChartChrome(), [theme]);
  const tooltipStyle = useMemo(() => getTooltipStyle(), [theme]);
  const tooltipItemStyle = useMemo(() => getTooltipItemStyle(), [theme]);
  const tooltipLabelStyle = useMemo(() => getTooltipLabelStyle(), [theme]);
  const cursorStyle = useMemo(() => getCursorStyle(), [theme]);

  const totalParams = data?.reduce((s, d) => s + d.total, 0) || 0;
  const totalInjectable = data?.reduce((s, d) => s + d.injectable, 0) || 0;

  return (
    <ChartCard
      title="위치별 파라미터"
      subtitle={`전체 ${totalParams}개 중 ${totalInjectable}개 인젝션 가능`}
      isLoading={isLoading}
      isEmpty={!data?.length}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data || []}
          margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
        >
          <XAxis
            dataKey="position"
            tick={{ fontSize: 11, fill: chrome.axisColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: chrome.axisColor }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={cursorStyle}
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ fontSize: 11 }}>{value}</span>
            )}
          />
          <Bar
            dataKey="total"
            fill="#3b82f6"
            name="전체"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="injectable"
            fill="#e53935"
            name="인젝션 가능"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
