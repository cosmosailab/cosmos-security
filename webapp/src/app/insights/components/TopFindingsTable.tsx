'use client';

import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { severityColor } from '../utils/chartTheme';
import { ChartCard } from './ChartCard';
import styles from './TopFindingsTable.module.css';
import type { AttackChainsData } from '../types';

interface TopFindingsTableProps {
  data: AttackChainsData['topFindings'] | undefined;
  isLoading: boolean;
}

function formatType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TopFindingsTable({ data, isLoading }: TopFindingsTableProps) {
  const severityMap: Record<string, string> = {
    critical: '치명적',
    high: '높음',
    medium: '중간',
    low: '낮음',
    info: '정보',
  };

  return (
    <ChartCard
      title="체인 발견 사항"
      subtitle={`위험도순 상위 ${data?.length || 0}개`}
      isLoading={isLoading}
      isEmpty={!data?.length}
    >
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>위험도</th>
              <th>제목</th>
              <th>유형</th>
              <th>대상</th>
              <th>단계</th>
              <th>증거</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((f, i) => (
              <tr key={i}>
                <td>
                  <span
                    className={styles.sevBadge}
                    style={{ background: severityColor(f.severity) }}
                  >
                    {severityMap[f.severity.toLowerCase()] || f.severity}
                  </span>
                </td>
                <td className={styles.titleCell} title={f.title}>
                  {f.title}
                </td>
                <td className={styles.typeCell}>{formatType(f.findingType)}</td>
                <td className={styles.mono}>{f.targetHost || '—'}</td>
                <td className={styles.phaseCell}>
                  {f.phase ? formatType(f.phase) : '—'}
                </td>
                <td
                  className={styles.evidenceCell}
                  title={f.evidence || undefined}
                >
                  {f.evidence
                    ? f.evidence.slice(0, 80) +
                      (f.evidence.length > 80 ? '...' : '')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
