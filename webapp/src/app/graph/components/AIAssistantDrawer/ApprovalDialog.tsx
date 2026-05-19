'use client';

import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import type { ApprovalRequestPayload } from '@/lib/websocket-types';
import styles from './AIAssistantDrawer.module.css';

interface ApprovalDialogProps {
  awaitingApproval: boolean;
  approvalRequest: ApprovalRequestPayload | null;
  modificationText: string;
  isLoading: boolean;
  setModificationText: (v: string) => void;
  handleApproval: (decision: 'approve' | 'modify' | 'abort') => void;
}

export function ApprovalDialog({
  awaitingApproval,
  approvalRequest,
  modificationText,
  isLoading,
  setModificationText,
  handleApproval,
}: ApprovalDialogProps) {
  if (!awaitingApproval || !approvalRequest) return null;

  return (
    <div className={styles.approvalDialog}>
      <div className={styles.approvalHeader}>
        <AlertCircle size={16} />
        <span>페이즈 전환 요청</span>
      </div>
      <div className={styles.approvalContent}>
        <p className={styles.approvalTransition}>
          <span className={styles.approvalFrom}>
            {approvalRequest.from_phase}
          </span>
          <span className={styles.approvalArrow}>→</span>
          <span className={styles.approvalTo}>{approvalRequest.to_phase}</span>
        </p>

        <div className={styles.approvalDisclaimer}>
          <ShieldAlert size={16} className={styles.approvalDisclaimerIcon} />
          <p className={styles.approvalDisclaimerText}>
            이 전환은 대상에 대한 <strong>적극적인 작업</strong>을 시작합니다.
            승인으로서 대상을 <strong>소유</strong>하거나 소유자로부터{' '}
            <strong>명시적인 서면 허가</strong>를 받았음을 확인합니다. 무단
            활동은 불법이며 형사처벌을 받을 수 있습니다.
          </p>
        </div>

        <p className={styles.approvalReason}>{approvalRequest.reason}</p>

        {approvalRequest.planned_actions.length > 0 && (
          <div className={styles.approvalSection}>
            <strong>계획된 작업:</strong>
            <ul>
              {approvalRequest.planned_actions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
        )}

        {approvalRequest.risks.length > 0 && (
          <div className={styles.approvalSection}>
            <strong>위험 요소:</strong>
            <ul>
              {approvalRequest.risks.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          className={styles.modificationInput}
          placeholder="선택 사항: 수정 피드백 입력..."
          value={modificationText}
          onChange={(e) => setModificationText(e.target.value)}
        />
      </div>
      <div className={styles.approvalActions}>
        <button
          className={`${styles.approvalButton} ${styles.approvalButtonApprove}`}
          onClick={() => handleApproval('approve')}
          disabled={isLoading}
        >
          승인
        </button>
        <button
          className={`${styles.approvalButton} ${styles.approvalButtonModify}`}
          onClick={() => handleApproval('modify')}
          disabled={isLoading || !modificationText.trim()}
        >
          수정
        </button>
        <button
          className={`${styles.approvalButton} ${styles.approvalButtonAbort}`}
          onClick={() => handleApproval('abort')}
          disabled={isLoading}
        >
          중단
        </button>
      </div>
    </div>
  );
}
