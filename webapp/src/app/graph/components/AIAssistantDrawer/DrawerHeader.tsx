'use client';

import React, { useMemo } from 'react';
import {
  Bot,
  Wifi,
  WifiOff,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  History,
  Plus,
  Download,
  FolderOpen,
} from 'lucide-react';
import { ConnectionStatus } from '@/lib/websocket-types';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import { ConversationHistory } from './ConversationHistory';
import { formatTokenCount } from '@/lib/formatTokens';
import type { Conversation } from '@/hooks/useConversations';
import type { ChatItem } from './types';
import styles from './AIAssistantDrawer.module.css';

interface DrawerHeaderProps {
  status: ConnectionStatus;
  reconnectAttempt: number;
  sessionId: string;
  requireToolConfirmation: boolean;
  hasOtherChains: boolean;
  isOtherChainsHidden: boolean;
  onToggleOtherChains?: () => void;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  handleNewChat: () => void;
  handleDownloadMarkdown: () => void | Promise<void>;
  chatItems: ChatItem[];
  onClose: () => void;
  onOpenFileSystem?: () => void;
  conversations: Conversation[];
  handleSelectConversation: (conv: Conversation) => void;
  handleDeleteConversation: (id: string) => void;
  handleHistoryNewChat: () => void;
}

export function DrawerHeader({
  status,
  reconnectAttempt,
  sessionId,
  requireToolConfirmation,
  hasOtherChains,
  isOtherChainsHidden,
  onToggleOtherChains,
  showHistory,
  setShowHistory,
  handleNewChat,
  handleDownloadMarkdown,
  chatItems,
  onClose,
  onOpenFileSystem,
  conversations,
  handleSelectConversation,
  handleDeleteConversation,
  handleHistoryNewChat,
}: DrawerHeaderProps) {
  const getConnectionStatusColor = () =>
    status === ConnectionStatus.CONNECTED ? '#10b981' : '#ef4444';

  const getConnectionStatusIcon = () => {
    const color = getConnectionStatusColor();
    if (status === ConnectionStatus.CONNECTED) {
      return (
        <Wifi size={12} className={styles.connectionIcon} style={{ color }} />
      );
    } else if (status === ConnectionStatus.RECONNECTING) {
      return (
        <Loader2
          size={12}
          className={`${styles.connectionIcon} ${styles.spinner}`}
          style={{ color }}
        />
      );
    } else {
      return (
        <WifiOff
          size={12}
          className={styles.connectionIcon}
          style={{ color }}
        />
      );
    }
  };

  const getConnectionStatusText = () => {
    switch (status) {
      case ConnectionStatus.CONNECTING:
        return '연결 중...';
      case ConnectionStatus.CONNECTED:
        return '연결됨';
      case ConnectionStatus.RECONNECTING:
        return `다시 연결 중... (${reconnectAttempt}/5)`;
      case ConnectionStatus.FAILED:
        return '연결 실패';
      case ConnectionStatus.DISCONNECTED:
        return '연결 해제됨';
    }
  };

  // Sum LLM tokens across every root think + every fireteam member. Root
  // ThinkingItems carry per-turn deltas; fireteam members track cumulative
  // totals on the panel. Summing both gives the session-wide total.
  const { totalInput, totalOutput } = useMemo(() => {
    let inTot = 0;
    let outTot = 0;
    for (const item of chatItems) {
      if (!('type' in item)) continue;
      if (item.type === 'thinking') {
        inTot += item.input_tokens ?? 0;
        outTot += item.output_tokens ?? 0;
      } else if (item.type === 'fireteam') {
        for (const m of item.members) {
          inTot += m.input_tokens_used ?? 0;
          outTot += m.output_tokens_used ?? 0;
        }
      }
    }
    return { totalInput: inTot, totalOutput: outTot };
  }, [chatItems]);
  const hasTokenTotal = totalInput > 0 || totalOutput > 0;

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Bot size={16} />
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.title}>AI 에이전트</h2>
            <div className={styles.connectionStatus}>
              {getConnectionStatusIcon()}
              <span
                className={styles.subtitle}
                style={{ color: getConnectionStatusColor() }}
              >
                {getConnectionStatusText()}
              </span>
              <span className={styles.sessionCode} title={sessionId}>
                세션: {sessionId.slice(-8)}
              </span>
              {hasTokenTotal && (
                <Tooltip
                  content={`세션 LLM 사용량 · 입력 ${totalInput.toLocaleString()} · 출력 ${totalOutput.toLocaleString()}`}
                >
                  <span className={styles.tokenTotal}>
                    in {formatTokenCount(totalInput)} · out{' '}
                    {formatTokenCount(totalOutput)}
                  </span>
                </Tooltip>
              )}
              {!requireToolConfirmation && (
                <Tooltip content="도구 확인이 비활성화되어 있습니다. 위험한 도구가 수동 승인 없이 실행됩니다.">
                  <div className={styles.dangerBadge}>
                    <AlertTriangle size={12} />
                    <span>자동 실행</span>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          {hasOtherChains && onToggleOtherChains && (
            <button
              className={`${styles.iconButton} ${isOtherChainsHidden ? styles.iconButtonActive : ''}`}
              onClick={onToggleOtherChains}
              title={
                isOtherChainsHidden
                  ? '그래프에서 모든 세션 표시'
                  : '그래프에서 이 세션만 표시'
              }
              aria-label={
                isOtherChainsHidden
                  ? '그래프에서 모든 세션 표시'
                  : '그래프에서 이 세션만 표시'
              }
            >
              {isOtherChainsHidden ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
          <button
            className={styles.iconButton}
            onClick={() => setShowHistory(!showHistory)}
            title="세션 기록"
            aria-label="세션 기록"
          >
            <History size={14} />
          </button>
          <button
            className={styles.iconButton}
            onClick={handleNewChat}
            title="새 세션"
            aria-label="새 세션 시작"
          >
            <Plus size={14} />
          </button>
          <button
            className={styles.iconButton}
            onClick={handleDownloadMarkdown}
            title="채팅을 마크다운으로 다운로드"
            aria-label="채팅을 마크다운으로 다운로드"
            disabled={chatItems.length === 0}
          >
            <Download size={14} />
          </button>
          {onOpenFileSystem && (
            <button
              className={styles.iconButton}
              onClick={onOpenFileSystem}
              title="작업 공간 열기 (파일 + 작업)"
              aria-label="작업 공간 열기"
            >
              <FolderOpen size={14} />
            </button>
          )}
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="어시스턴트 닫기"
          >
            &times;
          </button>
        </div>
      </div>

      {showHistory && (
        <ConversationHistory
          conversations={conversations}
          currentSessionId={sessionId}
          onBack={() => setShowHistory(false)}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
          onNewChat={handleHistoryNewChat}
        />
      )}
    </>
  );
}
