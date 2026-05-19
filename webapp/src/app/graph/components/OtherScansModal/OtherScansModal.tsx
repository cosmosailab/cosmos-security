'use client';

import {
  Play,
  Pause,
  Square,
  Terminal,
  Download,
  Loader2,
  Github,
  Search,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui';
import type { GithubHuntStatus, TrufflehogStatus } from '@/lib/recon-types';
import styles from './OtherScansModal.module.css';

interface OtherScansModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasReconData: boolean;
  hasGithubToken: boolean;
  // GitHub Hunt
  onStartGithubHunt?: () => void;
  onPauseGithubHunt?: () => void;
  onResumeGithubHunt?: () => void;
  onStopGithubHunt?: () => void;
  onDownloadGithubHuntJSON?: () => void;
  onToggleGithubHuntLogs?: () => void;
  githubHuntStatus?: GithubHuntStatus;
  hasGithubHuntData?: boolean;
  isGithubHuntLogsOpen?: boolean;
  // TruffleHog
  onStartTrufflehog?: () => void;
  onPauseTrufflehog?: () => void;
  onResumeTrufflehog?: () => void;
  onStopTrufflehog?: () => void;
  onDownloadTrufflehogJSON?: () => void;
  onToggleTrufflehogLogs?: () => void;
  trufflehogStatus?: TrufflehogStatus;
  hasTrufflehogData?: boolean;
  isTrufflehogLogsOpen?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    idle: styles.statusIdle,
    starting: styles.statusRunning,
    running: styles.statusRunning,
    paused: styles.statusPaused,
    stopping: styles.statusRunning,
    completed: styles.statusCompleted,
    error: styles.statusError,
  };
  return (
    <span
      className={`${styles.statusBadge} ${styleMap[status] || styles.statusIdle}`}
    >
      {status}
    </span>
  );
}

