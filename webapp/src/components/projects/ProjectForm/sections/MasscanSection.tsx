'use client';

import { useState } from 'react';
import { ChevronDown, Play, Radar } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { TimeEstimate } from '../TimeEstimate';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface MasscanSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function MasscanSection({
  data,
  updateField,
  onRun,
}: MasscanSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Radar size={16} />
          Masscan 포트 스칌너
          <NodeInfoTooltip section="Masscan" />
          <WikiInfoButton target="Masscan" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.masscanEnabled && (
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
              title="Masscan 포트 스칌너 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.masscanEnabled}
              onChange={(checked) => updateField('masscanEnabled', checked)}
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
            대규모 네트워크 및 IP/CIDR 범위에 최적화된 고속 SYN 포트 스칌너.
            최대 속도를 위해 로우 패킷을 사용합니다. root 또는 CAP_NET_RAW
            권한이 필요합니다. Tor와 호환되지 않습니다 (로우 SYN 패킷이 TCP
            스택을 우회함).
          </p>

          {data.masscanEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>상위 포트</label>
                  <input
                    type="text"
                    className="textInput"
                    value={data.masscanTopPorts}
                    onChange={(e) =>
                      updateField('masscanTopPorts', e.target.value)
                    }
                    placeholder="1000"
                  />
                  <span className={styles.fieldHint}>
                    &ldquo;100&rdquo;, &ldquo;1000&rdquo; 또는 전체 65535포트를
                    위해 &ldquo;full&rdquo; 사용
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>커스텀 포트</label>
                  <input
                    type="text"
                    className="textInput"
                    value={data.masscanCustomPorts}
                    onChange={(e) =>
                      updateField('masscanCustomPorts', e.target.value)
                    }
                    placeholder="80,443,8080-8090"
                  />
                  <span className={styles.fieldHint}>
                    설정 시 상위 포트를 재정의. 범위 사용: 8080-8090
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>속도 (패킷/초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.masscanRate}
                    onChange={(e) =>
                      updateField(
                        'masscanRate',
                        parseInt(e.target.value) || 1000,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    패킷/초. Masscan은 매우 높은 속도를 지원합니다 (10k+)
                  </span>
                  <TimeEstimate estimate="1000: safe default | 10000+: fast but may overwhelm targets" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>대기 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.masscanWait}
                    onChange={(e) =>
                      updateField('masscanWait', parseInt(e.target.value) || 10)
                    }
                    min={0}
                  />
                  <span className={styles.fieldHint}>
                    스캔 완료 후 늦은 응답을 기다리는 시간 (초)
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>재시도</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.masscanRetries}
                    onChange={(e) =>
                      updateField(
                        'masscanRetries',
                        parseInt(e.target.value) || 1,
                      )
                    }
                    min={0}
                    max={10}
                  />
                  <span className={styles.fieldHint}>
                    응답 없는 포트에 대한 재시도 횟수
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>제외 타겟</label>
                  <input
                    type="text"
                    className="textInput"
                    value={data.masscanExcludeTargets}
                    onChange={(e) =>
                      updateField('masscanExcludeTargets', e.target.value)
                    }
                    placeholder="10.0.0.1, 192.168.0.0/24"
                  />
                  <span className={styles.fieldHint}>
                    스캄에서 제외할 IP/CIDR (콤마 구분)
                  </span>
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>배너 그랞빙</span>
                  <p className={styles.toggleDescription}>
                    서비스 배너 캐직 (SSH, HTTP 등). 스캄 시간이 늘어나지만 더
                    풍부한 데이터를 제공합니다.
                  </p>
                </div>
                <Toggle
                  checked={data.masscanBanners}
                  onChange={(checked) => updateField('masscanBanners', checked)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
