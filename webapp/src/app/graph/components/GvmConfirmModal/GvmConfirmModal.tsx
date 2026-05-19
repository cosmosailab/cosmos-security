'use client';

import { AlertTriangle, ShieldAlert, Play, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui';
import styles from './GvmConfirmModal.module.css';

interface GvmStats {
  totalGvmNodes: number;
  nodesByType: Record<string, number>;
}

interface GvmConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  targetDomain: string;
  stats: GvmStats | null;
  isLoading: boolean;
  error?: string | null;
}

export function GvmConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  targetDomain,
  stats,
  isLoading,
  error,
}: GvmConfirmModalProps) {
  const hasExistingData = stats && stats.totalGvmNodes > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GVM 취약점 스캔 시작"
      size="default"
    >
      <div className={styles.content}>
        <div className={styles.info}>
          <p className={styles.projectInfo}>
            <strong>프로젝트:</strong> {projectName}
          </p>
          <p className={styles.projectInfo}>
            <strong>대상:</strong> {targetDomain}
          </p>
        </div>

        <div className={styles.disclaimer}>
          <ShieldAlert size={18} className={styles.disclaimerIcon} />
          <div className={styles.disclaimerContent}>
            <p className={styles.disclaimerTitle}>승인 필수</p>
            <p className={styles.disclaimerText}>
              취약점 스캔은 대상의 보안 취약점을 능동적으로 탐지합니다. 이
              작업은 보안 경보를 발생시킬 수 있으며 대상 시스템 성능에 영향을 줄
              수 있습니다. 진행함으로써 귀하는 <strong>대상을 소유</strong>
              하거나 소유자로부터 <strong>명시적 서면 허가</strong>를 받았음을
              확인합니다. 무단 스캔은 불법이며 형사 처벌을 받을 수 있습니다.
            </p>
          </div>
        </div>

        {hasExistingData ? (
          <div className={styles.warning}>
            <AlertTriangle size={20} className={styles.warningIcon} />
            <div className={styles.warningContent}>
              <p className={styles.warningTitle}>기존 GVM 데이터 발견</p>
              <p className={styles.warningText}>
                이 프로젝트에 <strong>{stats.totalGvmNodes}</strong>개의 GVM
                관련 노드가 있습니다. 새 취약점 스캔을 시작하면{' '}
                <strong>기존 GVM 데이터가 삭제</strong>되고 새 스캔 결과로
                대체됩니다. 정찰 데이터는 영향받지 않습니다.
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
            <p>
              GVM 데이터가 없습니다. 취약점 스캔을 시작할 준비가 되었습니다.
            </p>
            <p className={styles.readyNote}>
              GVM/OpenVAS를 사용하여 <strong>{targetDomain}</strong>을(를)
              스캔하고 감지된 기술, 취약점 및 CVE로 그래프를 채웁니다.
            </p>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            <AlertTriangle size={14} />
            <span>{error}</span>
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
                <span>{hasExistingData ? '삭제 후 스캔' : '스캔 시작'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default GvmConfirmModal;
