'use client';

import { useState } from 'react';
import { ChevronDown, Link, Play } from 'lucide-react';
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

interface GauSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

const PROVIDER_OPTIONS = ['wayback', 'commoncrawl', 'otx', 'urlscan'];

export function GauSection({ data, updateField, onRun }: GauSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleProvider = (provider: string) => {
    const current = data.gauProviders ?? [];
    if (current.includes(provider)) {
      updateField(
        'gauProviders',
        current.filter((p) => p !== provider),
      );
    } else {
      updateField('gauProviders', [...current, provider]);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Link size={16} />
          GAU (GetAllUrls) Passive Discovery
          <NodeInfoTooltip section="Gau" />
          <WikiInfoButton target="Gau" />
          <span className={styles.badgePassive}>비활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.gauEnabled && (
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
              title="GAU 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.gauEnabled}
              onChange={(checked) => updateField('gauEnabled', checked)}
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
            GetAllUrls (GAU)를 사용한 패시브 URL 탐지. 대상에 직접 접근하지 않고
            웹 아카이브와 위협 인텔리전스 소스에서 과거 URL을 조회합니다.
            Katana의 능동 크롤링을 아카이브 데이터로 보완합니다. GAU는 API 키가
            필요하지 않습니다. URLScan에서 더 많은 결과를 얻으려면{' '}
            <strong>설정 &gt; 도구 API 키</strong>에서 URLScan API 키를
            설정하세요.
          </p>

          {data.gauEnabled && (
            <>
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>프로바이더</h3>
                <p
                  className={styles.fieldHint}
                  style={{ marginBottom: '0.5rem' }}
                >
                  아카이브 URL을 조회할 데이터 소스
                </p>
                <div className={styles.checkboxGroup}>
                  {PROVIDER_OPTIONS.map((provider) => (
                    <label key={provider} className="checkboxLabel">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={(data.gauProviders ?? []).includes(provider)}
                        onChange={() => toggleProvider(provider)}
                      />
                      {provider}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 URL 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.gauMaxUrls}
                    onChange={(e) =>
                      updateField(
                        'gauMaxUrls',
                        parseInt(e.target.value) || 50000,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    도메인당 최대 조회 URL 수 (0 = 무제한)
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.gauTimeout}
                    onChange={(e) =>
                      updateField('gauTimeout', parseInt(e.target.value) || 60)
                    }
                    min={10}
                  />
                  <span className={styles.fieldHint}>
                    프로바이더당 요청 타임아웃
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>스레드</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.gauThreads}
                    onChange={(e) =>
                      updateField('gauThreads', parseInt(e.target.value) || 5)
                    }
                    min={1}
                    max={20}
                  />
                  <span className={styles.fieldHint}>병렬 페치 스레드</span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>워커</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.gauWorkers ?? 10}
                    onChange={(e) =>
                      updateField('gauWorkers', parseInt(e.target.value) || 10)
                    }
                    min={1}
                    max={20}
                  />
                  <span className={styles.fieldHint}>
                    병렬 도메인 쿼리 워커
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>연도 범위</label>
                  <input
                    type="text"
                    className="textInput"
                    value={(data.gauYearRange ?? []).join(', ')}
                    onChange={(e) =>
                      updateField(
                        'gauYearRange',
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="2020, 2024 (empty = all years)"
                  />
                  <span className={styles.fieldHint}>
                    Wayback Machine 연도 필터 (예: 2020, 2024)
                  </span>
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>상세 로그</span>
                  <p className={styles.toggleDescription}>
                    디버깅용 상세 로깅 활성화
                  </p>
                </div>
                <Toggle
                  checked={data.gauVerbose}
                  onChange={(checked) => updateField('gauVerbose', checked)}
                />
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>블랙리스트 확장자</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    제외할 파일 확장자
                  </label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.gauBlacklistExtensions ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'gauBlacklistExtensions',
                          e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="png, jpg, css, pdf, zip"
                    />
                    <FileImportButton
                      fieldName="extensions"
                      onImport={(values) =>
                        updateField('gauBlacklistExtensions', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    이미지, 폰트, 실제 문서 등 정적 자산 제외
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>URL 검증</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>URL 검증</span>
                    <p className={styles.toggleDescription}>
                      HTTP 확인으로 아카이브 URL이 여전히 존재하는지 확인. 데드
                      링크 필터링
                    </p>
                    <TimeEstimate estimate="Doubles or triples GAU time" />
                  </div>
                  <Toggle
                    checked={data.gauVerifyUrls}
                    onChange={(checked) =>
                      updateField('gauVerifyUrls', checked)
                    }
                  />
                </div>

                {data.gauVerifyUrls && (
                  <>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          검증 타임아웃
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={data.gauVerifyTimeout}
                          onChange={(e) =>
                            updateField(
                              'gauVerifyTimeout',
                              parseInt(e.target.value) || 5,
                            )
                          }
                          min={1}
                        />
                        <span className={styles.fieldHint}>
                          URL당 확인 시간 (초)
                        </span>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          검증 요청 제한
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={data.gauVerifyRateLimit}
                          onChange={(e) =>
                            updateField(
                              'gauVerifyRateLimit',
                              parseInt(e.target.value) || 100,
                            )
                          }
                          min={1}
                        />
                        <span className={styles.fieldHint}>요청/초</span>
                      </div>
                    </div>

                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>검증 스레드</label>
                        <input
                          type="number"
                          className="textInput"
                          value={data.gauVerifyThreads}
                          onChange={(e) =>
                            updateField(
                              'gauVerifyThreads',
                              parseInt(e.target.value) || 50,
                            )
                          }
                          min={1}
                          max={100}
                        />
                        <span className={styles.fieldHint}>
                          동시 검증 스레드
                        </span>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          검증 Docker 이미지
                        </label>
                        <input
                          type="text"
                          className="textInput"
                          value={data.gauVerifyDockerImage}
                          disabled
                        />
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        허용 상태 코드
                      </label>
                      <div className={styles.fileImportWrap}>
                        <input
                          type="text"
                          className="textInput"
                          value={(data.gauVerifyAcceptStatus ?? []).join(', ')}
                          onChange={(e) =>
                            updateField(
                              'gauVerifyAcceptStatus',
                              e.target.value
                                .split(',')
                                .map((s) => parseInt(s.trim()))
                                .filter((n) => !isNaN(n)),
                            )
                          }
                          placeholder="200, 201, 301, 302, 307, 308, 401, 403"
                        />
                        <FileImportButton
                          fieldName="status codes"
                          validator={(t) => /^\d+$/.test(t)}
                          onImport={(values) =>
                            updateField(
                              'gauVerifyAcceptStatus',
                              values
                                .map((v) => parseInt(v))
                                .filter((n) => !isNaN(n)),
                            )
                          }
                        />
                      </div>
                      <span className={styles.fieldHint}>
                        질의 URL을 나타내는 상태 코드. 401/403도 포함 (인증 보호
                        엔드포인트 포함)
                      </span>
                    </div>

                    <div className={styles.toggleRow}>
                      <div>
                        <span className={styles.toggleLabel}>
                          HTTP 메서드 감지
                        </span>
                        <p className={styles.toggleDescription}>
                          OPTIONS 요청으로 허용된 메서드 탐지 (GET, POST, PUT,
                          DELETE)
                        </p>
                        <TimeEstimate estimate="+30-50% on top of verification time" />
                      </div>
                      <Toggle
                        checked={data.gauDetectMethods}
                        onChange={(checked) =>
                          updateField('gauDetectMethods', checked)
                        }
                      />
                    </div>

                    {data.gauDetectMethods && (
                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            메서드 감지 타임아웃
                          </label>
                          <input
                            type="number"
                            className="textInput"
                            value={data.gauMethodDetectTimeout}
                            onChange={(e) =>
                              updateField(
                                'gauMethodDetectTimeout',
                                parseInt(e.target.value) || 5,
                              )
                            }
                            min={1}
                          />
                          <span className={styles.fieldHint}>
                            OPTIONS 요청당 시간 (초)
                          </span>
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            메서드 감지 요청 제한
                          </label>
                          <input
                            type="number"
                            className="textInput"
                            value={data.gauMethodDetectRateLimit}
                            onChange={(e) =>
                              updateField(
                                'gauMethodDetectRateLimit',
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
                            value={data.gauMethodDetectThreads}
                            onChange={(e) =>
                              updateField(
                                'gauMethodDetectThreads',
                                parseInt(e.target.value) || 25,
                              )
                            }
                            min={1}
                          />
                          <span className={styles.fieldHint}>동시 스레드</span>
                        </div>
                      </div>
                    )}

                    <div className={styles.toggleRow}>
                      <div>
                        <span className={styles.toggleLabel}>
                          데드 엔드포인트 필터링
                        </span>
                        <p className={styles.toggleDescription}>
                          404/500/타임아웃 응답 URL을 최종 결과에서 제외
                        </p>
                      </div>
                      <Toggle
                        checked={data.gauFilterDeadEndpoints}
                        onChange={(checked) =>
                          updateField('gauFilterDeadEndpoints', checked)
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Docker 이미지</label>
                <input
                  type="text"
                  className="textInput"
                  value={data.gauDockerImage}
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
