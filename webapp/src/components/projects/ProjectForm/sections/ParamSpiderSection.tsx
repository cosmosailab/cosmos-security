'use client';

import { useState } from 'react';
import { ChevronDown, Search, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface ParamSpiderSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function ParamSpiderSection({
  data,
  updateField,
  onRun,
}: ParamSpiderSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Search size={16} />
          ParamSpider Parameter Discovery
          <NodeInfoTooltip section="ParamSpider" />
          <WikiInfoButton target="ParamSpider" />
          <span className={styles.badgePassive}>비활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.paramspiderEnabled && (
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
              title="ParamSpider 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.paramspiderEnabled}
              onChange={(checked) => updateField('paramspiderEnabled', checked)}
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
            ParamSpider를 사용한 패시브 URL 파라미터 탐지. Wayback Machine에서
            쿼리 파라미터가 포함된 URL을 조회합니다. ?key=value 형태의 URL만
            반환하므로 퍼징과 취약점 테스트에 직접 활용할 수 있습니다. API 키가
            필요하지 않습니다.
          </p>

          {data.paramspiderEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>플레이스홀더</label>
                  <input
                    type="text"
                    className="textInput"
                    value={data.paramspiderPlaceholder}
                    onChange={(e) =>
                      updateField(
                        'paramspiderPlaceholder',
                        e.target.value || 'FUZZ',
                      )
                    }
                  />
                  <span className={styles.fieldHint}>
                    파라미터 값 대체 문자열 (예: 퍼징 도구용 FUZZ)
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.paramspiderTimeout}
                    onChange={(e) =>
                      updateField(
                        'paramspiderTimeout',
                        parseInt(e.target.value) || 120,
                      )
                    }
                    min={10}
                  />
                  <span className={styles.fieldHint}>
                    도메인당 쿼리 타임아웃
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>워커</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.paramspiderWorkers ?? 5}
                    onChange={(e) =>
                      updateField(
                        'paramspiderWorkers',
                        parseInt(e.target.value) || 5,
                      )
                    }
                    min={1}
                    max={10}
                  />
                  <span className={styles.fieldHint}>병렬 도메인 워커</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
