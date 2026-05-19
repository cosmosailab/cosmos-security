'use client';

import {
  Bot,
  Play,
  Download,
  Loader2,
  Terminal,
  Shield,
  Github,
  Target,
  Zap,
  MessageSquare,
  Pause,
  Square,
  ShieldAlert,
  FolderOpen,
} from 'lucide-react';
import { StealthIcon } from '@/components/icons/StealthIcon';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type {
  ReconStatus,
  GvmStatus,
  GithubHuntStatus,
  TrufflehogStatus,
  PartialReconState,
} from '@/lib/recon-types';
import { PartialReconBadges } from '@/components/PartialReconBadges';
import styles from './GraphToolbar.module.css';

interface GraphToolbarProps {
  projectId: string;
  is3D: boolean;
  showLabels: boolean;
  onToggle3D: (value: boolean) => void;
  onToggleLabels: (value: boolean) => void;
  onToggleAI?: () => void;
  isAIOpen?: boolean;
  onOpenFileSystem?: () => void;
  isFileSystemOpen?: boolean;
  // Target info
  targetDomain?: string;
  subdomainList?: string[];
  // Recon props
  onStartRecon?: () => void;
  onPauseRecon?: () => void;
  onResumeRecon?: () => void;
  onStopRecon?: () => void;
  onDownloadJSON?: () => void;
  onToggleLogs?: () => void;
  reconStatus?: ReconStatus;
  hasReconData?: boolean;
  isLogsOpen?: boolean;
  // GVM props
  gvmAvailable?: boolean;
  onStartGvm?: () => void;
  onPauseGvm?: () => void;
  onResumeGvm?: () => void;
  onStopGvm?: () => void;
  onDownloadGvmJSON?: () => void;
  onToggleGvmLogs?: () => void;
  gvmStatus?: GvmStatus;
  hasGvmData?: boolean;
  isGvmLogsOpen?: boolean;
  // GitHub Hunt props
  onStartGithubHunt?: () => void;
  onPauseGithubHunt?: () => void;
  onResumeGithubHunt?: () => void;
  onStopGithubHunt?: () => void;
  onDownloadGithubHuntJSON?: () => void;
  onToggleGithubHuntLogs?: () => void;
  githubHuntStatus?: GithubHuntStatus;
  hasGithubHuntData?: boolean;
  isGithubHuntLogsOpen?: boolean;
  // TruffleHog props
  onStartTrufflehog?: () => void;
  onPauseTrufflehog?: () => void;
  onResumeTrufflehog?: () => void;
  onStopTrufflehog?: () => void;
  onDownloadTrufflehogJSON?: () => void;
  onToggleTrufflehogLogs?: () => void;
  trufflehogStatus?: TrufflehogStatus;
  hasTrufflehogData?: boolean;
  isTrufflehogLogsOpen?: boolean;
  // Partial Recon props (multi-run)
  activePartialRecons?: PartialReconState[];
  activePartialReconLogsDrawer?: string | null; // run_id of currently open logs drawer
  onStopPartialRecon?: (runId: string) => void;
  onTogglePartialReconLogs?: (runId: string) => void;
  // Other Scans modal
  onToggleOtherScansModal?: () => void;
  // Stealth mode
  stealthMode?: boolean;
  // RoE
  roeEnabled?: boolean;
  // Emergency Pause All
  onEmergencyPauseAll?: () => void;
  isAnyPipelineRunning?: boolean;
  isEmergencyPausing?: boolean;
  // Tunnel status (displayed next to Pause All)
  tunnelStatus?: {
    ngrok?: { active: boolean; host?: string; port?: number };
    chisel?: {
      active: boolean;
      host?: string;
      port?: number;
      srvPort?: number;
    };
  };
  // Agent status
  agentActiveCount?: number;
  agentConversations?: Array<{
    id: string;
    title: string;
    currentPhase: string;
    iterationCount: number;
    agentRunning: boolean;
    sessionId: string;
  }>;
}

