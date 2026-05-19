'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Target, ShieldAlert, AlertTriangle } from 'lucide-react';
import { AiToggleLabel } from '../AiToggleLabel';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import { isHardBlockedDomain } from '@/lib/hard-guardrail';
import { FileImportButton } from '../FileImportButton';
import { ModelPicker } from '@/components/shared/ModelPicker';
import { useProject } from '@/providers/ProjectProvider';
import styles from '../ProjectForm.module.css';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface TargetSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  mode?: 'create' | 'edit';
}

// Helper to convert stored format (with dots) to display format (without dots)
function toDisplayPrefixes(subdomainList: string[]): string {
  return subdomainList
    .filter((s) => s !== '.') // Exclude root domain marker
    .map((s) => (s.endsWith('.') ? s.slice(0, -1) : s)) // Remove trailing dot
    .join(', ');
}

// Helper to convert display format to stored format (with trailing dots)
function toStoredPrefixes(
  displayValue: string,
  includeRoot: boolean,
): string[] {
  const prefixes = displayValue
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith('.') ? s : s + '.')); // Add trailing dot if missing

  if (includeRoot) {
    prefixes.push('.');
  }

  return prefixes;
}

// Helper to parse IP textarea into array
function parseIpList(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TargetSection({
  data,
  updateField,
  mode = 'create',
}: TargetSectionProps) {
  const isLocked = mode === 'edit';
  const [isOpen, setIsOpen] = useState(true);
  const { userId } = useProject();

  const ipMode = data.ipMode || false;

  // Check if root domain is included in the list
  const includesRootDomain = useMemo(
    () => data.subdomainList.includes('.'),
    [data.subdomainList],
  );

  // Display value without dots
  const displayPrefixes = useMemo(
    () => toDisplayPrefixes(data.subdomainList),
    [data.subdomainList],
  );

  // Local editing state for subdomain prefixes — keeps commas while typing
  const [localPrefixes, setLocalPrefixes] = useState(displayPrefixes);
  const [isPrefixFocused, setIsPrefixFocused] = useState(false);

  // Sync local state when external data changes (preset load, file import, etc.)
  useEffect(() => {
    if (!isPrefixFocused) {
      setLocalPrefixes(displayPrefixes);
    }
  }, [displayPrefixes, isPrefixFocused]);

  // Display value for IP textarea
  const displayIps = useMemo(
    () => (data.targetIps || []).join('\n'),
    [data.targetIps],
  );

  // Hard guardrail: deterministic check for government/public domains (non-disableable)
  const hardBlockResult = useMemo(
    () =>
      !ipMode && data.targetDomain
        ? isHardBlockedDomain(data.targetDomain)
        : { blocked: false, reason: '' },
    [ipMode, data.targetDomain],
  );

  const handlePrefixesChange = (value: string) => {
    setLocalPrefixes(value);
  };

  const handlePrefixesBlur = () => {
    setIsPrefixFocused(false);
    updateField(
      'subdomainList',
      toStoredPrefixes(localPrefixes, includesRootDomain),
    );
  };

  const handlePrefixesFocus = () => {
    setIsPrefixFocused(true);
  };

  const handleRootDomainToggle = (checked: boolean) => {
    const currentPrefixes = isPrefixFocused ? localPrefixes : displayPrefixes;
    updateField('subdomainList', toStoredPrefixes(currentPrefixes, checked));
  };

  const handleIpModeToggle = (checked: boolean) => {
    updateField('ipMode', checked);
    if (checked) {
      updateField('targetDomain', '');
      updateField('subdomainList', []);
    } else {
      updateField('targetIps', []);
    }
  };

  const handleIpsChange = (text: string) => {
    updateField('targetIps', parseIpList(text));
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Target size={16} />
          타겟 설정
          <WikiInfoButton target="Target" />
        </h2>
        <ChevronDown
          size={16}
          className={`${styles.sectionIcon} ${isOpen ? styles.sectionIconOpen : ''}`}
        />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <p className={styles.sectionDescription}>
            보안 평가의 주요 대상을 정의합니다. 도메인 기반 또는 IP 기반 타겟팅
            모드를 선택하세요.
          </p>

          {/* IP Mode Toggle - locked in edit mode */}
          <div className={styles.toggleRow}>
            <div>
              <span className={styles.toggleLabel}>IP부터 시작</span>
              <p className={styles.toggleDescription}>
                도메인 대신 IP 주소 또는 CIDR 범위를 대상으로 합니다.
                파이프라인이 역방향 DNS로 호스트네임을 자동 탐색합니다.
              </p>
            </div>
            <Toggle
              checked={ipMode}
              onChange={handleIpModeToggle}
              disabled={isLocked}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label
                className={`${styles.fieldLabel} ${styles.fieldLabelRequired}`}
              >
                프로젝트 이름
              </label>
              <input
                type="text"
                className="textInput"
                value={data.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="내 보안 프로젝트"
              />
            </div>

            {!ipMode && (
              <div className={styles.fieldGroup}>
                <label
                  className={`${styles.fieldLabel} ${styles.fieldLabelRequired}`}
                >
                  대상 도메인
                </label>
                <input
                  type="text"
                  className="textInput"
                  value={data.targetDomain}
                  onChange={(e) => updateField('targetDomain', e.target.value)}
                  placeholder="example.com"
                  disabled={isLocked}
                  title={
                    isLocked
                      ? '대상 도메인은 생성 후 변경할 수 없습니다. 대신 새 프로젝트를 생성하세요.'
                      : undefined
                  }
                />
              </div>
            )}
          </div>

          {/* Hard guardrail warning for government/public domains */}
          {hardBlockResult.blocked && (
            <div
              className={styles.shodanWarning}
              style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.08)',
              }}
            >
              <ShieldAlert size={14} style={{ color: '#ef4444' }} />
              <span>
                <strong>대상 영구 차단:</strong> 정부, 군사, 교육, 국제 기관
                웹사이트(.gov, .mil, .edu, .int 등)는 항상 차단되며 대상으로
                사용할 수 없습니다. 가드레일 설정과 무관하게 이 제한은
                비활성화할 수 없습니다.
              </span>
            </div>
          )}

          {/* IP Mode: Target IPs textarea */}
          {ipMode && (
            <div className={styles.fieldGroup}>
              <label
                className={`${styles.fieldLabel} ${styles.fieldLabelRequired}`}
              >
                대상 IP / CIDR
              </label>
              <div className={styles.fileImportWrap}>
                <textarea
                  className="textarea"
                  value={displayIps}
                  onChange={(e) => handleIpsChange(e.target.value)}
                  placeholder={'192.168.1.1\n10.0.0.0/24\n2001:db8::1'}
                  rows={4}
                  disabled={isLocked}
                  title={
                    isLocked
                      ? '대상 IP는 생성 후 변경할 수 없습니다.'
                      : undefined
                  }
                />
                {!isLocked && (
                  <FileImportButton
                    variant="textarea"
                    fieldName="target IPs / CIDRs"
                    onImport={(values) => updateField('targetIps', values)}
                  />
                )}
              </div>
              <span className={styles.fieldHint}>
                {isLocked
                  ? '대상 IP는 프로젝트 생성 후 잠금됩니다. 변경하려면 새 프로젝트를 생성하세요.'
                  : '1줄에 IP 또는 CIDR을 하나씩 입력하거나 콤마로 구분하세요. IPv4, IPv6, CIDR 범위 지원. 최대 /24 (256 호스트).'}
              </span>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>설명</label>
            <textarea
              className="textarea"
              value={data.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="프로젝트 설명 (선택사항)"
              rows={2}
            />
          </div>

          {/* Domain-mode only fields */}
          {!ipMode && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>서브도매인 접두사</label>
                <div className={styles.fileImportWrap}>
                  <input
                    type="text"
                    className="textInput"
                    value={isPrefixFocused ? localPrefixes : displayPrefixes}
                    onChange={(e) => handlePrefixesChange(e.target.value)}
                    onBlur={handlePrefixesBlur}
                    onFocus={handlePrefixesFocus}
                    placeholder="www, api, admin (콤마로 구분)"
                    disabled={isLocked}
                    title={
                      isLocked
                        ? '서브도매인 목록은 생성 후 변경할 수 없습니다. 대신 새 프로젝트를 생성하세요.'
                        : undefined
                    }
                  />
                  {!isLocked && (
                    <FileImportButton
                      fieldName="subdomain prefixes"
                      onImport={(values) => {
                        const joined = values.join(', ');
                        setLocalPrefixes(joined);
                        updateField(
                          'subdomainList',
                          toStoredPrefixes(joined, includesRootDomain),
                        );
                      }}
                    />
                  )}
                </div>
                <span className={styles.fieldHint}>
                  {isLocked
                    ? '대상 도메인과 서브도메인은 그래프 데이터 일관성을 위해 프로젝트 생성 후 잠금됩니다. 변경하려면 새 프로젝트를 생성하세요.'
                    : '비워두면 모든 서브도메인을 자동 발견합니다. 접두사는 점 없이 입력하세요 (예: "www, api, admin").'}
                </span>
                {!isLocked && displayPrefixes.trim().length === 0 && (
                  <div
                    className={styles.shodanWarning}
                    style={{
                      marginTop: 'var(--space-2)',
                      marginBottom: 0,
                      padding: 'var(--space-3) var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      borderWidth: '2px',
                      borderColor: 'rgba(251, 146, 60, 0.5)',
                      background: 'rgba(251, 146, 60, 0.12)',
                      alignItems: 'center',
                    }}
                  >
                    <AlertTriangle size={22} style={{ color: '#fb923c' }} />
                    <span>
                      <strong>주의:</strong> 서브도매인 접두사를 비워두면 전체
                      도메인에 대한 전수 서브도매인 열거가 시작됩니다. 특정
                      접두사를 지정하는 것보다
                      <strong> 훨씬 더 오래 </strong>
                      걸립니다.
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>루트 도메인 포함</span>
                  <p className={styles.toggleDescription}>
                    루트 도메인도 스캔합니다 (예: 서브도메인 없이 example.com
                    자체)
                  </p>
                </div>
                <Toggle
                  checked={includesRootDomain}
                  onChange={handleRootDomainToggle}
                  disabled={isLocked}
                />
              </div>

              {/* AI in Pipeline (master toggle, model picker, per-tool toggles) */}
              <div className={styles.subSection}>
                <div
                  className={styles.toggleRow}
                  style={{ gap: 'var(--space-4)', alignItems: 'center' }}
                >
                  <AiToggleLabel
                    label="파이프라인 AI 활성화"
                    tooltip={
                      '아래 모든 도구별 AI 토글을 활성화하는 마스터 스위치. ' +
                      'OFF 시 모든 도구별 AI 플래그가 강제로 OFF 되며 ' +
                      '정찰 파이프라인에서 LLM 호출이 없습니다. ON 시 ' +
                      '각 도구별 토글이 연활되어 AI 훅을 개별적으로 ' +
                      '켜거나 끌 수 있습니다. 아래에서 모든 훅이 사용할 모델을 선택하세요.'
                    }
                  />
                  <Toggle
                    checked={data.aiInPipeline}
                    onChange={(checked) => {
                      updateField('aiInPipeline', checked);
                      // When master flips, cascade to every per-tool flag so the
                      // form state matches the backend defense-in-depth contract.
                      updateField('ffufAiExtensions', checked);
                      updateField('nucleiAiTags', checked);
                      updateField('wafAiClassifier', checked);
                      updateField('nucleiAiResponseFilter', checked);
                      updateField('takeoverAiClassifier', checked);
                    }}
                  />
                </div>
                {data.aiInPipeline && (
                  <>
                    <div
                      className={styles.fieldRow}
                      style={{ marginTop: 'var(--space-3)' }}
                    >
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>AI 모델</label>
                        <ModelPicker
                          userId={userId}
                          value={data.aiPipelineModel}
                          onChange={(id) => updateField('aiPipelineModel', id)}
                        />
                        <span className={styles.fieldHint}>
                          정찰의 모든 AI 훅에서 사용하는 모델입니다. 에이전트의
                          모델 선택과는 독립적입니다. 비용이 중요하면 여기서
                          저렴한 모델을 선택하세요.
                        </span>
                      </div>
                    </div>

                    {/* Per-tool AI toggles. Each one mirrors the toggle in its tool
                        section, sharing the same form field, so flipping either
                        place updates both. The list lives inside a fixed-height
                        scroll container so adding more hooks doesn't push the
                        rest of the form down. Descriptions are rendered as
                        native title-attribute tooltips on the info icon to
                        keep each row compact. Add new entries to the
                        `aiPipelineHooks` array below as more tools gain AI
                        hooks -- no JSX changes needed. */}
                    {(() => {
                      const aiPipelineHooks: Array<{
                        field:
                          | 'ffufAiExtensions'
                          | 'nucleiAiTags'
                          | 'wafAiClassifier'
                          | 'nucleiAiResponseFilter'
                          | 'takeoverAiClassifier';
                        label: string;
                        description: string;
                      }> = [
                        {
                          field: 'ffufAiExtensions',
                          label: 'FFuf: AI 확장자 추론',
                          description:
                            'For each fuzz target, FFuf first sends a single HEAD request and asks the configured model to suggest the most likely file extensions based on the response headers (Server, X-Powered-By, X-AspNet-Version). The static FFuf extensions list in the FFuf module is ignored when this is on. Same toggle as in the FFuf module: flipping it here flips it there. A per-fingerprint cache means N hosts behind the same stack collapse to one LLM call.',
                        },
                        {
                          field: 'nucleiAiTags',
                          label: 'Nuclei: AI 태그 선택',
                          description:
                            'Once per scan, Nuclei aggregates the detected tech stack from http_probe (Wappalyzer + Server headers) and asks the configured model to prune its include-tags list to ones matching the stack. Drops irrelevant tags like wordpress on Node sites, adds tech-specific ones like apache or wp-plugin when detected. The static Include Tags list in the Nuclei module is ignored when this is on. Same toggle as in the Nuclei module: flipping it here flips it there. Candidate tag pool is built from the live nuclei-templates volume (count >= 50, ~125 broad-category tags).',
                        },
                        {
                          field: 'wafAiClassifier',
                          label: '보안 검사: AI WAF 분류',
                          description:
                            'Augments the static WAF/CDN header-token check used by the Direct IP and WAF Bypass checks. When the static list misses (modern WAFs strip or rebrand their headers), the response gets a second pass through the configured model, which scores WAF presence 0-100 from headers, body fingerprints, cookies, and latency. Same toggle as in the Security Checks module: flipping it here flips it there. A per-response fingerprint cache collapses identical responses to one LLM call.',
                        },
                        {
                          field: 'nucleiAiResponseFilter',
                          label: 'Nuclei: AI 오탐 블록페이지 필터',
                          description:
                            "Augments the keyword-based WAF/rate-limit detection inside Nuclei's false-positive filter. When the static list misses (rebranded WAF blocks, AWS WAF JSON errors, custom Fortinet pages) but the response still looks like a block (suspicious status code on an injection finding), the LLM classifies the body as block-page or real hit. Suppresses fake findings and exposes real ones the keyword filter wrongly hides. Same toggle as in the Nuclei module: flipping it here flips it there. Per-response fingerprint cache keeps cost bounded.",
                        },
                        {
                          field: 'takeoverAiClassifier',
                          label: 'Takeover: AI WAF "No-Host" 페이지 판별',
                          description:
                            'Subjack/Nuclei takeover fingerprints can collide with WAF block pages that say "not found" for a hostname the WAF doesn\'t recognize. When AI is on, each takeover candidate is probed; if the response carries no third-party vendor token (Heroku-Request-Id, x-amz-bucket-region, etc.), the LLM classifies the body as a real unclaimed-service page or a WAF block. AI-flagged collisions get a -40 score penalty so they land in manual_review instead of being shipped as criticals. Same toggle as in the Subdomain Takeover module: flipping it here flips it there.',
                        },
                      ];
                      return (
                        <div
                          style={{
                            marginTop: 'var(--space-4)',
                            maxHeight: 240,
                            overflowY: 'auto',
                            border: '1px solid var(--border-subtle, #2a2a2a)',
                            borderRadius: 'var(--radius-2, 6px)',
                            padding: 'var(--space-2, 8px) var(--space-3, 12px)',
                            background: 'var(--surface-1, transparent)',
                          }}
                        >
                          {aiPipelineHooks.map((hook, idx) => (
                            <div
                              key={hook.field}
                              className={styles.toggleRow}
                              style={{
                                gap: 'var(--space-3)',
                                paddingTop:
                                  idx === 0 ? 0 : 'var(--space-2, 8px)',
                                paddingBottom: 'var(--space-2, 8px)',
                                borderTop:
                                  idx === 0
                                    ? 'none'
                                    : '1px solid var(--border-subtle, #222)',
                                alignItems: 'center',
                              }}
                            >
                              <AiToggleLabel
                                label={hook.label}
                                tooltip={hook.description}
                              />
                              <Toggle
                                checked={data[hook.field]}
                                onChange={(checked) =>
                                  updateField(hook.field, checked)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>도메인 소유권 검증</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      도메인 소유권 검증
                    </span>
                    <p className={styles.toggleDescription}>
                      스캔 전 DNS TXT 레코드 검증을 요구합니다
                    </p>
                  </div>
                  <Toggle
                    checked={data.verifyDomainOwnership}
                    onChange={(checked) =>
                      updateField('verifyDomainOwnership', checked)
                    }
                  />
                </div>

                {data.verifyDomainOwnership && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>소유권 토큰</label>
                      <input
                        type="text"
                        className="textInput"
                        value={data.ownershipToken}
                        onChange={(e) =>
                          updateField('ownershipToken', e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        TXT 레코드 접두사
                      </label>
                      <input
                        type="text"
                        className="textInput"
                        value={data.ownershipTxtPrefix}
                        onChange={(e) =>
                          updateField('ownershipTxtPrefix', e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>스텔스 모드</h3>
            <div className={styles.toggleRow} style={{ gap: 'var(--space-4)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className={styles.toggleLabel}>스텔스 모드 활성화</span>
                <p className={styles.toggleDescription}>
                  전체 파이프라인을 패시브 및 저소음 기법만 사용하도록
                  강제합니다. 액티브 스캐너(Kiterunner, 배너 그래빙)가
                  비활성화됩니다. 포트 스캔은 패시브 모드로 전환됩니다. Nuclei는
                  DAST와 interactsh를 비활성화합니다. AI 에이전트는 스텔스
                  방법만 사용하며, 스텔스가 불가능한 작업은 중단합니다.
                </p>
              </div>
              <Toggle
                checked={data.stealthMode}
                onChange={(checked) => updateField('stealthMode', checked)}
              />
            </div>
          </div>

          {/* Target Guardrail */}
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>타겟 가드레일</h3>
            <div className={styles.toggleRow} style={{ gap: 'var(--space-4)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className={styles.toggleLabel}>타겟 가드레일 활성화</span>
                <p className={styles.toggleDescription}>
                  잘 알려진 공개 대상(대형 테크 기업, 클라우드 제공업체,
                  금융기관 등)을 프로젝트 저장 시 차단합니다. 권한 없는 도메인의
                  우발적 스캔을 방지합니다. 정부, 군사, 교육, 국제 기관
                  도메인(.gov, .mil, .edu, .int)은 이 설정과 무관하게 항상
                  차단됩니다.
                </p>
              </div>
              <Toggle
                checked={data.targetGuardrailEnabled ?? true}
                onChange={(checked) =>
                  updateField('targetGuardrailEnabled', checked)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
