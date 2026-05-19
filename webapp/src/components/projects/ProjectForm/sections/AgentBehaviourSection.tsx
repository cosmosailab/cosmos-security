'use client';

import { useState } from 'react';
import { ChevronDown, Bot, AlertTriangle } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import { useProject } from '@/providers/ProjectProvider';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { ModelPicker } from '@/components/shared/ModelPicker';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface AgentBehaviourSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function AgentBehaviourSection({
  data,
  updateField,
}: AgentBehaviourSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { userId } = useProject();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Bot size={16} />
          에이전트 동작
          <WikiInfoButton target="AgentBehaviour" />
        </h2>
        <ChevronDown
          size={16}
          className={`${styles.sectionIcon} ${isOpen ? styles.sectionIconOpen : ''}`}
        />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <p className={styles.sectionDescription}>
            자율 펜테스트를 수행하는 AI 에이전트 오케스트레이터를 설정합니다.
            LLM 모델, 페이즈 전환, 페이로드 설정, 안전 게이트를 제어합니다.
            페이즈별 도구 접근기는 도구 매트릭스 탭에서 설정합니다.
          </p>

          {/* LLM & Phase Configuration */}
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>LLM & 페이즈 설정</h3>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>LLM 모델</label>
                <ModelPicker
                  userId={userId}
                  value={data.agentOpenaiModel}
                  onChange={(id) => updateField('agentOpenaiModel', id)}
                />
                <span className={styles.fieldHint}>
                  에이전트가 사용할 모델. 전역 설정에서 프로바이더를 설정하세요.
                </span>
              </div>
            </div>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>
                  사후 익스플로잇 단계 활성화
                </span>
                <p className={styles.toggleDescription}>
                  익스플로잇 성공 후 사후 익스플로잇를 활성화합니다. 비활성화 시
                  에이전트는 익스플로잇 수행 후 중지합니다.
                </p>
              </div>
              <Toggle
                checked={data.agentActivatePostExplPhase}
                onChange={(checked) =>
                  updateField('agentActivatePostExplPhase', checked)
                }
              />
            </div>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>딥 싱크</span>
                <p className={styles.toggleDescription}>
                  활성화 시 에이전트가 주요 결정 시점(세션 시작, 페이즈 전환,
                  실패 반복)에서 다단계 공격 전략을 수립하는 명시적 심층 추론
                  스텝을 수행합니다. 해당 시점에 LLM 호출이 ~1회 추가됩니다.
                  서비스가 많은 복잡한 대상에 권장합니다.
                </p>
              </div>
              <Toggle
                checked={data.agentDeepThinkEnabled}
                onChange={(checked) =>
                  updateField('agentDeepThinkEnabled', checked)
                }
              />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  사후 익스플로잇 유형
                </label>
                <select
                  className="select"
                  value={data.agentPostExplPhaseType}
                  onChange={(e) =>
                    updateField('agentPostExplPhaseType', e.target.value)
                  }
                >
                  <option value="statefull">정상태 (Stateful)</option>
                  <option value="stateless">무상태 (Stateless)</option>
                </select>
                <span className={styles.fieldHint}>
                  정상태는 턴 간 Meterpreter/쉘 세션을 유지합니다
                </span>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                정보 수집 단계 시스템 프롬프트
              </label>
              <textarea
                className="textInput"
                value={data.agentInformationalSystemPrompt}
                onChange={(e) =>
                  updateField('agentInformationalSystemPrompt', e.target.value)
                }
                placeholder="정보 수집/정찰 단계용 커스텀 시스템 프롬프트..."
                rows={2}
              />
              <span className={styles.fieldHint}>
                정보 수집 단계에 주입됩니다. 기본값을 사용하려면 비워두세요.
              </span>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                익스플로잇 단계 시스템 프롬프트
              </label>
              <textarea
                className="textInput"
                value={data.agentExplSystemPrompt}
                onChange={(e) =>
                  updateField('agentExplSystemPrompt', e.target.value)
                }
                placeholder="익스플로잇 단계용 커스텀 시스템 프롬프트..."
                rows={2}
              />
              <span className={styles.fieldHint}>
                익스플로잇 단계에 주입됩니다. 기본값을 사용하려면 비워두세요.
              </span>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                사후 익스플로잇 단계 시스템 프롬프트
              </label>
              <textarea
                className="textInput"
                value={data.agentPostExplSystemPrompt}
                onChange={(e) =>
                  updateField('agentPostExplSystemPrompt', e.target.value)
                }
                placeholder="사후 익스플로잇 단계용 커스텀 시스템 프롬프트..."
                rows={2}
              />
              <span className={styles.fieldHint}>
                사후 익스플로잇 단계에 주입됩니다. 기본값을 사용하려면
                비워두세요.
              </span>
            </div>
          </div>

          {/* Payload Direction */}
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>페이로드 방향</h3>
            <p
              className={styles.toggleDescription}
              style={{ marginBottom: 'var(--space-2)' }}
            >
              <strong>Reverse</strong>: 대상이 공격자에게 연결 (LHOST + LPORT).{' '}
              <strong>Bind</strong>: 공격자가 대상에 연결 (LPORT 비움).
            </p>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>터널 제공자</label>
              <select
                className="textInput"
                value={
                  data.agentNgrokTunnelEnabled
                    ? 'ngrok'
                    : data.agentChiselTunnelEnabled
                      ? 'chisel'
                      : 'none'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  updateField('agentNgrokTunnelEnabled', val === 'ngrok');
                  updateField('agentChiselTunnelEnabled', val === 'chisel');
                }}
              >
                <option value="none">없음 (수동 LHOST/LPORT)</option>
                <option value="ngrok">
                  ngrok (단일 포트 — 무료, VPS 불필요)
                </option>
                <option value="chisel">chisel (다중 포트 — VPS 필요)</option>
              </select>
              <span className={styles.fieldHint}>
                {data.agentNgrokTunnelEnabled &&
                  '전역 설정 → 터널링에서 ngrok 인증 토큰을 설정하세요. 포트 4444만 터널링합니다 (핸들러). 스테이지리스 페이로드 필요. 웹 전달/HTA 미지원.'}
                {data.agentChiselTunnelEnabled &&
                  '전역 설정 → 터널링에서 chisel 서버 URL을 설정하세요. VPS에 chisel 서버가 실행 중이어야 합니다. 포트 4444 (핸들러) + 8080 (웹 전달)을 터널링합니다. 스테이지리스 페이로드 필요.'}
                {!data.agentNgrokTunnelEnabled &&
                  !data.agentChiselTunnelEnabled &&
                  '터널 없음 — 아래에서 LHOST/LPORT를 수동 설정하세요.'}
              </span>
            </div>
            {data.agentNgrokTunnelEnabled || data.agentChiselTunnelEnabled ? (
              <p
                className={styles.toggleDescription}
                style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-1)',
                }}
              >
                {data.agentNgrokTunnelEnabled &&
                  'LHOST와 LPORT가 ngrok 터널에서 자동 감지됩니다. 수동 설정 불필요.'}
                {data.agentChiselTunnelEnabled &&
                  'LHOST는 VPS 호스트명에서 파생됩니다. 핸들러 (4444)와 웹 전달 (8080) 포트 모두 터널링됩니다. 수동 설정 불필요.'}
              </p>
            ) : (
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>LHOST (공격자 IP)</label>
                  <input
                    type="text"
                    className="textInput"
                    value={data.agentLhost}
                    onChange={(e) => updateField('agentLhost', e.target.value)}
                    placeholder="e.g. 172.28.0.2"
                  />
                  <span className={styles.fieldHint}>
                    바인드 모드는 비워두세요
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>LPORT</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.agentLport || ''}
                    onChange={(e) =>
                      updateField(
                        'agentLport',
                        e.target.value === '' ? null : parseInt(e.target.value),
                      )
                    }
                    min={1}
                    max={65535}
                    placeholder="비움면 바인드 모드"
                  />
                  <span className={styles.fieldHint}>
                    바인드 모드는 비워두세요
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    대상의 바인드 포트
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.agentBindPortOnTarget || ''}
                    onChange={(e) =>
                      updateField(
                        'agentBindPortOnTarget',
                        e.target.value === '' ? null : parseInt(e.target.value),
                      )
                    }
                    min={1}
                    max={65535}
                    placeholder="비움면 에이전트가 묻습니다"
                  />
                  <span className={styles.fieldHint}>
                    불확실하면 비워두세요 (에이전트가 묻습니다)
                  </span>
                </div>
              </div>
            )}
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>페이로드 HTTPS 사용</span>
                <p className={styles.toggleDescription}>
                  reverse_tcp 대신 reverse_https를 사용합니다. 리버스
                  페이로드에만 적용됩니다.
                </p>
              </div>
              <Toggle
                checked={data.agentPayloadUseHttps}
                onChange={(checked) =>
                  updateField('agentPayloadUseHttps', checked)
                }
              />
            </div>
          </div>

          {/* Fireteam (multi-agent) */}
          {(() => {
            const fireteamEnabled = (data as any).fireteamEnabled ?? true;
            const maxConcurrent = (data as any).fireteamMaxConcurrent ?? 5;
            const maxMembers = (data as any).fireteamMaxMembers ?? 5;
            const memberMaxIter =
              (data as any).fireteamMemberMaxIterations ?? 10;
            const timeoutSec = (data as any).fireteamTimeoutSec ?? 3600;
            const propensity = (data as any).fireteamPropensity ?? 3;
            const allowedPhasesRaw = (data as any).fireteamAllowedPhases ?? [
              'informational',
              'exploitation',
              'post_exploitation',
            ];
            const allowedPhases: string[] = Array.isArray(allowedPhasesRaw)
              ? allowedPhasesRaw
              : String(allowedPhasesRaw || '')
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
            const togglePhase = (phase: string) => {
              const next = allowedPhases.includes(phase)
                ? allowedPhases.filter((p) => p !== phase)
                : [...allowedPhases, phase];
              if (next.length === 0) return; // at least one phase required
              updateField('fireteamAllowedPhases' as any, next as any);
            };
            const crossError =
              fireteamEnabled && maxConcurrent > maxMembers
                ? '최대 동시 수는 최대 멤버 수를 예속할 수 없습니다'
                : null;
            return (
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>
                  파이어팀 (멀티 에이전트)
                </h3>
                <div className={styles.fieldHint} style={{ marginBottom: 8 }}>
                  활성화 시 에이전트가 독립적인 공격 표면에 최대 N명의 전문 서브
                  에이전트를 병렬 배포할 수 있습니다. 상위 에이전트가 안전 승인
                  및 페이즈 전환을 지휘합니다.
                </div>
                <div className={styles.toggleRow}>
                  <Toggle
                    checked={fireteamEnabled}
                    onChange={(v) =>
                      updateField('fireteamEnabled' as any, v as any)
                    }
                    labelOn="파이어팀 활성화"
                    labelOff="파이어팀 비활성화"
                  />
                </div>
                {fireteamEnabled && (
                  <>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          최대 동시 멤버
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={maxConcurrent}
                          min={1}
                          max={8}
                          onChange={(e) => {
                            // Pass raw value (string or NaN) through during typing.
                            // Clamping on every keystroke makes it impossible to enter
                            // multi-digit numbers — e.g. typing `15` clamps `1` to `2`
                            // before the user can finish.
                            const raw = e.target.value;
                            updateField(
                              'fireteamMaxConcurrent' as any,
                              (raw === '' ? '' : parseInt(raw)) as any,
                            );
                          }}
                          onBlur={(e) => {
                            const n = parseInt(e.target.value);
                            const v = Number.isFinite(n)
                              ? Math.max(1, Math.min(8, n))
                              : 5;
                            updateField(
                              'fireteamMaxConcurrent' as any,
                              v as any,
                            );
                          }}
                        />
                        <span className={styles.fieldHint}>
                          1-8. 동시에 실행 중인 멤버의 상한
                        </span>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          파이어팀당 최대 멤버
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={maxMembers}
                          min={2}
                          max={8}
                          onChange={(e) => {
                            const raw = e.target.value;
                            updateField(
                              'fireteamMaxMembers' as any,
                              (raw === '' ? '' : parseInt(raw)) as any,
                            );
                          }}
                          onBlur={(e) => {
                            const n = parseInt(e.target.value);
                            const v = Number.isFinite(n)
                              ? Math.max(2, Math.min(8, n))
                              : 5;
                            updateField('fireteamMaxMembers' as any, v as any);
                          }}
                        />
                        <span className={styles.fieldHint}>
                          2-8. LLM이 요청할 수 있는 파이어팀 크기 상한
                        </span>
                      </div>
                    </div>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          멤버당 최대 반복 횟수
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={memberMaxIter}
                          min={5}
                          max={50}
                          onChange={(e) => {
                            const raw = e.target.value;
                            updateField(
                              'fireteamMemberMaxIterations' as any,
                              (raw === '' ? '' : parseInt(raw)) as any,
                            );
                          }}
                          onBlur={(e) => {
                            const n = parseInt(e.target.value);
                            const v = Number.isFinite(n)
                              ? Math.max(5, Math.min(50, n))
                              : 10;
                            updateField(
                              'fireteamMemberMaxIterations' as any,
                              v as any,
                            );
                          }}
                        />
                        <span className={styles.fieldHint}>
                          5-50. 멤버가 종료되기 전 ReAct 예산
                        </span>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          웨이브 타임아웃 (초)
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={timeoutSec}
                          min={60}
                          max={7200}
                          onChange={(e) => {
                            const raw = e.target.value;
                            updateField(
                              'fireteamTimeoutSec' as any,
                              (raw === '' ? '' : parseInt(raw)) as any,
                            );
                          }}
                          onBlur={(e) => {
                            const n = parseInt(e.target.value);
                            const v = Number.isFinite(n)
                              ? Math.max(60, Math.min(7200, n))
                              : 1800;
                            updateField('fireteamTimeoutSec' as any, v as any);
                          }}
                        />
                        <span className={styles.fieldHint}>
                          60-7200. 전체 파이어팀의 최대 실감 시간
                        </span>
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>허용 단계</label>
                      <div
                        style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                      >
                        {(
                          [
                            'informational',
                            'exploitation',
                            'post_exploitation',
                          ] as const
                        ).map((p) => (
                          <label
                            key={p}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={allowedPhases.includes(p)}
                              onChange={() => togglePhase(p)}
                            />
                            <span style={{ fontSize: '0.85rem' }}>{p}</span>
                          </label>
                        ))}
                      </div>
                      <span className={styles.fieldHint}>
                        에이전트가 파이어팀을 배포할 수 있는 단계.
                        정찰(informational)은 안전하며, 익스플로잇/사후
                        익스플로잇은 더 깊고 일반적으로 직렬요.
                      </span>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        파이어팀 경향도: <strong>{propensity}/5</strong>
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={propensity}
                        onChange={(e) => {
                          const v = Math.max(
                            1,
                            Math.min(5, parseInt(e.target.value) || 3),
                          );
                          updateField('fireteamPropensity' as any, v as any);
                        }}
                        style={{ width: '100%' }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted, #888)',
                          marginTop: 2,
                        }}
                      >
                        <span>1 - 매우 복잡한 작업만</span>
                        <span>3 - 균형 (기본값)</span>
                        <span>5 - 적극 배포</span>
                      </div>
                      <span className={styles.fieldHint}>
                        단일 에이전트나 plan_tools대비 파이어팀을 얼마나
                        선호하는지 나타내는 값. LLM이 따라야 하는 지시사항으로
                        시스템 프롬프트에 주입됩니다.
                      </span>
                    </div>
                    {crossError && (
                      <div
                        className={styles.shodanWarning}
                        style={{
                          borderColor: 'rgba(239, 68, 68, 0.4)',
                          background: 'rgba(239, 68, 68, 0.08)',
                        }}
                      >
                        <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                        <span>{crossError}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* Agent Limits */}
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>에이전트 제한</h3>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>최대 반복 횟수</label>
                <input
                  type="number"
                  className="textInput"
                  value={data.agentMaxIterations}
                  onChange={(e) =>
                    updateField(
                      'agentMaxIterations',
                      parseInt(e.target.value) || 100,
                    )
                  }
                  min={1}
                />
                <span className={styles.fieldHint}>LLM 추론 반복 한도</span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  트레이스 메모리 스텝
                </label>
                <input
                  type="number"
                  className="textInput"
                  value={data.agentExecutionTraceMemorySteps}
                  onChange={(e) =>
                    updateField(
                      'agentExecutionTraceMemorySteps',
                      parseInt(e.target.value) || 100,
                    )
                  }
                  min={1}
                />
                <span className={styles.fieldHint}>
                  컨텍스트에 유지할 이전 스텝 수
                </span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  도구 출력 최대 문자 수
                </label>
                <input
                  type="number"
                  className="textInput"
                  value={data.agentToolOutputMaxChars}
                  onChange={(e) =>
                    updateField(
                      'agentToolOutputMaxChars',
                      parseInt(e.target.value) || 20000,
                    )
                  }
                  min={1000}
                />
                <span className={styles.fieldHint}>
                  도구 출력 잠라내기 한도
                </span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>플랜 최대 병렬 도구</label>
                <input
                  type="number"
                  className="textInput"
                  value={data.agentPlanMaxParallelTools ?? 10}
                  onChange={(e) =>
                    updateField(
                      'agentPlanMaxParallelTools',
                      parseInt(e.target.value) || 10,
                    )
                  }
                  min={1}
                  max={50}
                />
                <span className={styles.fieldHint}>
                  플랜 웨이브당 동시 도구 수 (root + fireteam); 초과분은 대기열
                </span>
              </div>
            </div>
          </div>

          {/* Approval Gates */}
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>승인 게이트</h3>

            {(!data.agentRequireApprovalForExploitation ||
              !data.agentRequireApprovalForPostExploitation ||
              !(data.agentGuardrailEnabled ?? true) ||
              !(data.agentRequireToolConfirmation ?? true)) && (
              <div
                className={styles.shodanWarning}
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.08)',
                }}
              >
                <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                <span>
                  <strong>자율 운영 위험:</strong> 하나 이상의 안전 게이트가
                  비활성화되어 있습니다. AI 에이전트가 인간 승인 없이
                  익스플로잇, 사후 익스플로잇, 위험한 도구 실행 또는 범위 외
                  작업을 수행할 수 있습니다. 대상 시스템에 의도치 않은 손상을
                  일으킬 위험이 크게 증가합니다. 모든 자율 에이전트 작업에 대한
                  전적인 책임은 사용자가 집니다. 자세한 내용은{' '}
                  <a
                    href="https://github.com/samugit83/redamon/blob/master/DISCLAIMER.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    DISCLAIMER.md
                  </a>
                  를 참조하세요.
                </span>
              </div>
            )}

            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>
                  익스플로잇 단계 승인 필요
                </span>
                <p className={styles.toggleDescription}>
                  익스플로잇 단계로 전환 전 사용자 확인이 필요합니다.
                </p>
              </div>
              <Toggle
                checked={data.agentRequireApprovalForExploitation}
                onChange={(checked) =>
                  updateField('agentRequireApprovalForExploitation', checked)
                }
              />
            </div>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>
                  사후 익스플로잇 단계 승인 필요
                </span>
                <p className={styles.toggleDescription}>
                  사후 익스플로잇 단계로 전환 전 사용자 확인이 필요합니다.
                </p>
              </div>
              <Toggle
                checked={data.agentRequireApprovalForPostExploitation}
                onChange={(checked) =>
                  updateField(
                    'agentRequireApprovalForPostExploitation',
                    checked,
                  )
                }
              />
            </div>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>도구 실행 확인 필요</span>
                <p className={styles.toggleDescription}>
                  위험한 도구 (nmap, nuclei, metasploit, hydra, kali shell 등)
                  실행 전 수동 확인이 필요합니다.
                </p>
              </div>
              <Toggle
                checked={data.agentRequireToolConfirmation ?? true}
                onChange={(checked) =>
                  updateField('agentRequireToolConfirmation', checked)
                }
              />
            </div>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>에이전트 가드레일</span>
                <p className={styles.toggleDescription}>
                  세션 시작 시 대상 권한을 검증하고 에이전트 프롬프트에 범위
                  제한을 적용합니다. 잘 알려진 공개 대상에 대한 작업을 차단하고
                  범위 외 작업을 저지합니다. 정부, 군사, 교육, 국제 기관
                  도메인(.gov, .mil, .edu, .int)은 이 설정과 무관하게 항상
                  차단됩니다.
                </p>
              </div>
              <Toggle
                checked={data.agentGuardrailEnabled ?? true}
                onChange={(checked) =>
                  updateField('agentGuardrailEnabled', checked)
                }
              />
            </div>
          </div>

          {/* Kali Shell — Library Installation */}
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>
              Kali Shell — 라이브러리 설치
            </h3>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>라이브러리 설치 허용</span>
                <p className={styles.toggleDescription}>
                  펜테스트 중 kali_shell에서 에이전트가 패키지(pip/apt)를 설치할
                  수 있도록 합니다. 설치된 패키지는 임시적입니다 — 컨테이너
                  재시작 시 사라집니다.
                </p>
              </div>
              <Toggle
                checked={data.agentKaliInstallEnabled}
                onChange={(checked) =>
                  updateField('agentKaliInstallEnabled', checked)
                }
              />
            </div>
            {data.agentKaliInstallEnabled && (
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>허가된 패키지</label>
                  <textarea
                    className="textInput"
                    value={data.agentKaliInstallAllowedPackages}
                    onChange={(e) =>
                      updateField(
                        'agentKaliInstallAllowedPackages',
                        e.target.value,
                      )
                    }
                    rows={2}
                    placeholder="e.g. pyftpdlib, scapy, droopescan"
                  />
                  <span className={styles.fieldHint}>
                    콤마 구분 화이트리스트. 비어 있지 않으면 이 패키지만 설치
                    가능합니다.
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>금지된 패키지</label>
                  <textarea
                    className="textInput"
                    value={data.agentKaliInstallForbiddenPackages}
                    onChange={(e) =>
                      updateField(
                        'agentKaliInstallForbiddenPackages',
                        e.target.value,
                      )
                    }
                    rows={2}
                    placeholder="e.g. metasploit-framework, cobalt-strike"
                  />
                  <span className={styles.fieldHint}>
                    콤마 구분 블랙리스트. 이 패키지는 절대 설치해서는 안 됩니다.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Retries, Logging & Debug */}
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>재시도, 로깅 & 디버그</h3>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Cypher 최대 재시도</label>
                <input
                  type="number"
                  className="textInput"
                  value={data.agentCypherMaxRetries}
                  onChange={(e) =>
                    updateField(
                      'agentCypherMaxRetries',
                      parseInt(e.target.value) || 3,
                    )
                  }
                  min={0}
                  max={10}
                />
                <span className={styles.fieldHint}>Neo4j 쿼리 재시도 횟수</span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>로그 최대 MB</label>
                <input
                  type="number"
                  className="textInput"
                  value={data.agentLogMaxMb}
                  onChange={(e) =>
                    updateField('agentLogMaxMb', parseInt(e.target.value) || 10)
                  }
                  min={1}
                />
                <span className={styles.fieldHint}>로그 파일 최대 크기</span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>로그 백업</label>
                <input
                  type="number"
                  className="textInput"
                  value={data.agentLogBackupCount}
                  onChange={(e) =>
                    updateField(
                      'agentLogBackupCount',
                      parseInt(e.target.value) || 5,
                    )
                  }
                  min={0}
                />
                <span className={styles.fieldHint}>보관할 순환 백업 수</span>
              </div>
            </div>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>
                  초기화 시 그래프 이미지 생성
                </span>
                <p className={styles.toggleDescription}>
                  에이전트 시작 시 LangGraph 시각화를 생성합니다. 디버깅에
                  유용합니다.
                </p>
              </div>
              <Toggle
                checked={data.agentCreateGraphImageOnInit}
                onChange={(checked) =>
                  updateField('agentCreateGraphImageOnInit', checked)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
