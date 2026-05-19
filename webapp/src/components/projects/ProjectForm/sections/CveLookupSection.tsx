'use client';

import { useState } from 'react';
import { ChevronDown, Database } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface CveLookupSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function CveLookupSection({ data, updateField }: CveLookupSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Database size={16} />
          CVE 조회
          <NodeInfoTooltip section="CveLookup" />
          <WikiInfoButton target="CveLookup" />
          <span className={styles.badgePassive}>비활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.cveLookupEnabled}
              onChange={(checked) => updateField('cveLookupEnabled', checked)}
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
            NVD 및 기타 소스의 상세 CVE 데이터로 취약점 발견사항을 강화합니다.
            발견된 취약점에 대한 CVSS 점수, 영향받는 버전, 익스플로잏 상태, 조치
            가이드를 제공합니다.
          </p>

          {data.cveLookupEnabled && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>CVE 소스</label>
                <select
                  className="select"
                  value={data.cveLookupSource}
                  onChange={(e) =>
                    updateField('cveLookupSource', e.target.value)
                  }
                >
                  <option value="nvd">NVD (국가 취약점 데이터베이스)</option>
                  <option value="vulners">Vulners</option>
                </select>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>항목당 최대 CVE</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.cveLookupMaxCves}
                    onChange={(e) =>
                      updateField(
                        'cveLookupMaxCves',
                        parseInt(e.target.value) || 20,
                      )
                    }
                    min={1}
                    max={100}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최소 CVSS 점수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.cveLookupMinCvss}
                    onChange={(e) =>
                      updateField(
                        'cveLookupMinCvss',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    min={0}
                    max={10}
                    step={0.1}
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>API 키</h3>
                <p className={styles.fieldHint} style={{ marginTop: 0 }}>
                  NVD 및 Vulners API 키는{' '}
                  <a
                    href="/settings"
                    style={{
                      color: 'var(--color-accent)',
                      textDecoration: 'underline',
                    }}
                  >
                    전역 설정 &rarr; 도구 API 키
                  </a>
                  에서 설정합니다. 거기서 설정한 키는 모든 프로젝트에 자동
                  적용됩니다.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