export function GraphToolbar({
  projectId,
  is3D,
  showLabels,
  onToggle3D,
  onToggleLabels,
  onToggleAI,
  isAIOpen = false,
  onOpenFileSystem,
  isFileSystemOpen = false,
  // Target info
  targetDomain,
  subdomainList = [],
  // Recon props
  onStartRecon,
  onPauseRecon,
  onResumeRecon,
  onStopRecon,
  onDownloadJSON,
  onToggleLogs,
  reconStatus = 'idle',
  hasReconData = false,
  isLogsOpen = false,
  // GVM props
  gvmAvailable = true,
  onStartGvm,
  onPauseGvm,
  onResumeGvm,
  onStopGvm,
  onDownloadGvmJSON,
  onToggleGvmLogs,
  gvmStatus = 'idle',
  hasGvmData = false,
  isGvmLogsOpen = false,
  // GitHub Hunt props
  onStartGithubHunt,
  onPauseGithubHunt,
  onResumeGithubHunt,
  onStopGithubHunt,
  onDownloadGithubHuntJSON,
  onToggleGithubHuntLogs,
  githubHuntStatus = 'idle',
  hasGithubHuntData = false,
  isGithubHuntLogsOpen = false,
  // TruffleHog props
  onStartTrufflehog,
  onPauseTrufflehog,
  onResumeTrufflehog,
  onStopTrufflehog,
  onDownloadTrufflehogJSON,
  onToggleTrufflehogLogs,
  trufflehogStatus = 'idle',
  hasTrufflehogData = false,
  isTrufflehogLogsOpen = false,
  // Partial Recon props (multi-run)
  activePartialRecons = [],
  activePartialReconLogsDrawer = null,
  onStopPartialRecon,
  onTogglePartialReconLogs,
  // Other Scans modal
  onToggleOtherScansModal,
  // Stealth mode
  stealthMode = false,
  // RoE
  roeEnabled = false,
  // Emergency Pause All
  onEmergencyPauseAll,
  isAnyPipelineRunning = false,
  isEmergencyPausing = false,
  tunnelStatus,
  // Agent status
  agentActiveCount = 0,
  agentConversations = [],
}: GraphToolbarProps) {
  const isReconBusy = reconStatus === 'running' || reconStatus === 'starting';
  const isReconStopping = reconStatus === 'stopping';
  const isReconRunning = isReconBusy || isReconStopping;
  const isReconPaused = reconStatus === 'paused';
  const isReconActive = isReconRunning || isReconPaused;
  const isGvmBusy = gvmStatus === 'running' || gvmStatus === 'starting';
  const isGvmStopping = gvmStatus === 'stopping';
  const isGvmRunning = isGvmBusy || isGvmStopping;
  const isGvmPaused = gvmStatus === 'paused';
  const isGvmActive = isGvmRunning || isGvmPaused;
  const isGithubHuntBusy =
    githubHuntStatus === 'running' || githubHuntStatus === 'starting';
  const isGithubHuntStopping = githubHuntStatus === 'stopping';
  const isGithubHuntRunning = isGithubHuntBusy || isGithubHuntStopping;
  const isGithubHuntPaused = githubHuntStatus === 'paused';
  const isGithubHuntActive = isGithubHuntRunning || isGithubHuntPaused;
  const isTrufflehogBusy =
    trufflehogStatus === 'running' || trufflehogStatus === 'starting';
  const isTrufflehogStopping = trufflehogStatus === 'stopping';
  const isTrufflehogRunning = isTrufflehogBusy || isTrufflehogStopping;
  const isTrufflehogPaused = trufflehogStatus === 'paused';
  const isTrufflehogActive = isTrufflehogRunning || isTrufflehogPaused;
  const hasActivePartialRecons = activePartialRecons.length > 0;

  // Agent status derived values
  const runningAgent = agentConversations.find((c) => c.agentRunning);
  const totalConversations = agentConversations.length;

  const PHASE_STYLES: Record<
    string,
    { color: string; bg: string; icon: typeof Shield }
  > = {
    informational: {
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.1)',
      icon: Shield,
    },
    exploitation: {
      color: 'var(--status-warning)',
      bg: 'rgba(245, 158, 11, 0.1)',
      icon: Target,
    },
    post_exploitation: {
      color: 'var(--status-error)',
      bg: 'rgba(239, 68, 68, 0.1)',
      icon: Zap,
    },
  };

  return (
    <div className={styles.toolbar}>
      <WikiInfoButton target="graph" title="Red Zone 위키 페이지 열기" />

      {targetDomain && (
        <>
          <div className={styles.divider} />
          <div className={styles.targetSection}>
            {subdomainList.length > 0 && (
              <div className={styles.subdomainWrapper}>
                <span className={styles.subdomainList}>
                  {subdomainList.join(', ')}
                </span>
                <div className={styles.subdomainTooltip}>
                  {subdomainList.join(', ')}
                </div>
              </div>
            )}
            <span className={styles.targetDomain}>{targetDomain}</span>
          </div>
        </>
      )}

      {stealthMode && (
        <>
          <div className={styles.divider} />
          <div
            className={styles.stealthBadge}
            title="스텔스 모드 활성 — 수동/저소음 기법만 사용"
          >
            <StealthIcon size={12} />
            <span>스텔스</span>
          </div>
        </>
      )}

      {roeEnabled && (
        <>
          <div className={styles.divider} />
          <div
            className={styles.roeBadge}
            title="RoE 활성 — 정찰 및 에이전트 보호 적용"
          >
            <Shield size={12} />
            <span>RoE</span>
          </div>
        </>
      )}

      <div className={styles.divider} />
      <button
        className={`${styles.emergencyPauseButton} ${isEmergencyPausing ? styles.emergencyPauseButtonActive : ''}`}
        onClick={onEmergencyPauseAll}
        disabled={!isAnyPipelineRunning && !isEmergencyPausing}
        title="비상 정지 — 실행 중인 모든 컨테이너를 즉시 동결. 원치 않는 대상을 스캔 또는 익스플로잇 중일 때 사용."
      >
        {isEmergencyPausing ? (
          <Loader2 size={14} className={styles.spinner} />
        ) : (
          <ShieldAlert size={14} />
        )}
        <span>{isEmergencyPausing ? '정지 중...' : '전체 일시정지'}</span>
      </button>

      {(tunnelStatus?.ngrok?.active || tunnelStatus?.chisel?.active) && (
        <div className={styles.tunnelBadges}>
          {tunnelStatus.ngrok?.active && (
            <span
              className={styles.tunnelBadge}
              title={`Tunnel active: ${tunnelStatus.ngrok.host}:${tunnelStatus.ngrok.port}`}
            >
              <span className={styles.tunnelDot} />
              ngrok
            </span>
          )}
          {tunnelStatus.chisel?.active && (
            <span
              className={styles.tunnelBadge}
              title={`Tunnel active: ${tunnelStatus.chisel.host}:${tunnelStatus.chisel.port}`}
            >
              <span className={styles.tunnelDot} />
              chisel
            </span>
          )}
        </div>
      )}

      <div className={styles.spacer} />

      <div className={styles.actionsRight}>
        {/* Recon Actions */}
        {projectId && (
          <>
            <div className={styles.actionGroup}>
              <button
                className={`${styles.reconButton} ${isReconActive ? styles.reconButtonActive : ''}`}
                onClick={isReconPaused ? onResumeRecon : onStartRecon}
                disabled={isReconRunning || hasActivePartialRecons}
                title={
                  hasActivePartialRecons
                    ? '동시 정찰 실행 중 -- 먼저 중지'
                    : isReconStopping
                      ? '중지 중...'
                      : isReconRunning
                        ? '정찰 진행 중...'
                        : isReconPaused
                          ? '정찰 재개'
                          : '정찰 시작'
                }
              >
                {isReconRunning ? (
                  <Loader2 size={14} className={styles.spinner} />
                ) : (
                  <Play size={14} />
                )}
                <span>
                  {isReconStopping
                    ? '중지 중...'
                    : isReconBusy
                      ? '실행 중...'
                      : isReconPaused
                        ? '재개'
                        : '정찰 시작'}
                </span>
              </button>

              {isReconBusy && (
                <button
                  className={styles.pauseButton}
                  onClick={onPauseRecon}
                  title="정찰 일시 정지"
                >
                  <Pause size={14} />
                </button>
              )}

              {isReconActive && (
                <button
                  className={styles.stopButton}
                  onClick={onStopRecon}
                  disabled={isReconStopping}
                  title="정찰 중지"
                >
                  <Square size={14} />
                </button>
              )}

              {isReconActive && (
                <button
                  className={`${styles.logsButton} ${isLogsOpen ? styles.logsButtonActive : ''}`}
                  onClick={onToggleLogs}
                  title="로그 보기"
                >
                  <Terminal size={14} />
                </button>
              )}

              <button
                className={styles.downloadButton}
                onClick={onDownloadJSON}
                disabled={!hasReconData || isReconActive}
                title={hasReconData ? 'Recon JSON 다운로드' : '데이터 없음'}
              >
                <Download size={14} />
              </button>
            </div>

            {/* Partial Recon Badges (multi-run) */}
            {hasActivePartialRecons && (
              <PartialReconBadges
                activePartialRecons={activePartialRecons}
                activeLogsRunId={activePartialReconLogsDrawer}
                onToggleLogs={(runId) => onTogglePartialReconLogs?.(runId)}
                onStop={(runId) => onStopPartialRecon?.(runId)}
              />
            )}

            {/* GVM Scan Actions */}
            <div className={styles.actionGroup}>
              <button
                className={`${styles.gvmButton} ${isGvmActive ? styles.gvmButtonActive : ''}`}
                onClick={isGvmPaused ? onResumeGvm : onStartGvm}
                disabled={
                  !gvmAvailable ||
                  isGvmRunning ||
                  (!hasReconData && !isGvmPaused) ||
                  (stealthMode && !isGvmPaused)
                }
                title={
                  !gvmAvailable
                    ? 'GVM이 설치되지 않았습니다. 취약점 스캔을 활성화하려면 ./redamon.sh install --gvm 실행'
                    : stealthMode && !isGvmPaused
                      ? '스텔스 모드에서 GVM 스캔은 비활성화 (대상당 ~50,000개 액티브 탐지 발생)'
                      : !hasReconData && !isGvmPaused
                        ? '먼저 정찰 실행'
                        : isGvmStopping
                          ? '중지 중...'
                          : isGvmRunning
                            ? 'GVM 스캔 진행 중...'
                            : isGvmPaused
                              ? 'GVM 스캔 재개'
                              : 'GVM 취약점 스캔 시작'
                }
              >
                {isGvmRunning ? (
                  <Loader2 size={14} className={styles.spinner} />
                ) : (
                  <Shield size={14} />
                )}
                <span>
                  {isGvmStopping
                    ? '중지 중...'
                    : isGvmBusy
                      ? '스캔 중...'
                      : isGvmPaused
                        ? '재개'
                        : 'GVM 스캔'}
                </span>
              </button>

              {isGvmBusy && (
                <button
                  className={styles.pauseButton}
                  onClick={onPauseGvm}
                  title="GVM 스캔 일시 정지"
                >
                  <Pause size={14} />
                </button>
              )}

              {isGvmActive && (
                <button
                  className={styles.stopButton}
                  onClick={onStopGvm}
                  disabled={isGvmStopping}
                  title="GVM 스캔 중지"
                >
                  <Square size={14} />
                </button>
              )}

              {isGvmActive && (
                <button
                  className={`${styles.logsButton} ${isGvmLogsOpen ? styles.logsButtonActive : ''}`}
                  onClick={onToggleGvmLogs}
                  title="GVM 로그 보기"
                >
                  <Terminal size={14} />
                </button>
              )}

              <button
                className={styles.downloadButton}
                onClick={onDownloadGvmJSON}
                disabled={!hasGvmData || isGvmActive}
                title={hasGvmData ? 'GVM JSON 다운로드' : 'GVM 데이터 없음'}
              >
                <Download size={14} />
              </button>
            </div>

            {/* Other Scans (GitHub Hunt + TruffleHog) */}
            <div className={styles.actionGroup}>
              <button
                className={`${styles.githubHuntButton} ${isGithubHuntActive || isTrufflehogActive ? styles.githubHuntButtonActive : ''}`}
                onClick={onToggleOtherScansModal}
                title="기타 스캔 (GitHub Hunt, TruffleHog)"
              >
                {isGithubHuntRunning || isTrufflehogRunning ? (
                  <Loader2 size={14} className={styles.spinner} />
                ) : (
                  <Github size={14} />
                )}
                <span>
                  {isGithubHuntBusy || isTrufflehogBusy
                    ? '스캔 중...'
                    : '기타 스캔'}
                </span>
              </button>
            </div>
          </>
        )}

        {/* Agent Status Indicators */}
        {totalConversations > 0 && (
          <div className={styles.agentStatus}>
            {agentActiveCount > 0 ? (
              <div className={styles.agentActiveBadge}>
                <span className={styles.agentDot} />
                <span>{agentActiveCount}개 활성</span>
              </div>
            ) : (
              <div className={styles.agentIdleBadge}>
                <MessageSquare size={10} />
                <span>
                  {totalConversations} chat{totalConversations !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {runningAgent &&
              (() => {
                const phase =
                  PHASE_STYLES[runningAgent.currentPhase] ||
                  PHASE_STYLES.informational;
                const PhaseIcon = phase.icon;
                return (
                  <div
                    className={styles.agentPhaseBadge}
                    style={{
                      color: phase.color,
                      backgroundColor: phase.bg,
                      borderColor: phase.color,
                    }}
                  >
                    <PhaseIcon size={10} />
                    <span>{runningAgent.currentPhase.replace('_', ' ')}</span>
                    {runningAgent.iterationCount > 0 && (
                      <span className={styles.agentStep}>
                        Step {runningAgent.iterationCount}
                      </span>
                    )}
                  </div>
                );
              })()}
          </div>
        )}

        <div className={styles.aiButtonGroup}>
          <button
            className={`${styles.aiButton} ${styles.aiButtonGroupStart} ${isAIOpen ? styles.aiButtonActive : ''}`}
            onClick={onToggleAI}
            aria-label="AI 에이전트 토글"
            aria-expanded={isAIOpen}
            title="AI 에이전트"
          >
            <Bot size={14} />
            <span>AI 에이전트</span>
          </button>
          {onOpenFileSystem && (
            <button
              className={`${styles.aiButton} ${styles.aiButtonGroupEnd} ${isFileSystemOpen ? styles.aiButtonActive : ''}`}
              onClick={onOpenFileSystem}
              aria-label="워크스페이스 토글"
              aria-expanded={isFileSystemOpen}
              title="워크스페이스 파일 + 백그라운드 작업"
            >
              <FolderOpen size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
