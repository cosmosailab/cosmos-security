/**
 * Plan Wave Card Component
 *
 * Displays a wave of parallel tool executions as a single grouped card.
 * Contains nested ToolExecutionCard components for each tool in the wave.
 */

'use client';

import { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import styles from './PlanWaveCard.module.css';
import { ToolExecutionCard } from './ToolExecutionCard';
import type { PlanWaveItem } from './AgentTimeline';

interface PlanWaveCardProps {
  item: PlanWaveItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  missingApiKeys?: Set<string>;
  onAddApiKey?: (toolId: string) => void;
  onApprove?: () => void;
  onReject?: () => void;
  /** Cancel a single running tool inside this wave. Receives the tool's item.id. */
  onToolStop?: (itemId: string) => void;
}

export function PlanWaveCard({
  item,
  isExpanded,
  onToggleExpand,
  missingApiKeys,
  onAddApiKey,
  onApprove,
  onReject,
  onToolStop,
}: PlanWaveCardProps) {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const toggleToolExpand = (toolId: string) => {
    setExpandedTools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'running':
      case 'pending_approval':
        return (
          <Loader2
            size={14}
            className={`${styles.statusIcon} ${styles.spinner}`}
          />
        );
      case 'success':
        return (
          <CheckCircle2
            size={14}
            className={`${styles.statusIcon} ${styles.successIcon}`}
          />
        );
      case 'partial':
        return (
          <AlertTriangle
            size={14}
            className={`${styles.statusIcon} ${styles.partialIcon}`}
          />
        );
      case 'error':
        return (
          <XCircle
            size={14}
            className={`${styles.statusIcon} ${styles.errorIcon}`}
          />
        );
      default:
        return null;
    }
  };

  const completedCount = item.tools.filter(
    (t) => t.status !== 'running',
  ).length;
  const successCount = item.tools.filter((t) => t.status === 'success').length;

  const getStatusText = () => {
    switch (item.status) {
      case 'running':
        return `실행 중 ${completedCount}/${item.tool_count}`;
      case 'pending_approval':
        return '승인 대기 중';
      case 'success':
        return `${successCount}/${item.tool_count} 완료`;
      case 'partial':
        return `${successCount}/${item.tool_count} 성공`;
      case 'error':
        return '실패';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    switch (item.status) {
      case 'running':
        return styles.statusRunning;
      case 'pending_approval':
        return styles.statusPendingApproval;
      case 'success':
        return styles.statusSuccess;
      case 'partial':
        return styles.statusPartial;
      case 'error':
        return styles.statusError;
      default:
        return '';
    }
  };

  const toolNames = item.tools.map((t) => t.tool_name).join(', ');

  return (
    <div className={`${styles.card} ${getStatusClass()}`}>
      <div className={styles.cardHeaderWrapper} onClick={onToggleExpand}>
        <div className={styles.cardHeaderTop}>
          <div className={styles.cardIcon}>
            <Layers size={14} className={styles.waveIcon} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.titleText}>
              웨이브 — {item.tool_count}개 도구
            </span>
            {!isExpanded && (
              <span className={styles.toolNamesPreview}>{toolNames}</span>
            )}
          </div>
          <div className={styles.cardActions}>
            <div className={styles.statusBadge}>
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
            {item.status === 'pending_approval' && onApprove && (
              <div className={styles.confirmActions}>
                <button
                  className={styles.allowBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove();
                  }}
                >
                  허용
                </button>
                <button
                  className={styles.denyBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject?.();
                  }}
                >
                  거부
                </button>
              </div>
            )}
            <button className={styles.expandButton}>
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          </div>
        </div>
        {!isExpanded && item.plan_rationale && (
          <p className={styles.rationalePreview}>{item.plan_rationale}</p>
        )}
      </div>

      {isExpanded && (
        <div className={styles.cardContent}>
          {item.plan_rationale && (
            <p className={styles.rationale}>{item.plan_rationale}</p>
          )}
          <div className={styles.toolsContainer}>
            {item.tools.map((tool) => (
              <ToolExecutionCard
                key={tool.id}
                item={tool}
                isExpanded={expandedTools.has(tool.id)}
                onToggleExpand={() => toggleToolExpand(tool.id)}
                missingApiKey={missingApiKeys?.has(tool.tool_name)}
                onAddApiKey={
                  onAddApiKey ? () => onAddApiKey(tool.tool_name) : undefined
                }
                onStop={onToolStop ? () => onToolStop(tool.id) : undefined}
              />
            ))}
          </div>

          {/* Wave Analysis (from think_node) */}
          {item.interpretation && (
            <div className={styles.analysisSection}>
              <div className={styles.analysisSectionLabel}>분석</div>
              <p className={styles.analysisText}>{item.interpretation}</p>
            </div>
          )}

          {/* Actionable Findings */}
          {item.actionable_findings && item.actionable_findings.length > 0 && (
            <div className={styles.analysisSection}>
              <div className={styles.analysisSectionLabel}>
                실행 가능한 발견사항
              </div>
              <ul className={styles.findingsList}>
                {item.actionable_findings.map((finding, index) => (
                  <li key={index} className={styles.findingItem}>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Next Steps */}
          {item.recommended_next_steps &&
            item.recommended_next_steps.length > 0 && (
              <div className={styles.analysisSection}>
                <div className={styles.analysisSectionLabel}>
                  권장 다음 단계
                </div>
                <ul className={styles.stepsList}>
                  {item.recommended_next_steps.map((step, index) => (
                    <li key={index} className={styles.stepItem}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
