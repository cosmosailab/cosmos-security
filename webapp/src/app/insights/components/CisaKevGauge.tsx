'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import { ChartCard } from './ChartCard';
import type { Exploit } from '../types';

interface CisaKevGaugeProps {
  data: Exploit[] | undefined;
  isLoading: boolean;
}

export function CisaKevGauge({ data, isLoading }: CisaKevGaugeProps) {
  useTheme();

  const { kevCount, totalCount, gaugeData } = useMemo(() => {
    const total = data?.length || 0;
    const kev = data?.filter((e) => e.cisaKev === true).length || 0;
    return {
      kevCount: kev,
      totalCount: total,
      gaugeData: [
        { name: 'CISA KEV', value: kev },
        { name: '기타', value: Math.max(total - kev, 0) },
      ],
    };
  }, [data]);

  return (
    <ChartCard
      title="CISA KEV 익스플로잇"
      subtitle={`전체 ${totalCount}개 중 ${kevCount}개`}
      isLoading={isLoading}
      isEmpty={!data?.length}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 220,
        }}
      >
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={gaugeData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
              paddingAngle={totalCount > 0 ? 2 : 0}
              stroke="none"
            >
              <Cell fill="#e53935" />
              <Cell fill="var(--border-secondary)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ marginLeft: 16, textAlign: 'left' }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: kevCount > 0 ? '#e53935' : 'var(--text-primary)',
            }}
          >
            {kevCount}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              marginTop: 2,
            }}
          >
            CISA Known
            <br />
            Exploited Vulns
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              marginTop: 8,
            }}
          >
            전체 {totalCount}개 익스플로잇
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
