'use client';

import { useState } from 'react';
import { ChevronDown, Search, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { TimeEstimate } from '../TimeEstimate';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface ArjunSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

const METHOD_OPTIONS = ['GET', 'POST', 'JSON', 'XML'];

const METHOD_LABELS: Record<string, string> = {
  GET: 'GET — Query parameters',
  POST: 'POST — Form body',
  JSON: 'JSON — JSON body',
  XML: 'XML — XML body',
};

export function ArjunSection({ data, updateField, onRun }: ArjunSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleMethod = (method: string) => {
    const current = data.arjunMethods ?? ['GET'];
    if (current.includes(method)) {
      // Don't allow deselecting the last method
      if (current.length <= 1) return;
      updateField(
        'arjunMethods',
        current.filter((m) => m !== method),
      );
    } else {
      updateField('arjunMethods', [...current, method]);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Search size={16} />
          Arjun (파라미터 탐색)
          <NodeInfoTooltip section="Arjun" />
          <WikiInfoButton target="Arjun" />
          <span className={styles.badgeActive}>활성</span>
          {data.arjunPassive && (
            <span className={styles.badgePassive}>비활성</span>
          )}
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.arjunEnabled && (
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
              title="Arjun 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.arjunEnabled}
              onChange={(checked) => updateField('arjunEnabled', checked)}
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
            약 25,000개 일반 파라미터 이름을 타겟 엔드포인트에 테스트하여 숨겨진
            HTTP 쿼리/바디 파라미터를 탐지합니다. HTML 폼이나 JavaScript에
            노드되지 않는 디버그 파라미터, 관리자 기능, 숨겨진 API 입력을
            발견합니다. 여러 메서드를 병렬로 실행합니다.
          </p>

          {data.arjunEnabled && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>HTTP 메서드</label>
                <p
                  className={styles.fieldHint}
                  style={{ marginBottom: '0.5rem' }}
                >
                  테스트할 파라미터 위치 선택. 여러 메서드는 병렬로 실행됩니다.
                </p>
                <div className={styles.checkboxGroup}>
                  {METHOD_OPTIONS.map((method) => (
                    <label key={method} className="checkboxLabel">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={(data.arjunMethods ?? ['GET']).includes(
                          method,
                        )}
                        onChange={() => toggleMethod(method)}
                      />
                      {METHOD_LABELS[method]}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 엔드포인트</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.arjunMaxEndpoints}
                    onChange={(e) =>
                      updateField(
                        'arjunMaxEndpoints',
                        parseInt(e.target.value) || 50000,
                      )
                    }
                    min={1}
                    max={50000}
                  />
                  <span className={styles.fieldHint}>
                    테스트할 최대 로드된 엔드포인트. API/동적 엔드포인트 우선.
                  </span>
                  <TimeEstimate estimate="~10s per endpoint per method" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>스레드</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.arjunThreads}
                    onChange={(e) =>
                      updateField('arjunThreads', parseInt(e.target.value) || 2)
                    }
                    min={1}
                    max={20}
                  />
                  <span className={styles.fieldHint}>
                    동시 파라미터 테스트 스레드
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
                    value={data.arjunTimeout}
                    onChange={(e) =>
                      updateField(
                        'arjunTimeout',
                        parseInt(e.target.value) || 15,
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
                    value={data.arjunScanTimeout}
                    onChange={(e) =>
                      updateField(
                        'arjunScanTimeout',
                        parseInt(e.target.value) || 600,
                      )
                    }
                    min={60}
                  />
                  <span className={styles.fieldHint}>
                    메서드별 전체 스캔 타임아웃
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>청크 크기</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.arjunChunkSize}
                    onChange={(e) =>
                      updateField(
                        'arjunChunkSize',
                        parseInt(e.target.value) || 500,
                      )
                    }
                    min={10}
                    max={5000}
                  />
                  <span className={styles.fieldHint}>
                    요청 배치당 테스트할 파라미터 수. 낮을수록 요청 증가/정확도
                    향상
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 제한</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.arjunRateLimit}
                    onChange={(e) =>
                      updateField(
                        'arjunRateLimit',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min={0}
                  />
                  <span className={styles.fieldHint}>
                    최대 요청/초 (0 = 무제한)
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>옵션</h3>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>안정 모드</span>
                    <p className={styles.toggleDescription}>
                      WAF 탐지를 피하기 위해 요청 간 랜덤 지연 추가
                    </p>
                  </div>
                  <Toggle
                    checked={data.arjunStable}
                    onChange={(checked) => updateField('arjunStable', checked)}
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>패시브 모드</span>
                    <p className={styles.toggleDescription}>
                      CommonCrawl, OTX, WaybackMachine만 사용 — 타겟에 직접 요청
                      없음
                    </p>
                  </div>
                  <Toggle
                    checked={data.arjunPassive}
                    onChange={(checked) => updateField('arjunPassive', checked)}
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      리다이렉트 비활성화
                    </span>
                    <p className={styles.toggleDescription}>
                      파라미터 테스트 중 HTTP 리다이렉트를 따르지 않음
                    </p>
                  </div>
                  <Toggle
                    checked={data.arjunDisableRedirects}
                    onChange={(checked) =>
                      updateField('arjunDisableRedirects', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>커스텀 헤더</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 헤더</label>
                  <textarea
                    className="textarea"
                    value={(data.arjunCustomHeaders ?? []).join('\n')}
                    onChange={(e) =>
                      updateField(
                        'arjunCustomHeaders',
                        e.target.value.split('\n').filter(Boolean),
                      )
                    }
                    placeholder="Authorization: Bearer token123&#10;X-API-Key: key123"
                    rows={3}
                  />
                  <span className={styles.fieldHint}>
                    인증 파라미터 테스트를 위한 인증 토큰 또는 커스텀 헤더 추가
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
