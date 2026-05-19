/**
 * Thinking Card Component
 *
 * Displays agent's thought process, reasoning, and action decisions.
 */

'use client';

import { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import styles from './ThinkingCard.module.css';
import { TodoListWidget } from './TodoListWidget';
import { formatTokenCount } from '@/lib/formatTokens';
import type { ThinkingItem } from './AgentTimeline';

interface ThinkingCardProps {
  item: ThinkingItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function ThinkingCard({
  item,
  isExpanded,
  onToggleExpand,
}: ThinkingCardProps) {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showRawThought, setShowRawThought] = useState(false);
  const inTok = item.input_tokens ?? 0;
  const outTok = item.output_tokens ?? 0;
  const hasTokens = inTok > 0 || outTok > 0;

  // Extract a clean summary from the raw thought text
  // Strips JSON blobs, code blocks, URLs, and excessive technical detail
  const cleanThought = (() => {
    const raw = item.thought || '';
    if (!raw.trim()) return '';
    // Take only the first meaningful paragraph/sentence before JSON/code starts
    // Common patterns: thought contains natural language then dumps JSON tool_plan, code, etc.
    const lines = raw.split('\n');
    const cleanLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      // Stop at JSON-like content, code, or very long URLs
      if (
        trimmed.startsWith('{') ||
        trimmed.startsWith('[') ||
        trimmed.startsWith('```')
      )
        break;
      if (
        trimmed.startsWith('import ') ||
        trimmed.startsWith('from ') ||
        trimmed.startsWith('def ')
      )
        break;
      if (trimmed.match(/^https?:\/\/.{80,}/)) break;
      // Skip lines that are clearly raw data (base64, hex, very long single tokens)
      if (trimmed.length > 300 && !trimmed.includes(' ')) break;
      cleanLines.push(line);
    }
    const result = cleanLines.join('\n').trim();
    // If we stripped everything, just take the first 200 chars
    if (!result && raw.length > 0) {
      return raw.slice(0, 200) + (raw.length > 200 ? '…' : '');
    }
    return result;
  })();

  const hasRawExtra = cleanThought.length < (item.thought || '').trim().length;

  const handleCopy = async () => {
    try {
      const data = {
        thought: item.thought,
        reasoning: item.reasoning,
        action: item.action,
        tool_name: item.tool_name,
        tool_args: item.tool_args,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeaderWrapper} onClick={onToggleExpand}>
        <div className={styles.cardHeaderTop}>
          <div className={styles.cardIcon}>
            <Brain size={14} className={styles.thinkingIcon} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.titleText}>생각 중</span>
            {item.action && item.action !== 'thinking' && (
              <span className={styles.actionBadge}>{item.action}</span>
            )}
            {hasTokens && (
              <span className={styles.tokenMeta} title="이 단계의 LLM 사용량">
                입력 {formatTokenCount(inTok)} · 출력 {formatTokenCount(outTok)}
              </span>
            )}
          </div>
          <div className={styles.cardActions}>
            <button
              className={styles.copyButton}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              title="JSON 복사"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            <button className={styles.expandButton}>
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          </div>
        </div>
        {!isExpanded && (
          <div className={styles.compactPreview}>
            {item.thought && item.thought.trim() && (
              <p className={styles.previewText}>{item.thought}</p>
            )}
            {item.reasoning && item.reasoning.trim() && (
              <p className={styles.previewReasoning}>→ {item.reasoning}</p>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className={styles.cardContent}>
          {/* Thought */}
          {item.thought && item.thought.trim() && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>생각</div>
              <div className={styles.sectionContent}>
                <p className={styles.text}>{item.thought}</p>
              </div>
            </div>
          )}

          {/* Reasoning */}
          {item.reasoning && item.reasoning.trim() && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>추론</div>
              <div className={styles.sectionContent}>
                <p className={styles.text}>{item.reasoning}</p>
              </div>
            </div>
          )}

          {/* Action (skip redundant "thinking" label) */}
          {item.action && item.action !== 'thinking' && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>행동</div>
              <div className={styles.sectionContent}>
                <span className={styles.badge}>{item.action}</span>
                {item.tool_name && (
                  <>
                    <span className={styles.separator}>→</span>
                    <span className={styles.toolName}>{item.tool_name}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Todo List */}
          {item.updated_todo_list && item.updated_todo_list.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>작업</div>
              <div className={styles.sectionContent}>
                <TodoListWidget items={item.updated_todo_list} />
              </div>
            </div>
          )}

          {/* Model Reasoning Content (raw chain-of-thought) */}
          {item.reasoning_content && item.reasoning_content.trim() && (
            <div className={styles.section}>
              <button
                className={styles.reasoningToggle}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReasoning(!showReasoning);
                }}
              >
                {showReasoning ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
                <span>모델 추론 과정</span>
              </button>
              {showReasoning && (
                <div className={styles.sectionContent}>
                  <pre className={styles.reasoningBlock}>
                    {item.reasoning_content}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
