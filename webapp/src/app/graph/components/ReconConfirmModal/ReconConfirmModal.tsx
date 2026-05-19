'use client';

import { AlertTriangle, ShieldAlert, Play, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui';
import styles from './ReconConfirmModal.module.css';

interface GraphStats {
  totalNodes: number;
  nodesByType: Record<string, number>;
}

interface ReconConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  targetDomain: string;
  ipMode?: boolean;
  targetIps?: string[];
  stats: GraphStats | null;
  isLoading: boolean;
}

export function ReconConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  targetDomain,
  ipMode,
  targetIps,
  stats,
  isLoading,
}: ReconConfirmModalProps) {
  const targetDisplay =
    ipMode && targetIps?.length
      ? targetIps.slice(0, 5).join(', ') +
        (targetIps.length > 5 ? ` (+${targetIps.length - 5} more)` : '')
      : targetDomain;
  const hasExistingData = stats && stats.totalNodes > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="정찰 시작" size="default">
      <div className={styles.content}>
        <div className={styles.info}>
          <p className={styles.projectInfo}>
            <strong>프로젝트:</strong> {projectName}
          </p>
          <p className={styles.projectInfo}>
            <strong>대상:</strong> {targetDisplay}
          </p>
        </div>

        <div className={styles.disclaimer}>
          <ShieldAlert size={18} className={styles.disclaimerIcon} />
          <div className={styles.disclaimerContent}>
            <p className={styles.disclaimerTitle}>승인 필수</p>
            <p className={styles.disclaimerText}>
              정찰은 대상 시스템을 능동적으로 스캔하고 탐지합니다. 이 작업은
              보안 경보를 발생시킬 수 있으며 침입적인 것으로 간주될 수 있습니다.
              진행함으로써 귀하는 <strong>대상을 소유</strong>하거나
              소유자로부터 <strong>명시적 서면 허가</strong>를 받았음을
              확인합니다. 무단 스캔은 불법이며 형사 처벌을 받을 수 있습니다.
            </p>
          </div>
        </div>

        {hasExistingData ? (
          <div className={styles.warning}>
            <AlertTriangle size={20} className={styles.warningIcon} />
            <div className={styles.warningContent}>
              <p className={styles.warningTitle}>기존 데이터 발견</p>
              <p className={styles.warningText}>
                이 프로젝트의 그래프 데이터베이스에{' '}
                <strong>{stats.totalNodes}</strong>개의 노드가 있습니다. 새
                정찰을 시작하면 <strong>모든 기존 데이터가 삭제</strong>되고 새
                스캔 결과로 대체됩니다.
              </p>
              <div className={styles.stats}>
                {Object.entries(stats.nodesByType).map(([type, count]) => (
                  <span key={type} className={styles.statBadge}>
                    {type}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.ready}>
            <p>기존 데이터가 없습니다. 정찰을 시작할 준비가 되었습니다.</p>
            <p className={styles.readyNote}>
              <strong>{targetDisplay}</strong>을(를) 스캔하여 발견된 서브도메인,
              포트, 서비스 및 취약점으로 그래프 데이터베이스를 채웁니다.
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className={styles.spinner} />
                <span>시작 중...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>{hasExistingData ? '삭제 후 시작' : '정찰 시작'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ReconConfirmModal;
