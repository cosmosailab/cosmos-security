'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Radar, AlertTriangle, Info, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import { useProject } from '@/providers/ProjectProvider';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface ShodanSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function ShodanSection({
  data,
  updateField,
  onRun,
}: ShodanSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { userId } = useProject();
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null); // null = loading

  const checkApiKey = useCallback(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((settings) => {
        if (settings) {
          setHasApiKey(!!settings.shodanApiKey);
        }
      })
      .catch(() => setHasApiKey(false));
  }, [userId]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const noKey = hasApiKey === false || hasApiKey === null;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Radar size={16} />
          Shodan Enrichment
          <NodeInfoTooltip section="Shodan" />
          <WikiInfoButton target="Shodan" />
          <span className={styles.badgePassive}>비활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.shodanEnabled && (
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
              title="Shodan 연구 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.shodanEnabled}
              onChange={(checked) => updateField('shodanEnabled', checked)}
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
            Shodan API를 사용한 패시브 인터넷 OSINT 연구. 도메인 탐지 후, 포트
            스캔 전에 실행됩니다. 대상에 트래픽을 보내지 않고 IP 노드에
            지리정보, 서비스, 알려진 취약점을 추가합니다. API 키가 없거나 무료
            플랜인 경우 Host Lookup, Reverse DNS, Passive CVEs는 Shodan
            InternetDB (도메인, 포트, CPE, CVE 제공)로 자동 폴백됩니다.
          </p>

          {data.shodanEnabled && (
            <>
              {noKey && (
                <div className={styles.shodanWarning}>
                  <Info size={14} />
                  No Shodan API 키 설정 안 됨 — Host Lookup, Reverse DNS,
                  Passive CVEs는 InternetDB (포트, 호스트명, CPE, CVE, 태그)를
                  사용합니다. 전체 데이터(지리정보, 배너, 서비스)를 원하면 전역
                  설정에서 키를 추가하세요.
                </div>
              )}

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>워커</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.shodanWorkers ?? 5}
                    onChange={(e) =>
                      updateField(
                        'shodanWorkers',
                        parseInt(e.target.value) || 5,
                      )
                    }
                    min={1}
                    max={20}
                  />
                  <span className={styles.fieldHint}>병렬 IP 조회 워커</span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>파이프라인 기능</h3>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>호스트 조회</span>
                    <p className={styles.toggleDescription}>
                      발견된 IP에서 OS, ISP, 조직, 지리정보, 열린 포트, 서비스
                      배너, 취약점을 조회합니다.
                      {noKey && (
                        <em>
                          {' '}
                          (InternetDB 폴백: 포트, 호스트명, CPE, CVE — 지리/배너
                          제외)
                        </em>
                      )}
                    </p>
                  </div>
                  <Toggle
                    checked={data.shodanHostLookup}
                    onChange={(checked) =>
                      updateField('shodanHostLookup', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>역방향 DNS</span>
                    <p className={styles.toggleDescription}>
                      알려진 IP로 확인되는 호스트명 탐지. 일반 열거에서 발견되지
                      않은 추가 서브도메인을 요상할 수 있습니다.
                      {noKey && <em> (InternetDB 폴백)</em>}
                    </p>
                  </div>
                  <Toggle
                    checked={data.shodanReverseDns}
                    onChange={(checked) =>
                      updateField('shodanReverseDns', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>도메인 DNS</span>
                    <p className={styles.toggleDescription}>
                      Shodan DNS 데이터베이스를 통해 서브도메인과 DNS 레코드를
                      열거합니다. <em>(유료 Shodan 플랜 + API 키 필요)</em>
                    </p>
                  </div>
                  <Toggle
                    checked={data.shodanDomainDns}
                    onChange={(checked) =>
                      updateField('shodanDomainDns', checked)
                    }
                    disabled={noKey}
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>패시브 CVE</span>
                    <p className={styles.toggleDescription}>
                      Shodan 취약점 데이터베이스에서 발견된 IP와 연관된 CVE
                      추출. 능동 스캔 불필요.
                      {noKey && <em> (InternetDB 폴백)</em>}
                    </p>
                  </div>
                  <Toggle
                    checked={data.shodanPassiveCves}
                    onChange={(checked) =>
                      updateField('shodanPassiveCves', checked)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
