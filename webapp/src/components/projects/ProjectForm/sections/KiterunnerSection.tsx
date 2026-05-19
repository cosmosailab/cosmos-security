'use client';

import { useState } from 'react';
import { ChevronDown, Play, Zap } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { TimeEstimate } from '../TimeEstimate';
import { FileImportButton } from '../FileImportButton';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface KiterunnerSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function KiterunnerSection({
  data,
  updateField,
  onRun,
}: KiterunnerSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Zap size={16} />
          Kiterunner API Discovery
          <NodeInfoTooltip section="Kiterunner" />
          <WikiInfoButton target="Kiterunner" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.kiterunnerEnabled && (
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
              title="Kiterunner 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.kiterunnerEnabled}
              onChange={(checked) => updateField('kiterunnerEnabled', checked)}
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
            Assetnote의 Kiterunner를 사용한 API 엔드포인트 브루트포스.
            Swagger/OpenAPI 스펙에서 도출된 종합 워드리스트로 숨겨진 REST API
            경로를 탐지합니다.
          </p>

          {data.kiterunnerEnabled && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>워드리스트</label>
                <select
                  className="select"
                  value={data.kiterunnerWordlists[0] || 'routes-large'}
                  onChange={(e) =>
                    updateField('kiterunnerWordlists', [e.target.value])
                  }
                >
                  <option value="routes-large">
                    routes-large (API 경로 ~10만개)
                  </option>
                  <option value="routes-small">
                    routes-small (API 경로 ~2만개)
                  </option>
                </select>
                <span className={styles.fieldHint}>
                  Assetnote CDN의 API 라우트 워드리스트. 커스텀 .kite 파일은
                  CLI로 사용 가능
                </span>
                <TimeEstimate estimate="routes-large: ~10-30 min/endpoint | routes-small: ~5-10 min" />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 제한</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.kiterunnerRateLimit}
                    onChange={(e) =>
                      updateField(
                        'kiterunnerRateLimit',
                        parseInt(e.target.value) || 100,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    요청/초. 낙을수록 은밀해집니다
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>동시 연결 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.kiterunnerConnections}
                    onChange={(e) =>
                      updateField(
                        'kiterunnerConnections',
                        parseInt(e.target.value) || 100,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>대상당 동시 연결 수</span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.kiterunnerTimeout}
                    onChange={(e) =>
                      updateField(
                        'kiterunnerTimeout',
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>요청당 타임아웃</span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    스캔 타임아웃 (초)
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.kiterunnerScanTimeout}
                    onChange={(e) =>
                      updateField(
                        'kiterunnerScanTimeout',
                        parseInt(e.target.value) || 1000,
                      )
                    }
                    min={60}
                  />
                  <span className={styles.fieldHint}>
                    전체 스캔 타임아웃. 큰 워드리스트는 더 많은 시간 필요
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>스레드</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.kiterunnerThreads}
                    onChange={(e) =>
                      updateField(
                        'kiterunnerThreads',
                        parseInt(e.target.value) || 50,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>병렬 스캔 스레드</span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>병렬수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.kiterunnerParallelism ?? 2}
                    onChange={(e) =>
                      updateField(
                        'kiterunnerParallelism',
                        parseInt(e.target.value) || 2,
                      )
                    }
                    min={1}
                    max={5}
                  />
                  <span className={styles.fieldHint}>
                    병렬 처리할 워드리스트 수
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최소 콘텐츠 크기</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.kiterunnerMinContentLength}
                    onChange={(e) =>
                      updateField(
                        'kiterunnerMinContentLength',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min={0}
                  />
                  <span className={styles.fieldHint}>
                    이 크기 미만의 응답 무시 (bytes)
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>상태 코드 필터</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>제외 상태 코드</label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.kiterunnerIgnoreStatus ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'kiterunnerIgnoreStatus',
                          e.target.value
                            .split(',')
                            .map((s) => parseInt(s.trim()))
                            .filter((n) => !isNaN(n)),
                        )
                      }
                      placeholder="(empty = use whitelist only)"
                    />
                    <FileImportButton
                      fieldName="status codes"
                      validator={(t) => /^\d+$/.test(t)}
                      onImport={(values) =>
                        updateField(
                          'kiterunnerIgnoreStatus',
                          values
                            .map((v) => parseInt(v))
                            .filter((n) => !isNaN(n)),
                        )
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    블랙리스트: 일반 오류 노이즈 필터링
                  </span>
                </div>
                <div
                  className={styles.fieldGroup}
                  style={{ marginTop: '1rem' }}
                >
                  <label className={styles.fieldLabel}>매칭 상태 코드</label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.kiterunnerMatchStatus ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'kiterunnerMatchStatus',
                          e.target.value
                            .split(',')
                            .map((s) => parseInt(s.trim()))
                            .filter((n) => !isNaN(n)),
                        )
                      }
                      placeholder="200, 201, 204, 301, 302, 401, 403, 405"
                    />
                    <FileImportButton
                      fieldName="status codes"
                      validator={(t) => /^\d+$/.test(t)}
                      onImport={(values) =>
                        updateField(
                          'kiterunnerMatchStatus',
                          values
                            .map((v) => parseInt(v))
                            .filter((n) => !isNaN(n)),
                        )
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    화이트리스트: 이 상태 코드의 엔드포인트만 표시 (인증 폴함)
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>커스텀 헤더</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 헤더</label>
                  <div className={styles.fileImportWrap}>
                    <textarea
                      className="textarea"
                      value={(data.kiterunnerHeaders ?? []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'kiterunnerHeaders',
                          e.target.value.split('\n').filter(Boolean),
                        )
                      }
                      placeholder="Authorization: Bearer token123&#10;X-API-Key: key123"
                      rows={3}
                    />
                    <FileImportButton
                      variant="textarea"
                      fieldName="headers"
                      onImport={(values) =>
                        updateField('kiterunnerHeaders', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    인증된 API 스캔을 위한 인증 토큰 추가
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>메서드 감지</h3>
                <p
                  className={styles.fieldHint}
                  style={{ marginBottom: '0.5rem' }}
                >
                  Kiterunner 워드리스트는 GET 경로만 포함. 발견된 엔드포인트에서
                  POST/PUT/DELETE 메서드 감지
                </p>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>메서드 감지</span>
                    <p className={styles.toggleDescription}>
                      GET 외 추가 HTTP 메서드 탐지
                    </p>
                    <TimeEstimate estimate="+30-50% scan time" />
                  </div>
                  <Toggle
                    checked={data.kiterunnerDetectMethods}
                    onChange={(checked) =>
                      updateField('kiterunnerDetectMethods', checked)
                    }
                  />
                </div>

                {data.kiterunnerDetectMethods && (
                  <>
                    <div
                      className={styles.fieldGroup}
                      style={{ marginTop: '0.75rem' }}
                    >
                      <label className={styles.fieldLabel}>감지 모드</label>
                      <select
                        className="select"
                        value={data.kiterunnerMethodDetectionMode}
                        onChange={(e) =>
                          updateField(
                            'kiterunnerMethodDetectionMode',
                            e.target.value,
                          )
                        }
                      >
                        <option value="bruteforce">
                          브루트포스 - 각 메서드 시도 (느리지만 정확)
                        </option>
                        <option value="options">
                          OPTIONS 헤더 - Allow 헤더 파싱 (빠름)
                        </option>
                      </select>
                      <span className={styles.fieldHint}>
                        허용된 HTTP 메서드 탐지 방식
                      </span>
                    </div>
                    <div
                      className={styles.fieldGroup}
                      style={{ marginTop: '0.75rem' }}
                    >
                      <label className={styles.fieldLabel}>
                        브루트포스 메서드
                      </label>
                      <input
                        type="text"
                        className="textInput"
                        value={(data.kiterunnerBruteforceMethods ?? []).join(
                          ', ',
                        )}
                        onChange={(e) =>
                          updateField(
                            'kiterunnerBruteforceMethods',
                            e.target.value
                              .split(',')
                              .map((s) => s.trim().toUpperCase())
                              .filter(Boolean),
                          )
                        }
                        placeholder="POST, PUT, DELETE, PATCH"
                      />
                      <span className={styles.fieldHint}>
                        브루트포스 모드에서 시도할 메서드
                      </span>
                    </div>
                    <div
                      className={styles.fieldRow}
                      style={{ marginTop: '0.75rem' }}
                    >
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          메서드 감지 타임아웃
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={data.kiterunnerMethodDetectTimeout}
                          onChange={(e) =>
                            updateField(
                              'kiterunnerMethodDetectTimeout',
                              parseInt(e.target.value) || 5,
                            )
                          }
                          min={1}
                        />
                        <span className={styles.fieldHint}>
                          요청당 시간 (초)
                        </span>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          메서드 감지 요청 제한
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={data.kiterunnerMethodDetectRateLimit}
                          onChange={(e) =>
                            updateField(
                              'kiterunnerMethodDetectRateLimit',
                              parseInt(e.target.value) || 50,
                            )
                          }
                          min={1}
                        />
                        <span className={styles.fieldHint}>요청/초</span>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          메서드 감지 스레드
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={data.kiterunnerMethodDetectThreads}
                          onChange={(e) =>
                            updateField(
                              'kiterunnerMethodDetectThreads',
                              parseInt(e.target.value) || 25,
                            )
                          }
                          min={1}
                        />
                        <span className={styles.fieldHint}>동시 스레드</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
