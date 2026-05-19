'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ShieldCheck, Info, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import { useProject } from '@/providers/ProjectProvider';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface OsintEnrichmentSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
  onRunUncover?: () => void;
}

interface KeyStatus {
  censys: boolean;
  fofa: boolean;
  otx: boolean;
  netlas: boolean;
  virusTotal: boolean;
  zoomEye: boolean;
  criminalIp: boolean;
}

export function OsintEnrichmentSection({
  data,
  updateField,
  onRun,
  onRunUncover,
}: OsintEnrichmentSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { userId } = useProject();
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);

  const checkApiKeys = useCallback(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((settings) => {
        if (settings) {
          setKeyStatus({
            censys: !!(settings.censysApiToken && settings.censysOrgId),
            fofa: !!settings.fofaApiKey,
            otx: !!settings.otxApiKey,
            netlas: !!settings.netlasApiKey,
            virusTotal: !!settings.virusTotalApiKey,
            zoomEye: !!settings.zoomEyeApiKey,
            criminalIp: !!settings.criminalIpApiKey,
          });
        }
      })
      .catch(() =>
        setKeyStatus({
          censys: false,
          fofa: false,
          otx: false,
          netlas: false,
          virusTotal: false,
          zoomEye: false,
          criminalIp: false,
        }),
      );
  }, [userId]);

  useEffect(() => {
    checkApiKeys();
  }, [checkApiKeys]);

  const noKey = (tool: keyof KeyStatus) => !keyStatus || !keyStatus[tool];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <ShieldCheck size={16} />
          OSINT &amp; 위협 인텔리전스 강화
          <NodeInfoTooltip section="OsintEnrichment" />
          <WikiInfoButton target="OsintEnrichment" />
          <span className={styles.badgePassive}>비활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.osintEnrichmentEnabled && (
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
              title="OSINT 연구 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.osintEnrichmentEnabled}
              onChange={(checked) =>
                updateField('osintEnrichmentEnabled', checked)
              }
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
            외부 위협 인텔리전스 API를 사용한 패시브 OSINT 연구. 모든 도구는
            도메인 발견 후 병렬로 실행되며, 타겟에 트래픽을 보내지 않습니다. 각
            도구는 글로벌 설정에서 API 키를 설정해야 합니다. 프로젝트별로 각
            소스를 독립적으로 활성화/비활성화할 수 있습니다.
          </p>

          {data.osintEnrichmentEnabled && (
            <>
              {/* Censys */}
              <div className={styles.subSection}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>Censys</span>
                    <p className={styles.toggleDescription}>
                      발견된 IP의 서비스, 지역, ASN, OS 메타데이터를 위해 Censys
                      Search API v2를 조회합니다. API ID + Secret 필요.
                    </p>
                    {noKey('censys') && (
                      <div className={styles.shodanWarning}>
                        <Info size={13} />
                        Censys API 인증정보 없음 — 글로벌 설정에서 API Token &
                        Organization ID를 입력하세요.
                      </div>
                    )}
                  </div>
                  <Toggle
                    checked={data.censysEnabled}
                    onChange={(checked) =>
                      updateField('censysEnabled', checked)
                    }
                    disabled={noKey('censys')}
                  />
                </div>
                {data.censysEnabled && !noKey('censys') && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>워커</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.censysWorkers ?? 5}
                        onChange={(e) =>
                          updateField(
                            'censysWorkers',
                            parseInt(e.target.value) || 5,
                          )
                        }
                        min={1}
                        max={20}
                      />
                      <span className={styles.fieldHint}>
                        Censys IP 연구 동시 작업 수 (1-20)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* FOFA */}
              <div className={styles.subSection}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>FOFA</span>
                    <p className={styles.toggleDescription}>
                      타겟 도메인 또는 발견된 IP에 매칭되는 호스트에 대해 FOFA
                      (중국 인터넷 인텔리전스)를 조회합니다. 배너, 포트, 기술
                      스택, TLS 인증서를 반환합니다.
                    </p>
                    {noKey('fofa') && (
                      <div className={styles.shodanWarning}>
                        <Info size={13} />
                        FOFA API 키 없음 — 글로벌 설정에서 입력하세요.
                      </div>
                    )}
                  </div>
                  <Toggle
                    checked={data.fofaEnabled}
                    onChange={(checked) => updateField('fofaEnabled', checked)}
                    disabled={noKey('fofa')}
                  />
                </div>
                {data.fofaEnabled && !noKey('fofa') && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>최대 결과</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.fofaMaxResults}
                        onChange={(e) =>
                          updateField(
                            'fofaMaxResults',
                            parseInt(e.target.value) || 1000,
                          )
                        }
                        min={1}
                        max={10000}
                      />
                      <span className={styles.fieldHint}>
                        FOFA API 최대 가져올 결과 수 (1-10,000)
                      </span>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>워커</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.fofaWorkers ?? 5}
                        onChange={(e) =>
                          updateField(
                            'fofaWorkers',
                            parseInt(e.target.value) || 5,
                          )
                        }
                        min={1}
                        max={20}
                      />
                      <span className={styles.fieldHint}>
                        FOFA IP 연구 동시 작업 수 (1-20)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* AlienVault OTX */}
              <div className={styles.subSection}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>AlienVault OTX</span>
                    <p className={styles.toggleDescription}>
                      AlienVault OTX로부터 발견된 IP와 타겟 도메인에 대한 위협
                      인텔리전스 폄스, 패시브 DNS 레코드, 폄평 데이터를
                      조회합니다.
                      {noKey('otx') && (
                        <em>
                          {' '}
                          키 없이 제한된 공개 데이터로 작동하며, 전체 폄스
                          데이터를 위해 글로벌 설정에서 API 키를 입력하세요.
                        </em>
                      )}
                    </p>
                  </div>
                  <Toggle
                    checked={data.otxEnabled}
                    onChange={(checked) => updateField('otxEnabled', checked)}
                  />
                </div>
                {data.otxEnabled && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>워커</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.otxWorkers ?? 5}
                        onChange={(e) =>
                          updateField(
                            'otxWorkers',
                            parseInt(e.target.value) || 5,
                          )
                        }
                        min={1}
                        max={20}
                      />
                      <span className={styles.fieldHint}>
                        OTX IP 연구 동시 작업 수 (1-20)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Netlas */}
              <div className={styles.subSection}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>Netlas</span>
                    <p className={styles.toggleDescription}>
                      발견된 IP와 타겟 도메인의 호스트 데이터, 열린 포트, 서비스
                      배너를 Netlas 인터넷 인텔리전스 플랫폼에서 조회합니다.
                    </p>
                    {noKey('netlas') && (
                      <div className={styles.shodanWarning}>
                        <Info size={13} />
                        Netlas API 키 없음 — 글로벌 설정에서 입력하세요.
                      </div>
                    )}
                  </div>
                  <Toggle
                    checked={data.netlasEnabled}
                    onChange={(checked) =>
                      updateField('netlasEnabled', checked)
                    }
                    disabled={noKey('netlas')}
                  />
                </div>
                {data.netlasEnabled && !noKey('netlas') && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>워커</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.netlasWorkers ?? 5}
                        onChange={(e) =>
                          updateField(
                            'netlasWorkers',
                            parseInt(e.target.value) || 5,
                          )
                        }
                        min={1}
                        max={20}
                      />
                      <span className={styles.fieldHint}>
                        Netlas IP 연구 동시 작업 수 (1-20)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* VirusTotal */}
              <div className={styles.subSection}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>VirusTotal</span>
                    <p className={styles.toggleDescription}>
                      타겟 도메인과 발견된 IP에 대한 멀티 엔진 폄평 점수, 악성
                      탐지 수, 카테고리 레이블을 가져옵니다. 무료 등급: 4
                      req/min. 글로벌 설정에서 API 키를 입력하세요.
                    </p>
                    {noKey('virusTotal') && (
                      <div className={styles.shodanWarning}>
                        <Info size={13} />
                        VirusTotal API 키 없음 — 글로벌 설정에서 입력하세요.
                      </div>
                    )}
                  </div>
                  <Toggle
                    checked={data.virusTotalEnabled}
                    onChange={(checked) =>
                      updateField('virusTotalEnabled', checked)
                    }
                    disabled={noKey('virusTotal')}
                  />
                </div>
                {data.virusTotalEnabled && !noKey('virusTotal') && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>워커</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.virusTotalWorkers ?? 3}
                        onChange={(e) =>
                          updateField(
                            'virusTotalWorkers',
                            parseInt(e.target.value) || 3,
                          )
                        }
                        min={1}
                        max={10}
                      />
                      <span className={styles.fieldHint}>
                        VirusTotal IP 연구 동시 작업 수 (1-10)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ZoomEye */}
              <div className={styles.subSection}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>ZoomEye</span>
                    <p className={styles.toggleDescription}>
                      발견된 IP와 타겟 도메인과 연관된 열린 포트, 서비스 배너,
                      기술을 ZoomEye 사이버스페이스 검색 엔진에서 조회합니다.
                    </p>
                    {noKey('zoomEye') && (
                      <div className={styles.shodanWarning}>
                        <Info size={13} />
                        ZoomEye API 키 없음 — 글로벌 설정에서 입력하세요.
                      </div>
                    )}
                  </div>
                  <Toggle
                    checked={data.zoomEyeEnabled}
                    onChange={(checked) =>
                      updateField('zoomEyeEnabled', checked)
                    }
                    disabled={noKey('zoomEye')}
                  />
                </div>
                {data.zoomEyeEnabled && !noKey('zoomEye') && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>최대 결과</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.zoomEyeMaxResults}
                        onChange={(e) =>
                          updateField(
                            'zoomEyeMaxResults',
                            parseInt(e.target.value) || 1000,
                          )
                        }
                        min={1}
                        max={10000}
                      />
                      <span className={styles.fieldHint}>
                        ZoomEye API 최대 가져올 결과 수 (1-10,000)
                      </span>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>워커</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.zoomEyeWorkers ?? 5}
                        onChange={(e) =>
                          updateField(
                            'zoomEyeWorkers',
                            parseInt(e.target.value) || 5,
                          )
                        }
                        min={1}
                        max={20}
                      />
                      <span className={styles.fieldHint}>
                        ZoomEye IP 연구 동시 작업 수 (1-20)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Criminal IP */}
              <div className={styles.subSection}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>Criminal IP</span>
                    <p className={styles.toggleDescription}>
                      Criminal IP 위협 인텔리전스 플랫폼에서 발견된 IP에 대한
                      인바운드/아우트바운드 위험 점수와 VPN/프록시/Tor 플래그를
                      가져옵니다.
                    </p>
                    {noKey('criminalIp') && (
                      <div className={styles.shodanWarning}>
                        <Info size={13} />
                        Criminal IP API 키 없음 — 글로벌 설정에서 입력하세요.
                      </div>
                    )}
                  </div>
                  <Toggle
                    checked={data.criminalIpEnabled}
                    onChange={(checked) =>
                      updateField('criminalIpEnabled', checked)
                    }
                    disabled={noKey('criminalIp')}
                  />
                </div>
                {data.criminalIpEnabled && !noKey('criminalIp') && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Workers</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.criminalIpWorkers ?? 5}
                        onChange={(e) =>
                          updateField(
                            'criminalIpWorkers',
                            parseInt(e.target.value) || 5,
                          )
                        }
                        min={1}
                        max={20}
                      />
                      <span className={styles.fieldHint}>
                        CriminalIP IP 연구 동시 작업 수 (1-20)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Uncover */}
              <div className={styles.subSection}>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      Uncover (멀티 엔진 검색)
                    </span>
                    <p className={styles.toggleDescription}>
                      ProjectDiscovery Uncover — Shodan, Censys, FOFA, ZoomEye,
                      Netlas, CriminalIP, Quake, Hunter 등을 동시에 검색하여
                      타겟을 확장합니다. 포트 스캔 전에 추가 IP, 서브도메인,
                      열린 포트를 발견합니다. 글로벌 설정에서 각 엔진의 API 키를
                      설정하세요.
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {onRunUncover && data.uncoverEnabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRunUncover();
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
                        title="Uncover 실행"
                      >
                        <Play size={10} /> 부분 정찰 실행
                      </button>
                    )}
                    <Toggle
                      checked={data.uncoverEnabled}
                      onChange={(checked) =>
                        updateField('uncoverEnabled', checked)
                      }
                    />
                  </div>
                </div>
                {data.uncoverEnabled && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>최대 결과</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.uncoverMaxResults}
                        onChange={(e) =>
                          updateField(
                            'uncoverMaxResults',
                            parseInt(e.target.value) || 50000,
                          )
                        }
                        min={1}
                        max={50000}
                      />
                      <span className={styles.fieldHint}>
                        모든 엔진의 최대 전체 결과 수 (1-10,000)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
