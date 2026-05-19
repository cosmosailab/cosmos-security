'use client'

import { useState, useCallback } from 'react'
import { FileText, Download, ExternalLink, Trash2, Loader2, AlertCircle, Sparkles, ChevronDown } from 'lucide-react'
import { useAllReports, type ReportMeta } from '@/hooks/useReports'
import { useProjects } from '@/hooks/useProjects'
import { useProject } from '@/providers/ProjectProvider'
import { useToast, WikiInfoButton } from '@/components/ui'
import styles from './page.module.css'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function riskClass(label?: string): string {
  switch (label?.toLowerCase()) {
    case 'critical': return styles.riskCritical
    case 'high': return styles.riskHigh
    case 'medium': return styles.riskMedium
    case 'low': return styles.riskLow
    default: return ''
  }
}

export default function ReportsPage() {
  const { userId } = useProject()
  const toast = useToast()
  const {
    reports, isLoading, generate, isGenerating, generateError,
    deleteReport, isDeleting,
  } = useAllReports()

  const { data: projects } = useProjects(userId || undefined)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!selectedProjectId) return
    try {
      await generate(selectedProjectId)
      toast.info('보고서 생성이 시작되었습니다')
    } catch {
      toast.error('보고서 생성에 실패했습니다')
      // error available via generateError
    }
  }, [generate, selectedProjectId])

  const handleDelete = useCallback(async (projectId: string, reportId: string) => {
    try {
      await deleteReport({ projectId, reportId })
      toast.success('보고서가 삭제되었습니다')
    } catch {
      toast.error('보고서 삭제에 실패했습니다')
    }
    setDeleteConfirm(null)
  }, [deleteReport, toast])

  const handleDownload = useCallback(async (report: ReportMeta) => {
    try {
      const url = `/api/projects/${report.projectId}/reports/${report.id}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${report.title || 'report'}.html`
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success('보고서가 다운로드되었습니다')
    } catch {
      toast.error('보고서 다운로드에 실패했습니다')
    }
  }, [toast])

  const handleOpen = useCallback((report: ReportMeta) => {
    window.open(`/api/projects/${report.projectId}/reports/${report.id}`, '_blank')
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FileText size={18} />
          <h2 className={styles.title}>모의해킹 보고서</h2>
          <span className={styles.count}>{reports.length}</span>
          <WikiInfoButton target="reports" title="모의해킹 보고서 위키 페이지 열기" />
        </div>

        <div className={styles.generateSection}>
          <div className={styles.pickerWrapper}>
            <select
              className={styles.projectPicker}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={isGenerating}
            >
              <option value="">프로젝트 선택...</option>
              {projects?.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.targetDomain ? ` (${p.targetDomain})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className={styles.pickerChevron} />
          </div>
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={isGenerating || !selectedProjectId}
          >
            {isGenerating ? (
              <>
                <Loader2 size={13} className={styles.spin} />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <FileText size={13} />
                <span>보고서 생성</span>
              </>
            )}
          </button>
        </div>
      </div>

      {generateError && (
        <div className={styles.error}>
          <AlertCircle size={13} />
          <span>{generateError.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className={styles.empty}>
          <Loader2 size={20} className={styles.spin} />
          <span>보고서 로딩 중...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={32} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>생성된 보고서가 없습니다</p>
          <p className={styles.emptyHint}>
            상단에서 프로젝트를 선택하고 그래프 데이터, 취약점 발견 사항 및 조치 사항을 바탕으로 전문적인 모의해킹 보고서를 생성하세요.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {reports.map(report => (
            <div key={report.id} className={styles.row}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>
                  <span className={styles.reportTitle}>{report.title}</span>
                  {report.hasNarratives && (
                    <span className={styles.narrativeBadge} title="LLM이 생성한 서술형 분석 포함">
                      <Sparkles size={10} />
                      AI
                    </span>
                  )}
                </div>
                <div className={styles.rowMeta}>
                  {report.project && (
                    <>
                      <span className={styles.projectName}>{report.project.name}</span>
                      {report.project.targetDomain && (
                        <span className={styles.projectDomain}>{report.project.targetDomain}</span>
                      )}
                      <span className={styles.sep}>|</span>
                    </>
                  )}
                  <span>{formatDate(report.createdAt)}</span>
                  <span className={styles.sep}>|</span>
                  <span>{formatBytes(report.fileSize)}</span>
                  {report.metrics.riskScore != null && (
                    <>
                      <span className={styles.sep}>|</span>
                      <span className={`${styles.riskBadge} ${riskClass(report.metrics.riskLabel)}`}>
                        {report.metrics.riskScore}/100 {report.metrics.riskLabel}
                      </span>
                    </>
                  )}
                  {report.metrics.totalVulnerabilities != null && (
                    <>
                      <span className={styles.sep}>|</span>
                      <span>{report.metrics.totalVulnerabilities} 취약점</span>
                    </>
                  )}
                  {(report.metrics.criticalCount ?? 0) > 0 && (
                    <span className={styles.criticalCount}>
                      {report.metrics.criticalCount} 치명적
                    </span>
                  )}
                  {(report.metrics.highCount ?? 0) > 0 && (
                    <span className={styles.highCount}>
                      {report.metrics.highCount} 높음
                    </span>
                  )}
                  {report.metrics.totalRemediations != null && report.metrics.totalRemediations > 0 && (
                    <>
                      <span className={styles.sep}>|</span>
                      <span>{report.metrics.totalRemediations} 조치 사항</span>
                    </>
                  )}
                  {(report.metrics.exploitableCount ?? 0) > 0 && (
                    <>
                      <span className={styles.sep}>|</span>
                      <span className={styles.exploitCount}>{report.metrics.exploitableCount} 공격 가능</span>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.rowActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleDownload(report)}
                  title="보고서 다운로드"
                >
                  <Download size={14} />
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleOpen(report)}
                  title="새 탭에서 열기"
                >
                  <ExternalLink size={14} />
                </button>
                {deleteConfirm === report.id ? (
                  <div className={styles.confirmDelete}>
                    <button
                      className={styles.confirmYes}
                      onClick={() => handleDelete(report.projectId, report.id)}
                      disabled={isDeleting}
                    >
                      삭제
                    </button>
                    <button
                      className={styles.confirmNo}
                      onClick={() => setDeleteConfirm(null)}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => setDeleteConfirm(report.id)}
                    title="보고서 삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