export function OtherScansModal({
  isOpen,
  onClose,
  hasReconData,
  hasGithubToken,
  // GitHub Hunt
  onStartGithubHunt,
  onPauseGithubHunt,
  onResumeGithubHunt,
  onStopGithubHunt,
  onDownloadGithubHuntJSON,
  onToggleGithubHuntLogs,
  githubHuntStatus = 'idle',
  hasGithubHuntData = false,
  isGithubHuntLogsOpen = false,
  // TruffleHog
  onStartTrufflehog,
  onPauseTrufflehog,
  onResumeTrufflehog,
  onStopTrufflehog,
  onDownloadTrufflehogJSON,
  onToggleTrufflehogLogs,
  trufflehogStatus = 'idle',
  hasTrufflehogData = false,
  isTrufflehogLogsOpen = false,
}: OtherScansModalProps) {
  // GitHub Hunt derived state
  const isGHBusy =
    githubHuntStatus === 'running' || githubHuntStatus === 'starting';
  const isGHStopping = githubHuntStatus === 'stopping';
  const isGHRunning = isGHBusy || isGHStopping;
  const isGHPaused = githubHuntStatus === 'paused';
  const isGHActive = isGHRunning || isGHPaused;

  // TruffleHog derived state
  const isTHBusy =
    trufflehogStatus === 'running' || trufflehogStatus === 'starting';
  const isTHStopping = trufflehogStatus === 'stopping';
  const isTHRunning = isTHBusy || isTHStopping;
  const isTHPaused = trufflehogStatus === 'paused';
  const isTHActive = isTHRunning || isTHPaused;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="기타 스캔" size="large">
      <div className={styles.content}>
        {/* GitHub Secret Hunt Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Github size={18} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>GitHub Secret Hunt</h3>
            <StatusBadge status={githubHuntStatus} />
          </div>
          <p className={styles.cardDescription}>
            대상 도메인과 관련된 노출된 시크릿, API 키 및 자격 증명을 GitHub
            리포지토리에서 검색합니다.
          </p>
          {!hasGithubToken && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px',
              }}
            >
              <AlertTriangle
                size={14}
                style={{ color: '#f59e0b', flexShrink: 0 }}
              />
              <span
                style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
              >
                GitHub 액세스 토큰이 필요합니다.{' '}
                <Link
                  href="/settings"
                  style={{ color: 'var(--accent-primary)', fontWeight: 500 }}
                >
                  전역 설정
                </Link>
              </span>
            </div>
          )}
          <div className={styles.cardActions}>
            {isGHPaused ? (
              <button
                className={styles.resumeButton}
                onClick={onResumeGithubHunt}
                disabled={!hasGithubToken}
                title={
                  !hasGithubToken ? 'GitHub 토큰 필요' : 'GitHub Hunt 재개'
                }
              >
                <Play size={12} />
                <span>재개</span>
              </button>
            ) : (
              <button
                className={styles.startButton}
                onClick={onStartGithubHunt}
                disabled={
                  !hasGithubToken ||
                  isGHRunning ||
                  (!hasReconData && !isGHPaused)
                }
                title={
                  !hasGithubToken
                    ? 'GitHub 토큰 필요'
                    : !hasReconData
                      ? '먼저 정찰 실행'
                      : isGHRunning
                        ? '진행 중...'
                        : 'GitHub Hunt 시작'
                }
              >
                {isGHRunning ? (
                  <Loader2 size={12} className={styles.spinner} />
                ) : (
                  <Play size={12} />
                )}
                <span>
                  {isGHBusy
                    ? '실행 중...'
                    : isGHStopping
                      ? '중지 중...'
                      : '시작'}
                </span>
              </button>
            )}

            {isGHBusy && (
              <button
                className={styles.pauseButton}
                onClick={onPauseGithubHunt}
                title="일시 정지"
              >
                <Pause size={12} />
                <span>일시 정지</span>
              </button>
            )}

            {isGHActive && (
              <button
                className={styles.stopButton}
                onClick={onStopGithubHunt}
                disabled={isGHStopping}
                title="중지"
              >
                <Square size={12} />
                <span>중지</span>
              </button>
            )}

            <button
              className={`${styles.logsButton} ${isGithubHuntLogsOpen ? styles.logsButtonActive : ''}`}
              onClick={onToggleGithubHuntLogs}
              disabled={!isGHActive}
              title="로그 보기"
            >
              <Terminal size={12} />
              <span>로그</span>
            </button>

            <button
              className={styles.downloadButton}
              onClick={onDownloadGithubHuntJSON}
              disabled={!hasGithubHuntData || isGHActive}
              title={hasGithubHuntData ? 'JSON 다운로드' : '데이터 없음'}
            >
              <Download size={12} />
              <span>다운로드</span>
            </button>
          </div>
        </div>

        {/* TruffleHog Scanner Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Search size={18} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>TruffleHog Scanner</h3>
            <StatusBadge status={trufflehogStatus} />
          </div>
          <p className={styles.cardDescription}>
            700개 이상의 감지기와 라이브 API 검증을 통한 심층 시크릿
            스캐닝입니다.
          </p>
          {!hasGithubToken && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px',
              }}
            >
              <AlertTriangle
                size={14}
                style={{ color: '#f59e0b', flexShrink: 0 }}
              />
              <span
                style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
              >
                GitHub 액세스 토큰이 필요합니다.{' '}
                <Link
                  href="/settings"
                  style={{ color: 'var(--accent-primary)', fontWeight: 500 }}
                >
                  전역 설정
                </Link>
              </span>
            </div>
          )}
          <div className={styles.cardActions}>
            {isTHPaused ? (
              <button
                className={styles.resumeButton}
                onClick={onResumeTrufflehog}
                disabled={!hasGithubToken}
                title={!hasGithubToken ? 'GitHub 토큰 필요' : 'TruffleHog 재개'}
              >
                <Play size={12} />
                <span>재개</span>
              </button>
            ) : (
              <button
                className={styles.startButton}
                onClick={onStartTrufflehog}
                disabled={
                  !hasGithubToken ||
                  isTHRunning ||
                  (!hasReconData && !isTHPaused)
                }
                title={
                  !hasGithubToken
                    ? 'GitHub 토큰 필요'
                    : !hasReconData
                      ? '먼저 정찰 실행'
                      : isTHRunning
                        ? '진행 중...'
                        : 'TruffleHog 시작'
                }
              >
                {isTHRunning ? (
                  <Loader2 size={12} className={styles.spinner} />
                ) : (
                  <Play size={12} />
                )}
                <span>
                  {isTHBusy
                    ? '실행 중...'
                    : isTHStopping
                      ? '중지 중...'
                      : '시작'}
                </span>
              </button>
            )}

            {isTHBusy && (
              <button
                className={styles.pauseButton}
                onClick={onPauseTrufflehog}
                title="일시 정지"
              >
                <Pause size={12} />
                <span>일시 정지</span>
              </button>
            )}

            {isTHActive && (
              <button
                className={styles.stopButton}
                onClick={onStopTrufflehog}
                disabled={isTHStopping}
                title="중지"
              >
                <Square size={12} />
                <span>중지</span>
              </button>
            )}

            <button
              className={`${styles.logsButton} ${isTrufflehogLogsOpen ? styles.logsButtonActive : ''}`}
              onClick={onToggleTrufflehogLogs}
              disabled={!isTHActive}
              title="로그 보기"
            >
              <Terminal size={12} />
              <span>로그</span>
            </button>

            <button
              className={styles.downloadButton}
              onClick={onDownloadTrufflehogJSON}
              disabled={!hasTrufflehogData || isTHActive}
              title={hasTrufflehogData ? 'JSON 다운로드' : '데이터 없음'}
            >
              <Download size={12} />
              <span>다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default OtherScansModal;
