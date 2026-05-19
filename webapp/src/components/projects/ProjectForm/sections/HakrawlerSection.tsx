'use client';

import { useState } from 'react';
import { Bug, ChevronDown, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { FileImportButton } from '../FileImportButton';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface HakrawlerSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function HakrawlerSection({
  data,
  updateField,
  onRun,
}: HakrawlerSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Bug size={16} />
          Hakrawler 웹 크롤러
          <NodeInfoTooltip section="Hakrawler" />
          <WikiInfoButton target="Hakrawler" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.hakrawlerEnabled && (
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
              title="Hakrawler 웹 크롤러 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.hakrawlerEnabled}
              onChange={(checked) => updateField('hakrawlerEnabled', checked)}
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
            URL과 JavaScript 파일 위치를 탐지하는 빠른 Go 기반 웹 크롤러. 다른
            크롤 엔진으로 Katana를 보완하여 추가 엔드포인트를 발견합니다. stdin
            기반 Docker 실행 사용.
          </p>

          {data.hakrawlerEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>크롤 깊이</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.hakrawlerDepth}
                    onChange={(e) =>
                      updateField(
                        'hakrawlerDepth',
                        parseInt(e.target.value) || 2,
                      )
                    }
                    min={1}
                    max={10}
                  />
                  <span className={styles.fieldHint}>
                    링크를 몇 단계까지 따라가는지
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 URL</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.hakrawlerMaxUrls}
                    onChange={(e) =>
                      updateField(
                        'hakrawlerMaxUrls',
                        parseInt(e.target.value) || 50000,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    수집할 최대 URL 수 (한도 도달 시 프로세스 종료)
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>스레드</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.hakrawlerThreads}
                    onChange={(e) =>
                      updateField(
                        'hakrawlerThreads',
                        parseInt(e.target.value) || 5,
                      )
                    }
                    min={1}
                    max={20}
                  />
                  <span className={styles.fieldHint}>동시 크롤 스레드</span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.hakrawlerTimeout}
                    onChange={(e) =>
                      updateField(
                        'hakrawlerTimeout',
                        parseInt(e.target.value) || 30,
                      )
                    }
                    min={5}
                  />
                  <span className={styles.fieldHint}>URL당 크롤 타임아웃</span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>병렬 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.hakrawlerParallelism ?? 4}
                    onChange={(e) =>
                      updateField(
                        'hakrawlerParallelism',
                        parseInt(e.target.value) || 4,
                      )
                    }
                    min={1}
                    max={10}
                  />
                  <span className={styles.fieldHint}>병렬로 크롤할 URL 수</span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>옵션</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>서브도메인 포함</span>
                    <p className={styles.toggleDescription}>
                      타겟의 서브도메인으로 링크를 따라가도록 허용. 결과는
                      여전히 범위 필터링됨
                    </p>
                  </div>
                  <Toggle
                    checked={data.hakrawlerIncludeSubs}
                    onChange={(checked) =>
                      updateField('hakrawlerIncludeSubs', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>비안전 TLS</span>
                    <p className={styles.toggleDescription}>
                      TLS 인증서 검증 건너맰 (자체 서명 인증서에 유용)
                    </p>
                  </div>
                  <Toggle
                    checked={data.hakrawlerInsecure}
                    onChange={(checked) =>
                      updateField('hakrawlerInsecure', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>커스텀 헤더</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 헤더</label>
                  <div className={styles.fileImportWrap}>
                    <textarea
                      className="textarea"
                      value={(data.hakrawlerCustomHeaders ?? []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'hakrawlerCustomHeaders',
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
                        updateField('hakrawlerCustomHeaders', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    헤더당 한 줄 (Cookie: value 등). 모든 요청에 포함
                  </span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Docker 이미지</label>
                <input
                  type="text"
                  className="textInput"
                  value={data.hakrawlerDockerImage}
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
