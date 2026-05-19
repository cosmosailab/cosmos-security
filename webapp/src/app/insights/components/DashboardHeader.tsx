'use client'

import { RefreshCw, Globe, Server } from 'lucide-react'
import { WikiInfoButton } from '@/components/ui'
import styles from './DashboardHeader.module.css'

interface DashboardHeaderProps {
  projectName: string | null
  targetDomain: string | null
  ipMode: boolean
  isLoading: boolean
  onRefresh: () => void
}

export function DashboardHeader({ projectName, targetDomain, ipMode, isLoading, onRefresh }: DashboardHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <h1 className={styles.title}>
          인사이트
          <WikiInfoButton target="insights" title="인사이트 대시보드 위키 페이지 열기" />
        </h1>
        {projectName && (
          <div className={styles.project}>
            {ipMode ? <Server size={14} /> : <Globe size={14} />}
            <span className={styles.projectName}>{projectName}</span>
            {targetDomain && (
              <>
                <span className={styles.separator}>/</span>
                <span className={styles.target}>{targetDomain}</span>
              </>
            )}
          </div>
        )}
      </div>
      <button
        className={`iconButton ${styles.refreshBtn}`}
        onClick={onRefresh}
        disabled={isLoading}
        title="데이터 새로고침"
      >
        <RefreshCw size={14} className={isLoading ? styles.spinning : ''} />
      </button>
    </div>
  )
}
