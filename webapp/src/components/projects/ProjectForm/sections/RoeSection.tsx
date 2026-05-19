'use client';

import { useState, useRef } from 'react';
import {
  ChevronDown,
  Shield,
  Upload,
  Loader2,
  Plus,
  Minus,
  CheckCircle,
} from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal/Modal';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';

type ProjectFormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface RoeSectionProps {
  data: ProjectFormData;
  updateField: <K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K],
  ) => void;
  updateMultipleFields: (fields: Partial<ProjectFormData>) => void;
  mode: 'create' | 'edit';
  onFileSelected: (file: File | null) => void;
}

const ENGAGEMENT_TYPES = [
  { value: 'external', label: '외부 침투 테스트' },
  { value: 'internal', label: '내부 침투 테스트' },
  { value: 'web_app', label: '웹 애플리케이션 테스트' },
  { value: 'api', label: 'API 보안 테스트' },
  { value: 'mobile', label: '모바일 애플리케이션 테스트' },
  { value: 'physical', label: '물리 보안 테스트' },
  { value: 'social_engineering', label: '소셜 엔지니어링' },
  { value: 'red_team', label: '레드팀 인게이지먼트' },
];

const FORBIDDEN_CATEGORIES = [
  { value: 'brute_force', label: '자격증명 테스트' },
  { value: 'dos', label: '가용성 테스트' },
  { value: 'social_engineering', label: '소셜 엔지니어링' },
  { value: 'physical', label: '물리적 접근' },
];

const DATA_HANDLING_OPTIONS = [
  { value: 'no_access', label: '민감 데이터 접근 없음' },
  { value: 'prove_access_only', label: '접근 증명만 (수집 없음)' },
  { value: 'limited_collection', label: '제한적 수집' },
  { value: 'full_access', label: '전체 접근' },
];

