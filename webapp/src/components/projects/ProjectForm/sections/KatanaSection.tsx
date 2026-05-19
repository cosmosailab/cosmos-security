'use client';

import { useState } from 'react';
import { Bug, ChevronDown, Play } from 'lucide-react';
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

interface KatanaSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function KatanaSection({
  data,
  updateField,
  onRun,
}: KatanaSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Bug size={16} />
          Katana Web Crawler (DAST)
          <NodeInfoTooltip section="Katana" />
          <WikiInfoButton target="Katana" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.katanaEnabled && (
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
              title="Katana 웹 크롤러 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.katanaEnabled}
              onChange={(checked) => updateField('katanaEnabled', checked)}
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
            ProjectDiscovery의 Katana를 사용한 능동 웹 크롤링. 링크를 따라가고
            JavaScript를 파싱하여 URL, 엔드포인트, 파라미터를 탐지합니다.
            파라미터가 있는 URL은 Nuclei DAST 모드에서 퍼징에 사용됩니다.
          </p>

          {data.katanaEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>크롤 깊이</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.katanaDepth}
                    onChange={(e) =>
                      updateField('katanaDepth', parseInt(e.target.value) || 2)
                    }
                    min={1}
                    max={10}
                  />
                  <span className={styles.fieldHint}>
                    링크를 따라가는 깊이. 높을수록 URL 많지만 느려집니다
                  </span>
                  <TimeEstimate estimate="Each level adds ~50% time (depth 3 = ~2x depth 2)" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 URL 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.katanaMaxUrls}
                    onChange={(e) =>
                      updateField(
                        'katanaMaxUrls',
                        parseInt(e.target.value) || 300000,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    도메인당 수집할 최대 URL 수
                  </span>
                  <TimeEstimate estimate="300 URLs: ~1-2 min/domain | 1000+: scales linearly" />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 제한</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.katanaRateLimit}
                    onChange={(e) =>
                      updateField(
                        'katanaRateLimit',
                        parseInt(e.target.value) || 50,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    대상 과부하를 준이는 초당 요청 수
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.katanaTimeout}
                    onChange={(e) =>
                      updateField(
                        'katanaTimeout',
                        parseInt(e.target.value) || 3600,
                      )
                    }
                    min={60}
                  />
                  <span className={styles.fieldHint}>
                    전체 크롤 타임아웃 (기본: 60분)
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>병렬수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.katanaParallelism ?? 5}
                    onChange={(e) =>
                      updateField(
                        'katanaParallelism',
                        parseInt(e.target.value) || 5,
                      )
                    }
                    min={1}
                    max={50}
                  />
                  <span className={styles.fieldHint}>
                    동시에 크롤할 대상 URL 수
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>동시 실행 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.katanaConcurrency ?? 10}
                    onChange={(e) =>
                      updateField(
                        'katanaConcurrency',
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={1}
                    max={50}
                  />
                  <span className={styles.fieldHint}>
                    대상 URL당 동시 페치어 수
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>옵션</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      JavaScript 크롤링
                    </span>
                    <p className={styles.toggleDescription}>
                      JS 파일을 파싱하여 숨겨진 엔드포인트와 API 호출 탐지.
                      느리지만 더 많은 URL 발견
                    </p>
                    <TimeEstimate estimate="+50-100% (uses headless browser)" />
                  </div>
                  <Toggle
                    checked={data.katanaJsCrawl}
                    onChange={(checked) =>
                      updateField('katanaJsCrawl', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>파라미터 URL만</span>
                    <p className={styles.toggleDescription}>
                      DAST 퍼징을 위해 쿼리 파라미터(?key=value)가 있는 URL만
                      유지
                    </p>
                  </div>
                  <Toggle
                    checked={data.katanaParamsOnly}
                    onChange={(checked) =>
                      updateField('katanaParamsOnly', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>제외 패턴</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>제외할 URL 패턴</label>
                  <div className={styles.fileImportWrap}>
                    <textarea
                      className="textarea"
                      value={(data.katanaExcludePatterns ?? []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'katanaExcludePatterns',
                          e.target.value.split('\n').filter(Boolean),
                        )
                      }
                      placeholder="/_next/static&#10;.png&#10;.css&#10;/images/"
                      rows={5}
                    />
                    <FileImportButton
                      variant="textarea"
                      fieldName="exclude patterns"
                      onImport={(values) =>
                        updateField('katanaExcludePatterns', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    정적 자산, 이미지, CDN URL 제외. 인젝션 취약점이 없는
                    항목입니다
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
                      value={(data.katanaCustomHeaders ?? []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'katanaCustomHeaders',
                          e.target.value.split('\n').filter(Boolean),
                        )
                      }
                      placeholder="User-Agent: Mozilla/5.0...&#10;Accept: text/html..."
                      rows={3}
                    />
                    <FileImportButton
                      variant="textarea"
                      fieldName="headers"
                      onImport={(values) =>
                        updateField('katanaCustomHeaders', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    DAST 크롤링 중 탐지를 피하는 브라우저와 유사한 헤더
                  </span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Docker 이미지</label>
                <input
                  type="text"
                  className="textInput"
                  value={data.katanaDockerImage}
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
