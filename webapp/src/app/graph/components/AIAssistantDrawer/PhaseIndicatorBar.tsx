'use client';

import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Swords,
  Check,
  Settings,
  Lightbulb,
  Server,
  Zap,
} from 'lucide-react';
import { StealthIcon } from '@/components/icons/StealthIcon';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import { useProject } from '@/providers/ProjectProvider';
import {
  PHASE_CONFIG,
  getAttackPathConfig,
  formatModelDisplay,
} from './phaseConfig';
import type { Phase } from './types';
import styles from './AIAssistantDrawer.module.css';

const ALL_PHASES = [
  'informational',
  'exploitation',
  'post_exploitation',
] as const;

interface SkillData {
  builtIn: Array<{ id: string; name: string }>;
  user: Array<{ id: string; name: string }>;
  config: { builtIn: Record<string, boolean>; user: Record<string, boolean> };
}

interface UserMcpServer {
  id: string;
  name?: string;
  enabled?: boolean;
  default_phases?: string[];
  tools?: Array<{ name: string; default_phases?: string[] | null }>;
}

interface PhaseIndicatorBarProps {
  currentPhase: Phase;
  toolPhaseMap?: Record<string, string[]>;
  attackPathType: string;
  skillData: SkillData | null;
  iterationCount: number;
  stealthMode: boolean;
  onToggleStealth?: (v: boolean) => void;
  deepThinkEnabled: boolean;
  onToggleDeepThink?: (v: boolean) => void;
  autoAccept?: boolean;
  onToggleAutoAccept?: (v: boolean) => void;
  settingsDropdownRef: React.RefObject<HTMLDivElement | null>;
  showSettingsDropdown: boolean;
  setShowSettingsDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsModal: (v: 'agent' | 'toolmatrix' | 'attack' | null) => void;
  modelName?: string;
  setShowModelModal: (v: boolean) => void;
}