const COMPLIANCE_OPTIONS = ['PCI-DSS', 'HIPAA', 'SOC2', 'GDPR', 'ISO27001'];

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function RoeSection({
  data,
  updateField,
  updateMultipleFields,
  mode,
  onFileSelected,
}: RoeSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showParseSuccess, setShowParseSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readOnly = mode === 'edit';

  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    onFileSelected(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // Pass the currently selected LLM model so the agent uses it for parsing
      if (data.agentOpenaiModel) {
        formData.append('model', data.agentOpenaiModel as string);
      }

      const response = await fetch('/api/roe/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Parse failed (${response.status})`);
      }

      const parsed = await response.json();

      // Build update object from parsed fields, only setting non-null values
      const updates: Partial<ProjectFormData> = {};
      const fieldMap: Record<string, keyof ProjectFormData> = {
        name: 'name',
        description: 'description',
        targetDomain: 'targetDomain',
        targetIps: 'targetIps',
        ipMode: 'ipMode',
        subdomainList: 'subdomainList',
        stealthMode: 'stealthMode',
        roeEnabled: 'roeEnabled',
        roeRawText: 'roeRawText',
        roeClientName: 'roeClientName',
        roeClientContactName: 'roeClientContactName',
        roeClientContactEmail: 'roeClientContactEmail',
        roeClientContactPhone: 'roeClientContactPhone',
        roeEmergencyContact: 'roeEmergencyContact',
        roeEngagementStartDate: 'roeEngagementStartDate',
        roeEngagementEndDate: 'roeEngagementEndDate',
        roeEngagementType: 'roeEngagementType',
        roeExcludedHosts: 'roeExcludedHosts',
        roeExcludedHostReasons: 'roeExcludedHostReasons',
        roeTimeWindowEnabled: 'roeTimeWindowEnabled',
        roeTimeWindowTimezone: 'roeTimeWindowTimezone',
        roeTimeWindowDays: 'roeTimeWindowDays',
        roeTimeWindowStartTime: 'roeTimeWindowStartTime',
        roeTimeWindowEndTime: 'roeTimeWindowEndTime',
        roeForbiddenCategories: 'roeForbiddenCategories',
        agentToolPhaseMap: 'agentToolPhaseMap',
        roeMaxSeverityPhase: 'roeMaxSeverityPhase',
        roeAllowDos: 'roeAllowDos',
        roeAllowSocialEngineering: 'roeAllowSocialEngineering',
        roeAllowPhysicalAccess: 'roeAllowPhysicalAccess',
        roeAllowDataExfiltration: 'roeAllowDataExfiltration',
        roeAllowAccountLockout: 'roeAllowAccountLockout',
        roeAllowProductionTesting: 'roeAllowProductionTesting',
        roeGlobalMaxRps: 'roeGlobalMaxRps',
        roeSensitiveDataHandling: 'roeSensitiveDataHandling',
        roeDataRetentionDays: 'roeDataRetentionDays',
        roeRequireDataEncryption: 'roeRequireDataEncryption',
        roeStatusUpdateFrequency: 'roeStatusUpdateFrequency',
        roeCriticalFindingNotify: 'roeCriticalFindingNotify',
        roeIncidentProcedure: 'roeIncidentProcedure',
        roeThirdPartyProviders: 'roeThirdPartyProviders',
        roeComplianceFrameworks: 'roeComplianceFrameworks',
        roeNotes: 'roeNotes',
        naabuRateLimit: 'naabuRateLimit',
        nucleiRateLimit: 'nucleiRateLimit',
        katanaRateLimit: 'katanaRateLimit',
        httpxRateLimit: 'httpxRateLimit',
        nucleiSeverity: 'nucleiSeverity',
        scanModules: 'scanModules',
      };

      for (const [key, formKey] of Object.entries(fieldMap)) {
        if (parsed[key] !== null && parsed[key] !== undefined) {
          // agentToolPhaseMap: LLM returns only disabled tools (e.g. {"execute_hydra": []}).
          // Merge into existing map so we don't wipe out all other tools' phases.
          if (key === 'agentToolPhaseMap' && typeof parsed[key] === 'object') {
            const currentMap = (
              typeof data.agentToolPhaseMap === 'string'
                ? JSON.parse(data.agentToolPhaseMap)
                : (data.agentToolPhaseMap ?? {})
            ) as Record<string, string[]>;
            const disabledTools = parsed[key] as Record<string, string[]>;
            const merged = { ...currentMap };
            for (const [tool, phases] of Object.entries(disabledTools)) {
              merged[tool] = phases; // override only the tools the LLM wants to disable
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (updates as any)[formKey] = merged;
            continue;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updates as any)[formKey] = parsed[key];
        }
      }

      // Store parsed JSON for viewer
      updates.roeParsedJson = parsed;
      updates.roeEnabled = true;

      updateMultipleFields(updates);
      setShowParseSuccess(true);
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : 'Failed to parse document',
      );
    } finally {
      setIsParsing(false);
    }
  };

  const addExcludedHost = () => {
    updateField('roeExcludedHosts', [...(data.roeExcludedHosts || []), '']);
    updateField('roeExcludedHostReasons', [
      ...(data.roeExcludedHostReasons || []),
      '',
    ]);
  };

  const removeExcludedHost = (index: number) => {
    const hosts = [...(data.roeExcludedHosts || [])];
    const reasons = [...(data.roeExcludedHostReasons || [])];
    hosts.splice(index, 1);
    reasons.splice(index, 1);
    updateField('roeExcludedHosts', hosts);
    updateField('roeExcludedHostReasons', reasons);
  };

  const updateExcludedHost = (index: number, value: string) => {
    const hosts = [...(data.roeExcludedHosts || [])];
    hosts[index] = value;
    updateField('roeExcludedHosts', hosts);
  };

  const updateExcludedReason = (index: number, value: string) => {
    const reasons = [...(data.roeExcludedHostReasons || [])];
    reasons[index] = value;
    updateField('roeExcludedHostReasons', reasons);
  };

  const toggleDay = (day: string) => {
    const days = data.roeTimeWindowDays || [];
    if (days.includes(day)) {
      updateField(
        'roeTimeWindowDays',
        days.filter((d) => d !== day),
      );
    } else {
      updateField('roeTimeWindowDays', [...days, day]);
    }
  };

  const toggleForbiddenCategory = (cat: string) => {
    const cats = data.roeForbiddenCategories || [];
    if (cats.includes(cat)) {
      updateField(
        'roeForbiddenCategories',
        cats.filter((c) => c !== cat),
      );
    } else {
      updateField('roeForbiddenCategories', [...cats, cat]);
    }
  };

  const toggleCompliance = (fw: string) => {
    const current = data.roeComplianceFrameworks || [];
    if (current.includes(fw)) {
      updateField(
        'roeComplianceFrameworks',
        current.filter((c) => c !== fw),
      );
    } else {
      updateField('roeComplianceFrameworks', [...current, fw]);
    }
  };

  return (
    <>
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => setIsOpen(!isOpen)}
        >
          <h2 className={styles.sectionTitle}>
            <Shield size={16} />
            RoE
            <WikiInfoButton target="Roe" />
          </h2>
          <ChevronDown
            size={16}
            className={`${styles.sectionIcon} ${isOpen ? styles.sectionIconOpen : ''}`}
          />
        </div>

        {isOpen && (
          <div className={styles.sectionContent}>
            {/* Document Upload (create mode only) */}
            {mode === 'create' && (
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>RoE 문서 업로드</h3>
                <p className={styles.sectionDescription}>
                  Upload a Rules of Engagement document (.pdf, .txt, .md, .docx)
                  to auto-populate project settings. The parsed rules will
                  enforce guardrails on both the <strong>recon pipeline</strong>{' '}
                  (excluded hosts, rate limits, time windows) and{' '}
                  <strong>agentic AI activities</strong> (tool restrictions,
                  severity phase cap, prompt-level instructions).
                </p>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.md,.docx"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      className="secondaryButton"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isParsing}
                      style={{ width: 'fit-content' }}
                    >
                      {isParsing ? (
                        <>
                          <Loader2 size={14} className={styles.spinner} />
                          RoE 문서 파싱 중...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          업로드 & 파싱
                        </>
                      )}
                    </button>
                    {parseError && (
                      <span
                        style={{
                          color: 'var(--color-error)',
                          fontSize: '0.8rem',
                          marginTop: 4,
                        }}
                      >
                        {parseError}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Master Switch */}
            <div className={styles.subSection}>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>RoE 활성화</label>
                  <Toggle
                    checked={data.roeEnabled}
                    onChange={(v) => updateField('roeEnabled', v)}
                    disabled={readOnly}
                  />
                  <span className={styles.fieldHint}>
                    활성화 시 RoE 제약이 에이전트와 정찰 파이프라인 모두에
                    적용됩니다.
                  </span>
                </div>
              </div>
            </div>

            {data.roeEnabled && (
              <>
                {/* Client & Engagement */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>
                    클라이언트 & 인게이지먼트
                  </h3>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>클라이언트명</label>
                      <input
                        className="textInput"
                        value={data.roeClientName}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeClientName', e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        인게이지먼트 유형
                      </label>
                      <select
                        className="select"
                        value={data.roeEngagementType}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateField('roeEngagementType', e.target.value)
                        }
                      >
                        {ENGAGEMENT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>담당자 이름</label>
                      <input
                        className="textInput"
                        value={data.roeClientContactName}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeClientContactName', e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>담당자 이메일</label>
                      <input
                        className="textInput"
                        type="email"
                        value={data.roeClientContactEmail}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeClientContactEmail', e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>담당자 전화</label>
                      <input
                        className="textInput"
                        value={data.roeClientContactPhone}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeClientContactPhone', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>비상 연락체</label>
                      <input
                        className="textInput"
                        value={data.roeEmergencyContact}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeEmergencyContact', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>시작일</label>
                      <input
                        className="textInput"
                        type="date"
                        value={data.roeEngagementStartDate}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeEngagementStartDate', e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>종료일</label>
                      <input
                        className="textInput"
                        type="date"
                        value={data.roeEngagementEndDate}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeEngagementEndDate', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Excluded Hosts */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>제외 호스트</h3>
                  <p className={styles.sectionDescription}>
                    절대 스캔하거나 테스트해서는 안 되는 IP 또는 도메인.
                  </p>
                  {(data.roeExcludedHosts || []).map((host, i) => (
                    <div
                      key={i}
                      className={styles.fieldRow}
                      style={{ alignItems: 'flex-end' }}
                    >
                      <div className={styles.fieldGroup} style={{ flex: 1 }}>
                        <label className={styles.fieldLabel}>호스트</label>
                        <input
                          className="textInput"
                          value={host}
                          readOnly={readOnly}
                          onChange={(e) =>
                            updateExcludedHost(i, e.target.value)
                          }
                          placeholder="IP 또는 도메인"
                        />
                      </div>
                      <div className={styles.fieldGroup} style={{ flex: 1 }}>
                        <label className={styles.fieldLabel}>제외 이유</label>
                        <input
                          className="textInput"
                          value={(data.roeExcludedHostReasons || [])[i] || ''}
                          readOnly={readOnly}
                          onChange={(e) =>
                            updateExcludedReason(i, e.target.value)
                          }
                          placeholder="제외 이유"
                        />
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          className="secondaryButton"
                          onClick={() => removeExcludedHost(i)}
                          style={{ marginBottom: 4 }}
                        >
                          <Minus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <button
                      type="button"
                      className="secondaryButton"
                      onClick={addExcludedHost}
                      style={{ width: 'fit-content', marginTop: 4 }}
                    >
                      <Plus size={14} /> 제외 호스트 추가
                    </button>
                  )}
                </div>

                {/* Time Window */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>테스트 시간 창</h3>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        특정 시간 창으로 테스트 제한
                      </label>
                      <Toggle
                        checked={data.roeTimeWindowEnabled}
                        onChange={(v) => updateField('roeTimeWindowEnabled', v)}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                  {data.roeTimeWindowEnabled && (
                    <>
                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>시간대</label>
                          <input
                            className="textInput"
                            value={data.roeTimeWindowTimezone}
                            readOnly={readOnly}
                            onChange={(e) =>
                              updateField(
                                'roeTimeWindowTimezone',
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Europe/Rome, America/New_York"
                          />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>시작 시간</label>
                          <input
                            className="textInput"
                            type="time"
                            value={data.roeTimeWindowStartTime}
                            readOnly={readOnly}
                            onChange={(e) =>
                              updateField(
                                'roeTimeWindowStartTime',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>종료 시간</label>
                          <input
                            className="textInput"
                            type="time"
                            value={data.roeTimeWindowEndTime}
                            readOnly={readOnly}
                            onChange={(e) =>
                              updateField(
                                'roeTimeWindowEndTime',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>허용 요일</label>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                            }}
                          >
                            {WEEKDAYS.map((day) => (
                              <label
                                key={day}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: readOnly ? 'default' : 'pointer',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={(
                                    data.roeTimeWindowDays || []
                                  ).includes(day)}
                                  disabled={readOnly}
                                  onChange={() => toggleDay(day)}
                                />
                                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Testing Permissions */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>테스트 권한</h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                    }}
                  >
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        가용성 테스트 허용
                      </label>
                      <Toggle
                        checked={data.roeAllowDos}
                        onChange={(v) => updateField('roeAllowDos', v)}
                        disabled={readOnly}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        소셜 엔지니어링 허용
                      </label>
                      <Toggle
                        checked={data.roeAllowSocialEngineering}
                        onChange={(v) =>
                          updateField('roeAllowSocialEngineering', v)
                        }
                        disabled={readOnly}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        물리적 접근 허용
                      </label>
                      <Toggle
                        checked={data.roeAllowPhysicalAccess}
                        onChange={(v) =>
                          updateField('roeAllowPhysicalAccess', v)
                        }
                        disabled={readOnly}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        데이터 유출 허용
                      </label>
                      <Toggle
                        checked={data.roeAllowDataExfiltration}
                        onChange={(v) =>
                          updateField('roeAllowDataExfiltration', v)
                        }
                        disabled={readOnly}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        계정 잠금 허용
                      </label>
                      <Toggle
                        checked={data.roeAllowAccountLockout}
                        onChange={(v) =>
                          updateField('roeAllowAccountLockout', v)
                        }
                        disabled={readOnly}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        운영 환경 테스트 허용
                      </label>
                      <Toggle
                        checked={data.roeAllowProductionTesting}
                        onChange={(v) =>
                          updateField('roeAllowProductionTesting', v)
                        }
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>

                {/* Forbidden Categories */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>금지 기법</h3>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#888',
                      margin: '0 0 8px 0',
                    }}
                  >
                    Tool-level restrictions are applied via Tool Phase
                    Restrictions in the Tool Matrix tab.
                  </p>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>금지 카테고리</label>
                      <div
                        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                      >
                        {FORBIDDEN_CATEGORIES.map((cat) => (
                          <label
                            key={cat.value}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: readOnly ? 'default' : 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={(
                                data.roeForbiddenCategories || []
                              ).includes(cat.value)}
                              disabled={readOnly}
                              onChange={() =>
                                toggleForbiddenCategory(cat.value)
                              }
                            />
                            {cat.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Severity Cap & Rate Limit */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>Constraints</h3>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        최대 허용 단계
                      </label>
                      <select
                        className="select"
                        value={data.roeMaxSeverityPhase}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateField('roeMaxSeverityPhase', e.target.value)
                        }
                      >
                        <option value="informational">
                          정보 수집만 (정찰/스캔닝)
                        </option>
                        <option value="exploitation">익스플로잇까지</option>
                        <option value="post_exploitation">
                          전 단계 (제한 없음)
                        </option>
                      </select>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        전역 최대 요청/초
                      </label>
                      <input
                        className="textInput"
                        type="number"
                        min={0}
                        value={data.roeGlobalMaxRps}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField(
                            'roeGlobalMaxRps',
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                      <span className={styles.fieldHint}>
                        0 = 제한 없음. 모든 도구 속도 제한 적용.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Handling */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>데이터 처리</h3>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        민감 데이터 정책
                      </label>
                      <select
                        className="select"
                        value={data.roeSensitiveDataHandling}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateField(
                            'roeSensitiveDataHandling',
                            e.target.value,
                          )
                        }
                      >
                        {DATA_HANDLING_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        데이터 보존 기간 (일)
                      </label>
                      <input
                        className="textInput"
                        type="number"
                        min={1}
                        value={data.roeDataRetentionDays}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField(
                            'roeDataRetentionDays',
                            parseInt(e.target.value) || 90,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        데이터 암호화 필요
                      </label>
                      <Toggle
                        checked={data.roeRequireDataEncryption}
                        onChange={(v) =>
                          updateField('roeRequireDataEncryption', v)
                        }
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>

                {/* Communication */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>커뮤니케이션</h3>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        상태 업데이트 주기
                      </label>
                      <select
                        className="select"
                        value={data.roeStatusUpdateFrequency}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateField(
                            'roeStatusUpdateFrequency',
                            e.target.value,
                          )
                        }
                      >
                        <option value="daily">매일</option>
                        <option value="weekly">매주</option>
                        <option value="on_finding">발견 시마다</option>
                        <option value="none">없음</option>
                      </select>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        중요 발견 시 클라이언트 알림
                      </label>
                      <Toggle
                        checked={data.roeCriticalFindingNotify}
                        onChange={(v) =>
                          updateField('roeCriticalFindingNotify', v)
                        }
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>인시던트 절차</label>
                      <textarea
                        className="textInput"
                        rows={3}
                        value={data.roeIncidentProcedure}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeIncidentProcedure', e.target.value)
                        }
                        placeholder="테스트에 의해 인시던트 발생 시 조치..."
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>
                    컴플라이언스 & 인증
                  </h3>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        컴플라이언스 프레임워크
                      </label>
                      <div
                        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                      >
                        {COMPLIANCE_OPTIONS.map((fw) => (
                          <label
                            key={fw}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: readOnly ? 'default' : 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={(
                                data.roeComplianceFrameworks || []
                              ).includes(fw)}
                              disabled={readOnly}
                              onChange={() => toggleCompliance(fw)}
                            />
                            {fw}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third-Party Providers */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>서드파티 제공자</h3>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        별도 인증이 있는 클라우드/호스팅 제공자
                      </label>
                      <input
                        className="textInput"
                        type="text"
                        readOnly={readOnly}
                        value={(data.roeThirdPartyProviders || []).join(', ')}
                        onChange={(e) =>
                          updateField(
                            'roeThirdPartyProviders',
                            e.target.value
                              .split(',')
                              .map((s: string) => s.trim())
                              .filter(Boolean),
                          )
                        }
                        placeholder="e.g. AWS, Hetzner, Cloudflare"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className={styles.subSection}>
                  <h3 className={styles.subSectionTitle}>메모</h3>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <textarea
                        className="textInput"
                        rows={4}
                        value={data.roeNotes}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateField('roeNotes', e.target.value)
                        }
                        placeholder="위 필드에 없는 추가 규칙..."
                      />
                    </div>
                  </div>
                </div>

                {/* Raw RoE Text (always read-only) */}
                {data.roeRawText && (
                  <div className={styles.subSection}>
                    <h3 className={styles.subSectionTitle}>
                      추출된 문서 텍스트
                    </h3>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <textarea
                          className="textInput"
                          rows={8}
                          value={data.roeRawText}
                          readOnly
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showParseSuccess}
        onClose={() => setShowParseSuccess(false)}
        title="RoE 문서가 성공적으로 파싱되었습니다"
        size="default"
        footer={
          <button
            type="button"
            onClick={() => setShowParseSuccess(false)}
            style={{
              padding: '8px 24px',
              background: 'var(--color-accent, #3b82f6)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            OK
          </button>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-success, #22c55e)',
            }}
          >
            <CheckCircle size={20} />
            <strong>RoE 문서로부터 프로젝트 설정이 업데이트되었습니다.</strong>
          </div>

          <p style={{ margin: 0 }}>
            파싱된 규칙에 따라 다음 탭이 수정되었을 수 있습니다. 저장 전에
            확인해 주세요:
          </p>

          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <li>
              <strong>대상 & 모듈</strong> — 대상 도메인, IP 주소, 스캔 모듈,
              속도 제한
            </li>
            <li>
              <strong>도구 매트릭스</strong> — 도구 페이즈 제한 (금지된 도구는
              매트릭스에서 비활성화)
            </li>
            <li>
              <strong>ROE</strong> — 제외 호스트, 시간 창, 테스트 권한,
              컴플라이언스
            </li>
          </ul>

          <p
            style={{
              margin: 0,
              padding: '10px 12px',
              background: 'var(--color-surface-alt, rgba(59,130,246,0.08))',
              borderRadius: '6px',
              borderLeft: '3px solid var(--color-accent, #3b82f6)',
            }}
          >
            ROE는 <strong>정찰 파이프라인</strong>(호스트 제외, 속도 제한, 시간
            창)과 <strong>에이전트 AI</strong>(도구 제한, 단계 한도, 프롬프트
            지시사항) 모두에 적용됩니다.
          </p>
        </div>
      </Modal>
    </>
  );
}
