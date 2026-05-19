'use client';

import { useState } from 'react';
import { ChevronDown, Network } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface MitreSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function MitreSection({ data, updateField }: MitreSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Network size={16} />
          MITRE ATT&CK / CWE / CAPEC
          <WikiInfoButton target="Mitre" />
          <span className={styles.badgePassive}>비활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.mitreEnabled}
              onChange={(checked) => updateField('mitreEnabled', checked)}
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
            발견된 취약점을 MITRE ATT&CK 기술, CWE 약점, CAPEC 공격 패턴과
            매핑합니다. 취약점이 어떻게 악용될 수 있는지 지원하는 컨텍스트를
            제공하고 처리 우선순위를 돕습니다.
          </p>
          {data.mitreEnabled && (
            <>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    데이터베이스 자동 업데이트
                  </span>
                  <p className={styles.toggleDescription}>
                    MITRE 데이터를 자동으로 업데이트 유지
                  </p>
                </div>
                <Toggle
                  checked={data.mitreAutoUpdateDb}
                  onChange={(checked) =>
                    updateField('mitreAutoUpdateDb', checked)
                  }
                />
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>데이터 소스</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>CWE 포함</span>
                    <p className={styles.toggleDescription}>공통 취약점 열거</p>
                  </div>
                  <Toggle
                    checked={data.mitreIncludeCwe}
                    onChange={(checked) =>
                      updateField('mitreIncludeCwe', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>CAPEC 포함</span>
                    <p className={styles.toggleDescription}>
                      공통 공격 패턴 열거
                    </p>
                  </div>
                  <Toggle
                    checked={data.mitreIncludeCapec}
                    onChange={(checked) =>
                      updateField('mitreIncludeCapec', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>실정찰 확대</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      정찰 결과 실정찰 확대
                    </span>
                    <p className={styles.toggleDescription}>
                      MITRE 데이터를 정찰 결과에 추가
                    </p>
                  </div>
                  <Toggle
                    checked={data.mitreEnrichRecon}
                    onChange={(checked) =>
                      updateField('mitreEnrichRecon', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      GVM 결과 실정찰 확대
                    </span>
                    <p className={styles.toggleDescription}>
                      MITRE 데이터를 GVM 결과에 추가
                    </p>
                  </div>
                  <Toggle
                    checked={data.mitreEnrichGvm}
                    onChange={(checked) =>
                      updateField('mitreEnrichGvm', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>캐시 TTL (시간)</label>
                <input
                  type="number"
                  className="textInput"
                  value={data.mitreCacheTtlHours}
                  onChange={(e) =>
                    updateField(
                      'mitreCacheTtlHours',
                      parseInt(e.target.value) || 24,
                    )
                  }
                  min={1}
                  max={168}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
