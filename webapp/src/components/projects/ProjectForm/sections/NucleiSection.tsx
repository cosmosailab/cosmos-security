'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronDown,
  Shield,
  Upload,
  Trash2,
  Loader2,
  FileText,
  Play,
  AlertTriangle,
} from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { TimeEstimate } from '../TimeEstimate';
import { FileImportButton } from '../FileImportButton';
import { AiToggleLabel } from '../AiToggleLabel';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface NucleiSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

interface CustomTemplate {
  id: string;
  name: string;
  severity: string;
  file: string;
  path: string;
  size: number;
}

const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low', 'info'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#e53e3e',
  high: '#dd6b20',
  medium: '#d69e2e',
  low: '#38a169',
  info: '#3182ce',
  unknown: '#718096',
};

export function NucleiSection({
  data,
  updateField,
  onRun,
}: NucleiSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const templateFileRef = useRef<HTMLInputElement>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/nuclei-templates');
      if (res.ok) {
        const json = await res.json();
        setCustomTemplates(json.templates || []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleTemplateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/nuclei-templates', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setUploadError(result.error || 'Upload failed');
        return;
      }

      setCustomTemplates(result.templates || []);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (templateFileRef.current) templateFileRef.current.value = '';
    }
  };

  const handleTemplateDelete = async (templatePath: string) => {
    try {
      const res = await fetch(
        `/api/nuclei-templates?path=${encodeURIComponent(templatePath)}`,
        { method: 'DELETE' },
      );

      if (res.ok) {
        const result = await res.json();
        setCustomTemplates(result.templates || []);
      }
    } catch {
      // Silently fail
    }
  };

  const toggleSeverity = (severity: string) => {
    const current = data.nucleiSeverity ?? [];
    if (current.includes(severity)) {
      updateField(
        'nucleiSeverity',
        current.filter((s) => s !== severity),
      );
    } else {
      updateField('nucleiSeverity', [...current, severity]);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Shield size={16} />
          Nuclei 취약점 스캐너
          <NodeInfoTooltip section="Nuclei" />
          <WikiInfoButton target="Nuclei" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.nucleiEnabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRun();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
              }}
              title="Nuclei 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.nucleiEnabled}
              onChange={(checked) => updateField('nucleiEnabled', checked)}
            />
          </div>
          <ChevronDown
            size={16}
            className={`${styles.sectionIcon} ${isOpen ? styles.sectionIconOpen : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <p className={styles.sectionDescription}>
            ProjectDiscovery의 Nuclei를 사용한 템플릿 기반 취약점 스캔. 발견된
            엔드포인트를 대상으로 수체의 보안 검사를 실행하여 CVE, 잘못된 설정,
            노출된 패널, 기타 보안 문제를 탐지합니다.
          </p>
          {data.nucleiEnabled && (
            <>
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>심각도 레벨</h3>
                <p
                  className={styles.fieldHint}
                  style={{ marginBottom: '0.5rem' }}
                >
                  심각도별로 취약점 필터. 프로덕션 스캔 시 &ldquo;info&rdquo;
                  제외 권장
                </p>
                <TimeEstimate estimate="Critical only: ~70% faster than all severities" />
                <div className={styles.checkboxGroup}>
                  {SEVERITY_OPTIONS.map((severity) => (
                    <label key={severity} className="checkboxLabel">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={(data.nucleiSeverity ?? []).includes(severity)}
                        onChange={() => toggleSeverity(severity)}
                      />
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 제한</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nucleiRateLimit}
                    onChange={(e) =>
                      updateField(
                        'nucleiRateLimit',
                        parseInt(e.target.value) || 100,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    요청/초. 대부분 타겟에 100-150, 민감한 시스템에는 낙게
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>백구 크기</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nucleiBulkSize}
                    onChange={(e) =>
                      updateField(
                        'nucleiBulkSize',
                        parseInt(e.target.value) || 25,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    동시에 처리할 호스트 수
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>동시 실행</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nucleiConcurrency}
                    onChange={(e) =>
                      updateField(
                        'nucleiConcurrency',
                        parseInt(e.target.value) || 25,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    동시에 실행할 템플릿 수
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nucleiTimeout}
                    onChange={(e) =>
                      updateField(
                        'nucleiTimeout',
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    템플릿 검사당 요청 타임아웃
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>재시도</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nucleiRetries}
                    onChange={(e) =>
                      updateField(
                        'nucleiRetries',
                        parseInt(e.target.value) || 1,
                      )
                    }
                    min={0}
                    max={10}
                  />
                  <span className={styles.fieldHint}>
                    실패한 요청 재시도 횟수
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 리다이렉트</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nucleiMaxRedirects}
                    onChange={(e) =>
                      updateField(
                        'nucleiMaxRedirects',
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={0}
                    max={50}
                  />
                  <span className={styles.fieldHint}>
                    쭬능 최대 리다이렉트 체인
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>템플릿 설정</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>템플릿 폴더</label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.nucleiTemplates ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'nucleiTemplates',
                          e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="cves, vulnerabilities, misconfig (empty = all)"
                    />
                    <FileImportButton
                      fieldName="template folders"
                      onImport={(values) =>
                        updateField('nucleiTemplates', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    cves, vulnerabilities, misconfiguration, exposures,
                    technologies, default-logins, takeovers
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    제외할 템플릿 경로
                  </label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.nucleiExcludeTemplates ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'nucleiExcludeTemplates',
                          e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="http/vulnerabilities/generic/"
                    />
                    <FileImportButton
                      fieldName="template paths"
                      onImport={(values) =>
                        updateField('nucleiExcludeTemplates', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    경로로 특정 디렉터리 또는 템플릿 파일 제외
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    커스텀 템플릿 경로
                  </label>
                  <div className={styles.fileImportWrap}>
                    <textarea
                      className="textarea"
                      value={(data.nucleiCustomTemplates ?? []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'nucleiCustomTemplates',
                          e.target.value.split('\n').filter(Boolean),
                        )
                      }
                      placeholder="/path/to/custom-templates&#10;~/my-nuclei-templates"
                      rows={2}
                    />
                    <FileImportButton
                      variant="textarea"
                      fieldName="template paths"
                      onImport={(values) =>
                        updateField('nucleiCustomTemplates', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    공식 레포지토리에 추가로 자체 템플릿 추가
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>템플릿 태그</h3>
                <p
                  className={styles.fieldHint}
                  style={{ marginBottom: '0.5rem' }}
                >
                  기능 태그별로 템플릿 필터
                </p>
                <div
                  className={styles.toggleRow}
                  style={{
                    marginBottom: 'var(--space-2)',
                    alignItems: 'center',
                  }}
                >
                  <AiToggleLabel
                    label="Use AI for Tag Selection"
                    tooltip={
                      'AI prunes the include-tags list per scan based on detected tech stack ' +
                      '(drops irrelevant tags like wordpress on Node sites, adds tech-specific ' +
                      'tags like apache when detected). When on, the static Include Tags list ' +
                      'below is ignored. Same toggle as in the Target tab AI panel: flipping it ' +
                      'here flips it there. Candidate tag pool is built from the live ' +
                      'nuclei-templates volume (count >= 50, ~125 broad-category tags). ' +
                      (!data.aiInPipeline
                        ? 'Enable "AI in Pipeline" in the Target tab to use this.'
                        : '')
                    }
                  />
                  <Toggle
                    checked={data.nucleiAiTags}
                    disabled={!data.aiInPipeline}
                    onChange={(checked) => updateField('nucleiAiTags', checked)}
                  />
                </div>
                <div
                  className={styles.toggleRow}
                  style={{
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <AiToggleLabel
                    label="Use AI to Filter False-Positive Block Pages"
                    tooltip={
                      "Augments Nuclei's keyword-based WAF/rate-limit detection. " +
                      "When a finding's response carries a suspicious status code " +
                      '(403/406/418/429/503) but no keyword matched, the LLM classifies ' +
                      'the body as a block page or real hit. Catches rebranded WAF ' +
                      'blocks (AWS WAF JSON, custom Imperva, Fortinet) that the static ' +
                      'list misses, and avoids false positives where legitimate pages ' +
                      'contain words like "WAF" or "Access Denied". ' +
                      (!data.aiInPipeline
                        ? 'Enable "AI in Pipeline" in the Target tab to use this.'
                        : '')
                    }
                  />
                  <Toggle
                    checked={data.nucleiAiResponseFilter}
                    disabled={!data.aiInPipeline}
                    onChange={(checked) =>
                      updateField('nucleiAiResponseFilter', checked)
                    }
                  />
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>포함 태그</label>
                    <div className={styles.fileImportWrap}>
                      <input
                        type="text"
                        className="textInput"
                        value={(data.nucleiTags ?? []).join(', ')}
                        onChange={(e) =>
                          updateField(
                            'nucleiTags',
                            e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                        placeholder="cve, xss, sqli, rce (empty = custom templates only)"
                        disabled={data.nucleiAiTags}
                        style={data.nucleiAiTags ? { opacity: 0.5 } : undefined}
                      />
                      <FileImportButton
                        fieldName="tags"
                        onImport={(values) => updateField('nucleiTags', values)}
                      />
                    </div>
                    <span className={styles.fieldHint}>
                      {data.nucleiAiTags ? (
                        <>
                          태그는 AI가 기술 핑거프린트를 기반으로 스캔별로
                          선정합니다. 위의 정적 목록은 무시됩니다.
                        </>
                      ) : (
                        <>
                          주요 태그: cve, xss, sqli, rce, lfi, ssrf, xxe, ssti.
                          <strong> 비우면</strong> 내장 8000개 템플릿은 실행되지
                          않으며 &mdash; 아래에서 선택한 커스텀 템플릿만
                          실행됩니다. 둘 다 비와 있으면 탐지 패스가 건너뜁니다.
                        </>
                      )}
                    </span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>제외 태그</label>
                    <div className={styles.fileImportWrap}>
                      <input
                        type="text"
                        className="textInput"
                        value={(data.nucleiExcludeTags ?? []).join(', ')}
                        onChange={(e) =>
                          updateField(
                            'nucleiExcludeTags',
                            e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                        placeholder="dos, fuzz"
                      />
                      <FileImportButton
                        fieldName="tags"
                        onImport={(values) =>
                          updateField('nucleiExcludeTags', values)
                        }
                      />
                    </div>
                    <span className={styles.fieldHint}>
                      프로덕션 스캔 시 dos, fuzz 제외 권장
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>템플릿 옵션</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      템플릿 자동 업데이트
                    </span>
                    <p className={styles.toggleDescription}>
                      스캔 전 최신 템플릿 다운로드. ~10-30초 추가
                    </p>
                  </div>
                  <Toggle
                    checked={data.nucleiAutoUpdateTemplates}
                    onChange={(checked) =>
                      updateField('nucleiAutoUpdateTemplates', checked)
                    }
                  />
                </div>
                {/* Custom Templates Manager */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'var(--bg-secondary, #1a1a2e)',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }}
                      >
                        커스텀 템플릿
                      </span>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                          margin: '2px 0 0',
                        }}
                      >
                        업로드는 전역 설정입니다. 이 프로젝트 스캔에 포함할
                        템플릿을 체크하세요.
                      </p>
                    </div>
                    <div>
                      <input
                        ref={templateFileRef}
                        type="file"
                        accept=".yaml,.yml"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleTemplateUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        className="secondaryButton"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          padding: '4px 10px',
                        }}
                        onClick={() => templateFileRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 size={13} className={styles.spin} />
                        ) : (
                          <Upload size={13} />
                        )}
                        {isUploading ? '업로드 중...' : '.yaml 업로드'}
                      </button>
                    </div>
                  </div>

                  {uploadError && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#e53e3e',
                        margin: '4px 0 8px',
                      }}
                    >
                      {uploadError}
                    </p>
                  )}

                  {customTemplates.length === 0 ? (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        fontStyle: 'italic',
                        margin: '8px 0 0',
                      }}
                    >
                      업로드된 커스텀 템플릿이 없습니다.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        marginTop: '6px',
                      }}
                    >
                      {customTemplates.map((t) => {
                        const selected =
                          data.nucleiSelectedCustomTemplates ?? [];
                        const isChecked = selected.includes(t.path);
                        return (
                          <div
                            key={t.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: isChecked
                                ? 'var(--bg-tertiary, #16162a)'
                                : 'transparent',
                              fontSize: '0.78rem',
                              border: isChecked
                                ? '1px solid var(--color-primary, #e53e3e33)'
                                : '1px solid transparent',
                            }}
                          >
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: 0,
                                flex: 1,
                                cursor: 'pointer',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const current =
                                    data.nucleiSelectedCustomTemplates ?? [];
                                  if (isChecked) {
                                    updateField(
                                      'nucleiSelectedCustomTemplates',
                                      current.filter((p) => p !== t.path),
                                    );
                                  } else {
                                    updateField(
                                      'nucleiSelectedCustomTemplates',
                                      [...current, t.path],
                                    );
                                  }
                                }}
                                style={{
                                  accentColor: 'var(--color-primary, #e53e3e)',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '1px 6px',
                                  borderRadius: '3px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: '#fff',
                                  background:
                                    SEVERITY_COLORS[t.severity] ||
                                    SEVERITY_COLORS.unknown,
                                  flexShrink: 0,
                                }}
                              >
                                {t.severity}
                              </span>
                              <span
                                style={{
                                  color: 'var(--text-primary)',
                                  fontWeight: 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {t.id}
                              </span>
                              {t.name && (
                                <span
                                  style={{
                                    color: 'var(--text-tertiary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  — {t.name}
                                </span>
                              )}
                            </label>
                            <button
                              type="button"
                              onClick={() => handleTemplateDelete(t.path)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-tertiary)',
                                padding: '2px',
                                flexShrink: 0,
                                marginLeft: '8px',
                              }}
                              title={`Delete ${t.file}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>신규 템플릿만</span>
                    <p className={styles.toggleDescription}>
                      마지막 업데이트 이후 추가된 템플릿만 실행. 매일 스캔에
                      유용
                    </p>
                  </div>
                  <Toggle
                    checked={data.nucleiNewTemplatesOnly}
                    onChange={(checked) =>
                      updateField('nucleiNewTemplatesOnly', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>DAST 패스 추가</span>
                    <p className={styles.toggleDescription}>
                      파라미터가 있는 URL에 <code>-dast</code>를 사용하는 두
                      번째 nuclei 패스를 실행합니다 (XSS, SQLi, SSTI, RCE 퍼징).
                      추가적: 탐지 패스 (CVE, 노출, 커스텀 템플릿, 태그)는 먹저
                      실행됩니다.
                    </p>
                    <TimeEstimate estimate="+50-100% scan time (extra DAST pass)" />
                  </div>
                  <Toggle
                    checked={data.nucleiDastMode}
                    onChange={(checked) =>
                      updateField('nucleiDastMode', checked)
                    }
                  />
                </div>
                {data.nucleiDastMode && (
                  <div className={styles.shodanWarning}>
                    <AlertTriangle size={14} />
                    <div>
                      <strong>How the two passes work.</strong> Pass 1
                      (detection) runs your full configuration: severities,
                      tags, custom templates, the whole ~8000-template corpus
                      minus what you exclude. Pass 2 (DAST) runs only the ~250
                      templates under <code>dast/</code> with <code>-dast</code>{' '}
                      forced on, and ignores tag/template filters because those
                      filters would empty-intersect with the DAST set and fatal
                      with{' '}
                      <em>&ldquo;no templates provided for scan.&rdquo;</em>
                      <br />
                      <br />
                      <strong>DAST pass needs parameterized URLs.</strong>{' '}
                      Built-in DAST templates fuzz query parameters
                      (path/header/cookie/body fuzzing exists since v3.2 but is
                      rare in stock templates). If <code>resource_enum</code>{' '}
                      hasn&rsquo;t produced any URLs containing{' '}
                      <code>?param=value</code>, the DAST pass is skipped
                      automatically and only the detection pass runs. Run Katana
                      / Hakrawler first if you want DAST coverage.
                      <br />
                      <br />
                      <strong>
                        Tag and template filters apply to the detection pass
                        only.
                      </strong>{' '}
                      Want to bias the detection pass toward GraphQL? Set
                      Include Tags <code>graphql,apollo,hasura</code> as usual:
                      it filters pass 1 only, the DAST pass still runs
                      unfiltered against your parameterized URLs.
                      <br />
                      <br />
                      <strong>Cost:</strong> roughly 2x scan time when DAST is
                      on (the two passes can&rsquo;t share work). Findings from
                      both passes are merged into a single report.
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>고급 옵션</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>헤드리스 모드</span>
                    <p className={styles.toggleDescription}>
                      JavaScript 렌더링 페이지에 헤드리스 브라우저 사용. Chrome
                      설치 필요
                    </p>
                    <TimeEstimate estimate="+100-200% scan time (browser rendering)" />
                  </div>
                  <Toggle
                    checked={data.nucleiHeadless}
                    onChange={(checked) =>
                      updateField('nucleiHeadless', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      시스템 DNS 리솔버
                    </span>
                    <p className={styles.toggleDescription}>
                      nuclei 기본값 대신 OS DNS 사용. 내부 네트워크에 유리
                    </p>
                  </div>
                  <Toggle
                    checked={data.nucleiSystemResolvers}
                    onChange={(checked) =>
                      updateField('nucleiSystemResolvers', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>Interactsh</span>
                    <p className={styles.toggleDescription}>
                      아욳오브밴드 콜백을 통한 블라인드 취약점 탐지 (SSRF, XXE,
                      RCE). 인터넷 연결 필요
                    </p>
                  </div>
                  <Toggle
                    checked={data.nucleiInteractsh}
                    onChange={(checked) =>
                      updateField('nucleiInteractsh', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      리다이렉트 따르기
                    </span>
                    <p className={styles.toggleDescription}>
                      템플릿 실행 중 HTTP 리다이렉트 쭬습니다
                    </p>
                  </div>
                  <Toggle
                    checked={data.nucleiFollowRedirects}
                    onChange={(checked) =>
                      updateField('nucleiFollowRedirects', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>모든 IP 스캔</span>
                    <p className={styles.toggleDescription}>
                      호스트명만이 아닌 전체 풀리 IP 스캔. 중복 취약점 발견
                      가능성 있음
                    </p>
                  </div>
                  <Toggle
                    checked={data.nucleiScanAllIps}
                    onChange={(checked) =>
                      updateField('nucleiScanAllIps', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Docker 이미지</label>
                <input
                  type="text"
                  className="textInput"
                  value={data.nucleiDockerImage}
                  disabled
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
