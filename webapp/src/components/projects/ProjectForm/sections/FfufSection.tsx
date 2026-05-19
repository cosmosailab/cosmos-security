'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown,
  FolderSearch,
  Upload,
  X,
  Loader2,
  Play,
} from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { FileImportButton } from '../FileImportButton';
import { AiToggleLabel } from '../AiToggleLabel';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

const BUILTIN_WORDLISTS = [
  {
    name: 'common.txt',
    path: '/usr/share/seclists/Discovery/Web-Content/common.txt',
  },
  {
    name: 'directory-list-2.3-small.txt',
    path: '/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt',
  },
  {
    name: 'raft-medium-directories.txt',
    path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt',
  },
];

const DEFAULT_WORDLIST = BUILTIN_WORDLISTS[0].path;

interface CustomWordlist {
  name: string;
  path: string;
  size: number;
}

interface FfufSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  projectId?: string;
  mode: 'create' | 'edit';
  onRun?: () => void;
}

export function FfufSection({
  data,
  updateField,
  projectId,
  mode,
  onRun,
}: FfufSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [customWordlists, setCustomWordlists] = useState<CustomWordlist[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = !!projectId;

  const fetchCustomWordlists = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/wordlists`);
      if (res.ok) {
        const json = await res.json();
        setCustomWordlists(json.wordlists || []);
      }
    } catch {
      // Silently fail -- custom wordlists just won't appear
    }
  }, [projectId]);

  useEffect(() => {
    fetchCustomWordlists();
  }, [fetchCustomWordlists]);

  const handleUpload = async (file: File) => {
    if (!projectId) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/projects/${projectId}/wordlists`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setUploadError(result.error || 'Upload failed');
        return;
      }

      setCustomWordlists(result.wordlists || []);
      if (result.uploaded?.path) {
        updateField('ffufWordlist', result.uploaded.path);
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (name: string) => {
    if (!projectId) return;

    try {
      const res = await fetch(
        `/api/projects/${projectId}/wordlists?name=${encodeURIComponent(name)}`,
        { method: 'DELETE' },
      );

      if (res.ok) {
        const result = await res.json();
        setCustomWordlists(result.wordlists || []);

        const deletedPath = `/app/recon/wordlists/${projectId}/${name}`;
        if (data.ffufWordlist === deletedPath) {
          updateField('ffufWordlist', DEFAULT_WORDLIST);
        }
      }
    } catch {
      // Silently fail
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <FolderSearch size={16} />
          FFuf 디렉토리 퍼저
          <NodeInfoTooltip section="Ffuf" />
          <WikiInfoButton target="Ffuf" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.ffufEnabled && (
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
              title="FFuf 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.ffufEnabled}
              onChange={(checked) => updateField('ffufEnabled', checked)}
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
            워드리스트를 사용해 일반 경로를 무차별 대입하는 빠른
            디렉토리/엔드포인트 퍼저. 크롤러가 찾지 못하는 숨겨진 콘텐츠 (관리자
            패널, 백업 파일, 설정, 문서화되지 않은 API)를 발견합니다. 크롤러
            완료 후 실행되며 정찰된 기본 경로를 대상으로 스마트 퍼징을 수행할 수
            있습니다.
          </p>

          {data.ffufEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>스레드</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.ffufThreads}
                    onChange={(e) =>
                      updateField('ffufThreads', parseInt(e.target.value) || 40)
                    }
                    min={1}
                    max={200}
                  />
                  <span className={styles.fieldHint}>동시 요청 스레드</span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    요청 제한 (요청/초)
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.ffufRate}
                    onChange={(e) =>
                      updateField('ffufRate', parseInt(e.target.value) || 0)
                    }
                    min={0}
                  />
                  <span className={styles.fieldHint}>
                    최대 요청/초 (0 = 무제한)
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>병렬 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.ffufParallelism ?? 20}
                    onChange={(e) =>
                      updateField(
                        'ffufParallelism',
                        parseInt(e.target.value) || 20,
                      )
                    }
                    min={1}
                    max={50}
                  />
                  <span className={styles.fieldHint}>
                    병렬로 퍼징할 타겟 수
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    요청 타임아웃 (초)
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.ffufTimeout}
                    onChange={(e) =>
                      updateField('ffufTimeout', parseInt(e.target.value) || 10)
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>요청당 타임아웃</span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 시간 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.ffufMaxTime}
                    onChange={(e) =>
                      updateField(
                        'ffufMaxTime',
                        parseInt(e.target.value) || 1800,
                      )
                    }
                    min={60}
                  />
                  <span className={styles.fieldHint}>
                    타겟당 최대 전체 실행 시간
                  </span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  워드리스트{' '}
                  <span
                    style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}
                  >
                    (내장 또는 업로드)
                  </span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
                    alignItems: 'stretch',
                  }}
                >
                  <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                    <select
                      className="select"
                      value={data.ffufWordlist}
                      onChange={(e) =>
                        updateField(
                          'ffufWordlist',
                          e.target.value || DEFAULT_WORDLIST,
                        )
                      }
                      aria-label="FFuf wordlist"
                    >
                      <optgroup label="내장 (정찰 이미지의 SecLists)">
                        {BUILTIN_WORDLISTS.map((wl) => (
                          <option key={wl.path} value={wl.path}>
                            {wl.name}
                          </option>
                        ))}
                      </optgroup>
                      {canUpload && customWordlists.length === 0 && (
                        <optgroup label="사용자 커스텀 목록">
                          <option disabled value="__ffuf_no_custom_yet__">
                            (없음 — .txt 업로드 사용 →)
                          </option>
                        </optgroup>
                      )}
                      {customWordlists.length > 0 && (
                        <optgroup label="사용자 커스텀 목록">
                          {customWordlists.map((wl) => (
                            <option key={wl.path} value={wl.path}>
                              {wl.name} ({formatSize(wl.size)})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,text/plain"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    className="primaryButton"
                    style={{
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      flex: '0 0 auto',
                      alignSelf: 'flex-start',
                    }}
                    onClick={() =>
                      canUpload ? fileInputRef.current?.click() : undefined
                    }
                    disabled={isUploading || !canUpload}
                    title={
                      !canUpload
                        ? '커스텀 워드리스트를 업로드하려면 먼저 프로젝트를 저장하세요'
                        : '.txt 워드리스트 업로드 — 메뉴의 "사용자 커스텀 목록"에 표시됩니다'
                    }
                  >
                    {isUploading ? (
                      <Loader2 size={14} className={styles.spinner} />
                    ) : (
                      <Upload size={14} />
                    )}
                    {isUploading ? '업로드 중...' : '.txt 업로드'}
                  </button>
                </div>
                {uploadError && (
                  <span
                    className={styles.fieldHint}
                    style={{ color: 'var(--status-error)' }}
                  >
                    {uploadError}
                  </span>
                )}
                {!uploadError && !canUpload && (
                  <span className={styles.fieldHint}>
                    먼저 프로젝트를 저장하세요. 그어야 .txt 페이로드 목록 (50MB
                    제한)을 업로드하고 위 메뉴에서 선택할 수 있습니다.
                  </span>
                )}
                {!uploadError && canUpload && (
                  <span className={styles.fieldHint}>
                    커스텀 파일은 업로드하기 전에는{' '}
                    <strong>목록에 표시되지 않습니다</strong>.{' '}
                    <strong>.txt 업로드</strong>를 클릭하고, 드록다운의{' '}
                    <strong>사용자 커스텀 목록</strong> 아래에서 파일을
                    선택하세요.
                  </span>
                )}
              </div>

              {customWordlists.length > 0 && canUpload && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    업로드된 워드리스트
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-1)',
                    }}
                  >
                    {customWordlists.map((wl) => (
                      <div
                        key={wl.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-1) var(--space-2)',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-default)',
                          fontSize: 'var(--text-xs)',
                          border:
                            data.ffufWordlist === wl.path
                              ? '1px solid var(--accent-secondary)'
                              : '1px solid var(--border-default)',
                        }}
                      >
                        <span style={{ color: 'var(--text-primary)' }}>
                          {wl.name}
                          <span
                            style={{
                              color: 'var(--text-tertiary)',
                              marginLeft: 'var(--space-2)',
                            }}
                          >
                            {formatSize(wl.size)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(wl.name)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title={`Delete ${wl.name}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>매칭 상태 코드</label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.ffufMatchCodes ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'ffufMatchCodes',
                          e.target.value
                            .split(',')
                            .map((s) => parseInt(s.trim()))
                            .filter((n) => !isNaN(n)),
                        )
                      }
                    />
                    <FileImportButton
                      fieldName="status codes"
                      validator={(t) => /^\d+$/.test(t)}
                      onImport={(values) =>
                        updateField(
                          'ffufMatchCodes',
                          values
                            .map((v) => parseInt(v))
                            .filter((n) => !isNaN(n)),
                        )
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    포함할 HTTP 상태 코드 (콤마 구분)
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>필터 상태 코드</label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.ffufFilterCodes ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'ffufFilterCodes',
                          e.target.value
                            .split(',')
                            .map((s) => parseInt(s.trim()))
                            .filter((n) => !isNaN(n)),
                        )
                      }
                    />
                    <FileImportButton
                      fieldName="status codes"
                      validator={(t) => /^\d+$/.test(t)}
                      onImport={(values) =>
                        updateField(
                          'ffufFilterCodes',
                          values
                            .map((v) => parseInt(v))
                            .filter((n) => !isNaN(n)),
                        )
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    제외할 HTTP 상태 코드 (콤마 구분)
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>응답 크기 필터</label>
                  <input
                    type="text"
                    className="textInput"
                    value={data.ffufFilterSize}
                    onChange={(e) =>
                      updateField('ffufFilterSize', e.target.value)
                    }
                    placeholder="e.g., 0 or 4242"
                  />
                  <span className={styles.fieldHint}>
                    해당 크기의 응답 제외 (바이트). 동일한 오류 페이지 필터링에
                    유용
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>확장자</label>
                  <div
                    className={styles.toggleRow}
                    style={{
                      marginBottom: 'var(--space-2)',
                      alignItems: 'center',
                    }}
                  >
                    <AiToggleLabel
                      label="확장자에 AI 사용"
                      tooltip={
                        'AI가 서버 응답 헤더 (Server, X-Powered-By, X-AspNet-Version)를 ' +
                        '기반으로 타겟별 확장자를 선택합니다. 활성화 시 아래 정적 목록은 ' +
                        '무시됩니다. 타겟 탭 AI 패널의 토글과 동일: 여기서 바꾸면 거기에도 적용됩니다. ' +
                        '동일 스택의 N개 호스트는 하나의 LLM 호출로 철대됩니다. ' +
                        (!data.aiInPipeline
                          ? '타겟 탭 AI 패널에서 "파이프라인에 AI"를 활성화하세요.'
                          : '')
                      }
                    />
                    <Toggle
                      checked={data.ffufAiExtensions}
                      disabled={!data.aiInPipeline}
                      onChange={(checked) =>
                        updateField('ffufAiExtensions', checked)
                      }
                    />
                  </div>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.ffufExtensions ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'ffufExtensions',
                          e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder=".php, .bak, .env, .json"
                      disabled={data.ffufAiExtensions}
                      style={
                        data.ffufAiExtensions ? { opacity: 0.5 } : undefined
                      }
                    />
                    <FileImportButton
                      fieldName="extensions"
                      onImport={(values) =>
                        updateField('ffufExtensions', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    {data.ffufAiExtensions
                      ? 'AI가 타겟별로 확장자 선택. 위 정적 목록 무시.'
                      : '열어 단어에 추가할 파일 확장자 (콤마 구분)'}
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>옵션</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>자동 보정</span>
                    <p className={styles.toggleDescription}>
                      응답 패턴 기반으로 폐양성 자동 필터링
                    </p>
                  </div>
                  <Toggle
                    checked={data.ffufAutoCalibrate}
                    onChange={(checked) =>
                      updateField('ffufAutoCalibrate', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      스마트 퍼징 (크롤러 후)
                    </span>
                    <p className={styles.toggleDescription}>
                      크롤러가 발견한 기본 경로 아래도 퍼징 (e.g., /api/v1/FUZZ)
                    </p>
                  </div>
                  <Toggle
                    checked={data.ffufSmartFuzz}
                    onChange={(checked) =>
                      updateField('ffufSmartFuzz', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      리다이렉트 따르기
                    </span>
                    <p className={styles.toggleDescription}>
                      HTTP 리다이렉트 따르기. 범위 외 도메인으로 연결될 수 있음
                      (이후 필터링)
                    </p>
                  </div>
                  <Toggle
                    checked={data.ffufFollowRedirects}
                    onChange={(checked) =>
                      updateField('ffufFollowRedirects', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>재귀 퍼징</span>
                    <p className={styles.toggleDescription}>
                      발견된 디렉토리를 재귀적으로 퍼징
                    </p>
                  </div>
                  <Toggle
                    checked={data.ffufRecursion}
                    onChange={(checked) =>
                      updateField('ffufRecursion', checked)
                    }
                  />
                </div>
                {data.ffufRecursion && (
                  <div
                    className={styles.fieldGroup}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <label className={styles.fieldLabel}>재귀 깊이</label>
                    <input
                      type="number"
                      className="textInput"
                      value={data.ffufRecursionDepth}
                      onChange={(e) =>
                        updateField(
                          'ffufRecursionDepth',
                          parseInt(e.target.value) || 2,
                        )
                      }
                      min={1}
                      max={5}
                    />
                  </div>
                )}
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>커스텀 헤더</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 헤더</label>
                  <div className={styles.fileImportWrap}>
                    <textarea
                      className="textarea"
                      value={(data.ffufCustomHeaders ?? []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'ffufCustomHeaders',
                          e.target.value.split('\n').filter(Boolean),
                        )
                      }
                      placeholder="Cookie: session=abc123&#10;Authorization: Bearer token..."
                      rows={3}
                    />
                    <FileImportButton
                      variant="textarea"
                      fieldName="headers"
                      onImport={(values) =>
                        updateField('ffufCustomHeaders', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    헤더당 한 줄. 모든 요청에 포함
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
