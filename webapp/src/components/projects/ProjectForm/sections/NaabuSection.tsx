'use client';

import { useState } from 'react';
import { ChevronDown, Play, Radio } from 'lucide-react';
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

interface NaabuSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function NaabuSection({ data, updateField, onRun }: NaabuSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Radio size={16} />
          Naabu Port Scanner
          <NodeInfoTooltip section="Naabu" />
          <WikiInfoButton target="Naabu" />
          <span className={styles.badgeActive}>활성</span>
          {data.naabuPassiveMode && (
            <span className={styles.badgePassive}>비활성</span>
          )}
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.naabuEnabled && (
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
              title="Naabu 포트 스캐너 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.naabuEnabled}
              onChange={(checked) => updateField('naabuEnabled', checked)}
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
            ProjectDiscovery의 Naabu를 사용한 빠른 포트 스캔. 발견된 호스트의
            열린 포트와 서비스를 확인하여 질의 링크된 엔드포인트에 대한 HTTP
            프로빙과 취약점 평가를 가능하게 합니다.
          </p>

          {data.naabuEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>상위 N개 포트</label>
                  <input
                    type="text"
                    className="textInput"
                    value={data.naabuTopPorts}
                    onChange={(e) =>
                      updateField('naabuTopPorts', e.target.value)
                    }
                    placeholder="1000"
                  />
                  <span className={styles.fieldHint}>
                    &ldquo;100&rdquo;, &ldquo;1000&rdquo; 또는 전체 65535 포트는
                    &ldquo;full&rdquo;
                  </span>
                  <TimeEstimate estimate="100: seconds | 1000: ~15 sec/host | full: minutes to hours" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>커스텀 포트</label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={data.naabuCustomPorts}
                      onChange={(e) =>
                        updateField('naabuCustomPorts', e.target.value)
                      }
                      placeholder="80,443,8080-8090"
                    />
                    <FileImportButton
                      fieldName="custom ports"
                      onImport={(values) =>
                        updateField('naabuCustomPorts', values.join(','))
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    설정 시 상위 N개 포트를 시정합니다. 범위 사용: 8080-8090
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 제한</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.naabuRateLimit}
                    onChange={(e) =>
                      updateField(
                        'naabuRateLimit',
                        parseInt(e.target.value) || 1000,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    패킷/초. 높을수록 빠르지만 속도 제한에 걸릴 수 있음
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>스레드</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.naabuThreads}
                    onChange={(e) =>
                      updateField(
                        'naabuThreads',
                        parseInt(e.target.value) || 25,
                      )
                    }
                    min={1}
                    max={100}
                  />
                  <span className={styles.fieldHint}>동시 스캔 스레드</span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (ms)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.naabuTimeout}
                    onChange={(e) =>
                      updateField(
                        'naabuTimeout',
                        parseInt(e.target.value) || 10000,
                      )
                    }
                    min={1000}
                  />
                  <span className={styles.fieldHint}>
                    포트 응답 대기 시간 (밀리초)
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>재시도</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.naabuRetries}
                    onChange={(e) =>
                      updateField('naabuRetries', parseInt(e.target.value) || 1)
                    }
                    min={0}
                    max={10}
                  />
                  <span className={styles.fieldHint}>
                    실패한 포트 프로브 재시도 횟수
                  </span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>스캔 유형</label>
                <select
                  className="select"
                  value={data.naabuScanType}
                  onChange={(e) => updateField('naabuScanType', e.target.value)}
                >
                  <option value="s">SYN 스캔 (s) - 빠름, root 필요</option>
                  <option value="c">Connect 스캔 (c) - root 불필요</option>
                </select>
                <span className={styles.fieldHint}>
                  SYN은 더 은밀하고 빠르지만 권한 상승이 필요합니다
                </span>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>옵션</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>CDN 제외</span>
                    <p className={styles.toggleDescription}>
                      CDN 호스트는 80/443만 스캔. 클라우드 호스팅 대상은
                      비활성화
                    </p>
                  </div>
                  <Toggle
                    checked={data.naabuExcludeCdn}
                    onChange={(checked) =>
                      updateField('naabuExcludeCdn', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>CDN 표시</span>
                    <p className={styles.toggleDescription}>
                      CDN 프로바이더 정보 (Cloudflare, Akamai 등)를 결과에 포함
                    </p>
                  </div>
                  <Toggle
                    checked={data.naabuDisplayCdn}
                    onChange={(checked) =>
                      updateField('naabuDisplayCdn', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>호스트 탐지 생략</span>
                    <p className={styles.toggleDescription}>
                      모든 호스트가 작동 중으로 가정. 웹 대상에 권장
                    </p>
                  </div>
                  <Toggle
                    checked={data.naabuSkipHostDiscovery}
                    onChange={(checked) =>
                      updateField('naabuSkipHostDiscovery', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>포트 검증</span>
                    <p className={styles.toggleDescription}>
                      포트가 실제로 열려 있는지 확인하는 추가 TCP 핸드셸이크
                    </p>
                    <TimeEstimate estimate="+10-20% scan time" />
                  </div>
                  <Toggle
                    checked={data.naabuVerifyPorts}
                    onChange={(checked) =>
                      updateField('naabuVerifyPorts', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>패시브 모드</span>
                    <p className={styles.toggleDescription}>
                      Shodan InternetDB에 직접 스캔 대신 쿼리. 더 은밀하지만
                      데이터가 오래된 수 있음
                    </p>
                    <TimeEstimate estimate="Passive (Shodan): near-instant | Active: minutes per host" />
                  </div>
                  <Toggle
                    checked={data.naabuPassiveMode}
                    onChange={(checked) =>
                      updateField('naabuPassiveMode', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Docker 이미지</label>
                <input
                  type="text"
                  className="textInput"
                  value={data.naabuDockerImage}
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