export function PhaseIndicatorBar({
  currentPhase,
  toolPhaseMap,
  attackPathType,
  skillData,
  iterationCount,
  stealthMode,
  onToggleStealth,
  deepThinkEnabled,
  onToggleDeepThink,
  autoAccept = false,
  onToggleAutoAccept,
  settingsDropdownRef,
  showSettingsDropdown,
  setShowSettingsDropdown,
  setSettingsModal,
  modelName,
  setShowModelModal,
}: PhaseIndicatorBarProps) {
  const PhaseIcon = PHASE_CONFIG[currentPhase].icon;
  const { userId } = useProject();
  const [userMcpServers, setUserMcpServers] = useState<UserMcpServer[]>([]);

  // Pull the user's saved MCP servers from the DB so MCP tools always
  // appear in the wrench tooltip — even when the user hasn't explicitly
  // toggled their phase checkboxes (in which case they're not in
  // toolPhaseMap and would otherwise be invisible).
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/mcp`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { servers?: UserMcpServer[] } | null) => {
        if (d?.servers && Array.isArray(d.servers)) {
          setUserMcpServers(d.servers);
        }
      })
      .catch(() => {});
  }, [userId]);

  return (
    <div className={styles.phaseIndicator}>
      <div
        className={styles.phaseBadge}
        style={{
          backgroundColor: PHASE_CONFIG[currentPhase].bgColor,
          borderColor: PHASE_CONFIG[currentPhase].color,
        }}
      >
        <PhaseIcon
          size={14}
          style={{ color: PHASE_CONFIG[currentPhase].color }}
        />
        <span style={{ color: PHASE_CONFIG[currentPhase].color }}>
          {PHASE_CONFIG[currentPhase].label}
        </span>
      </div>

      {(() => {
        // Built-in (and explicitly toggled) tools — same logic as before.
        const builtInTools: string[] = toolPhaseMap
          ? Object.entries(toolPhaseMap)
              .filter(([, phases]) => phases.includes(currentPhase))
              .map(([name]) => name)
          : [];

        // User MCP tools whose default_phases (with per-tool override) include
        // the current phase AND are NOT already in toolPhaseMap (which would
        // mean the user explicitly toggled them — project override wins).
        const explicitlyToggled = new Set(Object.keys(toolPhaseMap || {}));
        const mcpTools: Array<{ name: string; serverName: string }> = [];
        for (const srv of userMcpServers) {
          if (srv.enabled === false) continue;
          const serverDefault = srv.default_phases ?? [...ALL_PHASES];
          for (const t of srv.tools || []) {
            if (explicitlyToggled.has(t.name)) continue; // shown above
            const phases =
              t.default_phases && t.default_phases.length > 0
                ? t.default_phases
                : serverDefault;
            if (phases.includes(currentPhase)) {
              mcpTools.push({ name: t.name, serverName: srv.name || srv.id });
            }
          }
        }

        if (builtInTools.length === 0 && mcpTools.length === 0) return null;

        return (
          <Tooltip
            position="bottom"
            interactive
            content={
              <div className={styles.phaseToolsTooltip}>
                <div className={styles.phaseToolsHeader}>페이즈 도구</div>
                {builtInTools.map((t) => (
                  <div key={t} className={styles.phaseToolsItem}>
                    {t}
                  </div>
                ))}
                {mcpTools.length > 0 && (
                  <>
                    <div
                      className={styles.phaseToolsHeader}
                      style={{
                        marginTop: 6,
                        paddingTop: 6,
                        borderTop: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Server size={10} /> MCP 도구 플러그인
                    </div>
                    {mcpTools.map((t) => (
                      <div key={t.name} className={styles.phaseToolsItem}>
                        {t.name}
                        <span
                          style={{
                            marginLeft: 6,
                            opacity: 0.55,
                            fontSize: '10px',
                          }}
                        >
                          {t.serverName}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            }
          >
            <Wrench size={13} className={styles.phaseToolsIcon} />
          </Tooltip>
        );
      })()}

      {attackPathType &&
        (currentPhase === 'informational' ||
          currentPhase === 'exploitation' ||
          currentPhase === 'post_exploitation') && (
          <Tooltip
            position="bottom"
            content={
              <div className={styles.skillTooltip}>
                <div className={styles.skillTooltipHeader}>
                  <Swords size={11} />
                  에이전트 스킬
                </div>
                {skillData && (
                  <>
                    <div className={styles.skillTooltipGroup}>
                      <div className={styles.skillTooltipGroupLabel}>내장</div>
                      {skillData.builtIn.map((s) => {
                        const enabled =
                          skillData.config.builtIn[s.id] !== false;
                        const isActive = attackPathType === s.id;
                        return (
                          <div
                            key={s.id}
                            className={`${styles.skillTooltipItem} ${!enabled ? styles.skillTooltipItemDisabled : ''} ${isActive ? styles.skillTooltipItemActive : ''}`}
                          >
                            <span className={styles.skillTooltipName}>
                              {s.name}
                            </span>
                            {isActive && (
                              <Check
                                size={11}
                                className={styles.skillTooltipCheck}
                              />
                            )}
                            {!enabled && (
                              <span className={styles.skillTooltipOff}>
                                꺼짐
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {skillData.user.length > 0 && (
                      <div className={styles.skillTooltipGroup}>
                        <div className={styles.skillTooltipGroupLabel}>
                          사용자 스킬
                        </div>
                        {skillData.user.map((s) => {
                          const enabled = skillData.config.user[s.id] !== false;
                          const isActive =
                            attackPathType === `user_skill:${s.id}`;
                          return (
                            <div
                              key={s.id}
                              className={`${styles.skillTooltipItem} ${!enabled ? styles.skillTooltipItemDisabled : ''} ${isActive ? styles.skillTooltipItemActive : ''}`}
                            >
                              <span className={styles.skillTooltipName}>
                                {s.name}
                              </span>
                              {isActive && (
                                <Check
                                  size={11}
                                  className={styles.skillTooltipCheck}
                                />
                              )}
                              {!enabled && (
                                <span className={styles.skillTooltipOff}>
                                  꺼짐
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            }
          >
            <div
              className={styles.phaseBadge}
              style={{
                backgroundColor: getAttackPathConfig(attackPathType).bgColor,
                borderColor: getAttackPathConfig(attackPathType).color,
              }}
            >
              <span
                style={{ color: getAttackPathConfig(attackPathType).color }}
              >
                {getAttackPathConfig(attackPathType).shortLabel}
              </span>
            </div>
          </Tooltip>
        )}

      {iterationCount > 0 && (
        <span className={styles.iterationCount}>단계 {iterationCount}</span>
      )}

      {onToggleStealth ? (
        <button
          className={`${styles.stealthToggle} ${stealthMode ? styles.stealthToggleActive : ''}`}
          onClick={() => onToggleStealth(!stealthMode)}
          title={
            stealthMode
              ? '스텔스 모드 켜짐 — 클릭하여 비활성화'
              : '스텔스 모드 꺼짐 — 클릭하여 수동 전용 기술 활성화'
          }
        >
          <StealthIcon size={11} />
        </button>
      ) : stealthMode ? (
        <span
          className={styles.stealthBadge}
          title="스텔스 모드 — 수동/저소음 기법만 사용"
        >
          <StealthIcon size={11} />
        </span>
      ) : null}

      {onToggleDeepThink ? (
        <button
          className={`${styles.deepThinkToggle} ${deepThinkEnabled ? styles.deepThinkToggleActive : ''}`}
          onClick={() => onToggleDeepThink(!deepThinkEnabled)}
          title={
            deepThinkEnabled
              ? '딥 싱크 켜짐 — 에이전트가 주요 결정 시점에서 전략적 추론을 수행합니다. 클릭하여 비활성화.'
              : '딥 싱크 꺼짐 — 클릭하여 주요 결정 시점에서 전략적 추론 활성화. 시작, 페이즈 전환, 실패 반복 시 추가 LLM 호출 추가.'
          }
        >
          <Lightbulb size={11} />
        </button>
      ) : deepThinkEnabled ? (
        <span
          className={styles.deepThinkBadge}
          title="깊은 사고 — 주요 결정 시점에서 전략적 추론"
        >
          <Lightbulb size={11} />
        </span>
      ) : null}

      {onToggleAutoAccept && (
        <button
          className={`${styles.autoAcceptToggle} ${autoAccept ? styles.autoAcceptToggleActive : ''}`}
          onClick={() => onToggleAutoAccept(!autoAccept)}
          title={
            autoAccept
              ? '자동 승인 켜짐 — 도구 실행 및 페이즈 전환을 자동 승인합니다. 클릭하여 비활성화.'
              : '자동 승인 꺼짐 — 클릭하여 도구/페이즈 확인을 자동 승인 모드로 전환.'
          }
        >
          <Zap size={11} />
        </button>
      )}

      <div className={styles.settingsWrapper} ref={settingsDropdownRef}>
        <button
          className={styles.settingsButton}
          onClick={() => setShowSettingsDropdown((prev) => !prev)}
          title="에이전트 설정"
        >
          <Settings size={12} />
        </button>
        {showSettingsDropdown && (
          <div className={styles.settingsDropdown}>
            <button
              className={styles.settingsDropdownItem}
              onClick={() => {
                setSettingsModal('agent');
                setShowSettingsDropdown(false);
              }}
            >
              에이전트 동작
            </button>
            <button
              className={styles.settingsDropdownItem}
              onClick={() => {
                setSettingsModal('toolmatrix');
                setShowSettingsDropdown(false);
              }}
            >
              도구 매트릭스
            </button>
            <button
              className={styles.settingsDropdownItem}
              onClick={() => {
                setSettingsModal('attack');
                setShowSettingsDropdown(false);
              }}
            >
              에이전트 스킬
            </button>
          </div>
        )}
      </div>

      {modelName && (
        <button
          className={styles.modelBadge}
          onClick={() => setShowModelModal(true)}
        >
          {formatModelDisplay(modelName)}
        </button>
      )}
    </div>
  );
}
