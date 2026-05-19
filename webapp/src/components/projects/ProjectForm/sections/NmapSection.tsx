'use client';

import { useState } from 'react';
import { ChevronDown, Play, Shield } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface NmapSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function NmapSection({ data, updateField, onRun }: NmapSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Shield size={16} />
          Nmap 서비스 탐지
          <NodeInfoTooltip section="Nmap" />
          <WikiInfoButton target="Nmap" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.nmapEnabled && (
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
              title="Nmap 서비스 탐지 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.nmapEnabled}
              onChange={(checked) => updateField('nmapEnabled', checked)}
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
            서비스 버전 심층 탐지 (-sV) 및 NSE 취약점 스크립트 (--script vuln).
            포트 탐지 후 실행되어 각 열린 포트의 정확한 소프트웨어 버전 및
            알려진 CVE를 식별합니다.
          </p>

          {data.nmapEnabled && (
            <>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>버전 탐지 (-sV)</span>
                  <p className={styles.toggleDescription}>
                    열린 포트를 프로빙하여 서비스/버전 정보 확인. CVE 매칭에
                    필수.
                  </p>
                </div>
                <Toggle
                  checked={data.nmapVersionDetection}
                  onChange={(checked) =>
                    updateField('nmapVersionDetection', checked)
                  }
                />
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    NSE 취약점 스크립트 (--script vuln)
                  </span>
                  <p className={styles.toggleDescription}>
                    Nmap 스크립팅 엔진 취약점 점검 실행 (vsftpd 백도어,
                    Log4Shell 등). 스텔스 모드에서 비활성화.
                  </p>
                </div>
                <Toggle
                  checked={data.nmapScriptScan}
                  onChange={(checked) => updateField('nmapScriptScan', checked)}
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타이밍 템플릿</label>
                  <select
                    className="textInput"
                    value={data.nmapTimingTemplate}
                    onChange={(e) =>
                      updateField('nmapTimingTemplate', e.target.value)
                    }
                  >
                    <option value="T1">T1 - 스닙형</option>
                    <option value="T2">T2 - 예의바름</option>
                    <option value="T3">T3 - 일반 (기본값)</option>
                    <option value="T4">T4 - 공격적</option>
                    <option value="T5">T5 - 최고속</option>
                  </select>
                  <span className={styles.fieldHint}>
                    높을수록 빠르지만 노이즈 증가. 스텔스 모드는 T2를
                    강제합니다.
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    전체 타임아웃 (초)
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nmapTimeout}
                    onChange={(e) =>
                      updateField(
                        'nmapTimeout',
                        parseInt(e.target.value) || 600,
                      )
                    }
                    min={60}
                  />
                  <span className={styles.fieldHint}>
                    스캔 최대 전체 실행 시간
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    호스트당 타임아웃 (초)
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nmapHostTimeout}
                    onChange={(e) =>
                      updateField(
                        'nmapHostTimeout',
                        parseInt(e.target.value) || 300,
                      )
                    }
                    min={30}
                  />
                  <span className={styles.fieldHint}>
                    다음 호스트로 넘어가기 전 대기 최대 시간
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>병렬 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.nmapParallelism ?? 2}
                    onChange={(e) =>
                      updateField(
                        'nmapParallelism',
                        parseInt(e.target.value) || 2,
                      )
                    }
                    min={1}
                    max={10}
                  />
                  <span className={styles.fieldHint}>동시에 스캔할 IP 수</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
