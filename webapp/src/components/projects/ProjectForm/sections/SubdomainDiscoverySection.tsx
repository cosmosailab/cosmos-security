'use client';

import { useState } from 'react';
import { ChevronDown, Play, Search } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { TimeEstimate } from '../TimeEstimate';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface SubdomainDiscoverySectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function SubdomainDiscoverySection({
  data,
  updateField,
  onRun,
}: SubdomainDiscoverySectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Search size={16} />
          Subdomain Discovery
          <NodeInfoTooltip section="SubdomainDiscovery" />
          <WikiInfoButton target="SubdomainDiscovery" />
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.subdomainDiscoveryEnabled && (
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
              title="서브도메인 탐지 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.subdomainDiscoveryEnabled}
              onChange={(checked) =>
                updateField('subdomainDiscoveryEnabled', checked)
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
            사용할 서브도메인 탐지 소스를 설정합니다. 패시브 소스는 대상에 직접
            접근하지 않고 외부 DB를 쿼리합니다. 능동 탐지는 DNS 쿼리를 직접
            발송합니다.
          </p>

          {data.subdomainDiscoveryEnabled && (
            <>
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>
                  Sources <span className={styles.badgePassive}>비활성</span>
                </h3>

                <div className={styles.toggleRowCompact}>
                  <div className={styles.toggleRowCompactInfo}>
                    <span className={styles.toggleLabelLg}>crt.sh</span>
                    <p className={styles.toggleDescription}>
                      인증서 툯명성 로그 — SSL/TLS 인증서에서 서브도메인 탐지
                    </p>
                  </div>
                  {data.crtshEnabled && (
                    <>
                      <span className={styles.toggleRowCompactLabel}>Max</span>
                      <input
                        type="number"
                        className={`textInput ${styles.toggleRowCompactInput}`}
                        value={data.crtshMaxResults}
                        onChange={(e) =>
                          updateField(
                            'crtshMaxResults',
                            parseInt(e.target.value) || 5000,
                          )
                        }
                        min={1}
                        max={50000}
                      />
                    </>
                  )}
                  <Toggle
                    checked={data.crtshEnabled}
                    onChange={(checked) => updateField('crtshEnabled', checked)}
                  />
                </div>

                <div className={styles.toggleRowCompact}>
                  <div className={styles.toggleRowCompactInfo}>
                    <span className={styles.toggleLabelLg}>HackerTarget</span>
                    <p className={styles.toggleDescription}>
                      DNS 조회 DB — HackerTarget 호스트 검색 API에서 서브도메인
                      탐지
                    </p>
                  </div>
                  {data.hackerTargetEnabled && (
                    <>
                      <span className={styles.toggleRowCompactLabel}>Max</span>
                      <input
                        type="number"
                        className={`textInput ${styles.toggleRowCompactInput}`}
                        value={data.hackerTargetMaxResults}
                        onChange={(e) =>
                          updateField(
                            'hackerTargetMaxResults',
                            parseInt(e.target.value) || 5000,
                          )
                        }
                        min={1}
                        max={50000}
                      />
                    </>
                  )}
                  <Toggle
                    checked={data.hackerTargetEnabled}
                    onChange={(checked) =>
                      updateField('hackerTargetEnabled', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRowCompact}>
                  <div className={styles.toggleRowCompactInfo}>
                    <span className={styles.toggleLabelLg}>Subfinder</span>
                    <p className={styles.toggleDescription}>
                      50개가 넘는 온라인 소스를 사용한 패시브 서브도메인 열거
                      (인증서 로그, DNS DB, 웹 아카이브)
                    </p>
                  </div>
                  {data.subfinderEnabled && (
                    <>
                      <span className={styles.toggleRowCompactLabel}>Max</span>
                      <input
                        type="number"
                        className={`textInput ${styles.toggleRowCompactInput}`}
                        value={data.subfinderMaxResults}
                        onChange={(e) =>
                          updateField(
                            'subfinderMaxResults',
                            parseInt(e.target.value) || 5000,
                          )
                        }
                        min={1}
                        max={50000}
                      />
                    </>
                  )}
                  <Toggle
                    checked={data.subfinderEnabled}
                    onChange={(checked) =>
                      updateField('subfinderEnabled', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRowCompact}>
                  <div className={styles.toggleRowCompactInfo}>
                    <span className={styles.toggleLabelLg}>Knockpy Recon</span>
                    <p className={styles.toggleDescription}>
                      Knockpy의 recon 모드를 사용한 패시브 워드리스트 기반
                      서브도메인 열거
                    </p>
                  </div>
                  {data.knockpyReconEnabled && (
                    <>
                      <span className={styles.toggleRowCompactLabel}>Max</span>
                      <input
                        type="number"
                        className={`textInput ${styles.toggleRowCompactInput}`}
                        value={data.knockpyReconMaxResults}
                        onChange={(e) =>
                          updateField(
                            'knockpyReconMaxResults',
                            parseInt(e.target.value) || 5000,
                          )
                        }
                        min={1}
                        max={50000}
                      />
                    </>
                  )}
                  <Toggle
                    checked={data.knockpyReconEnabled}
                    onChange={(checked) =>
                      updateField('knockpyReconEnabled', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRowCompact}>
                  <div className={styles.toggleRowCompactInfo}>
                    <span className={styles.toggleLabelLg}>Amass</span>
                    <p className={styles.toggleDescription}>
                      OWASP Amass — 50개가 넘는 데이터 소스를 사용한 서브도메인
                      열거 (인증서 로그, DNS DB, 웹 아카이브, WHOIS)
                    </p>
                  </div>
                  {data.amassEnabled && (
                    <>
                      <span className={styles.toggleRowCompactLabel}>Max</span>
                      <input
                        type="number"
                        className={`textInput ${styles.toggleRowCompactInput}`}
                        value={data.amassMaxResults}
                        onChange={(e) =>
                          updateField(
                            'amassMaxResults',
                            parseInt(e.target.value) || 50000,
                          )
                        }
                        min={1}
                        max={50000}
                      />
                    </>
                  )}
                  <Toggle
                    checked={data.amassEnabled}
                    onChange={(checked) => updateField('amassEnabled', checked)}
                  />
                </div>
              </div>

              {data.amassEnabled && (
                <div className={styles.subSection}>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Amass 타임아웃 (분)
                      </label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.amassTimeout}
                        onChange={(e) =>
                          updateField(
                            'amassTimeout',
                            parseInt(e.target.value) || 10,
                          )
                        }
                        min={1}
                        max={120}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>
                  Discovery <span className={styles.badgeActive}>활성</span>
                </h3>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      Knockpy 브루트포스 모드
                    </span>
                    <p className={styles.toggleDescription}>
                      워드리스트 기반 서브도메인 브루트포스 — 수체로의 DNS 쿼리
                      발송
                    </p>
                    <TimeEstimate estimate="+5-30 min depending on wordlist size" />
                  </div>
                  <Toggle
                    checked={data.useBruteforceForSubdomains}
                    onChange={(checked) =>
                      updateField('useBruteforceForSubdomains', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>Amass 능동 모드</span>
                    <p className={styles.toggleDescription}>
                      존 전송 및 인증서 이름 가져오기 활성화 — 대상에 DNS 쿼리
                      직접 발송
                    </p>
                  </div>
                  <Toggle
                    checked={data.amassActive}
                    onChange={(checked) => updateField('amassActive', checked)}
                    disabled={!data.amassEnabled}
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>Amass 브루트포스</span>
                    <p className={styles.toggleDescription}>
                      패시브 열거 후 DNS 브루트포스 — 스캔 시간이 크게
                      증가합니다
                    </p>
                    <TimeEstimate estimate="+10-60 min depending on target size" />
                  </div>
                  <Toggle
                    checked={data.amassBrute}
                    onChange={(checked) => updateField('amassBrute', checked)}
                    disabled={!data.amassEnabled}
                  />
                </div>

                {data.amassBrute && data.amassEnabled && (
                  <div
                    style={{
                      marginLeft: 'var(--space-6)',
                      marginTop: 'var(--space-2)',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    <span className={styles.toggleLabel}>
                      브루트포스 워드리스트
                    </span>
                    <p className={styles.toggleDescription}>
                      사용할 워드리스트를 선택하세요. Amass 기본은 항상
                      활성화됩니다.
                    </p>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginTop: 'var(--space-2)',
                        opacity: 0.6,
                      }}
                    >
                      <input type="checkbox" checked disabled />
                      <span>Amass 기본 (~8K 항목)</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-tertiary)',
                        }}
                      >
                        항상 활성화
                      </span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginTop: 'var(--space-2)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(Array.isArray(data.amassBruteWordlists)
                          ? (data.amassBruteWordlists as string[])
                          : ['default']
                        ).includes('jhaddix-all')}
                        onChange={(e) => {
                          const current = (
                            Array.isArray(data.amassBruteWordlists)
                              ? (data.amassBruteWordlists as string[])
                              : ['default']
                          ).filter((w: string) => w !== 'jhaddix-all');
                          if (e.target.checked) current.push('jhaddix-all');
                          if (!current.includes('default'))
                            current.unshift('default');
                          updateField('amassBruteWordlists', current as any);
                        }}
                      />
                      <span>jhaddix all.txt (~2.18M entries)</span>
                    </label>
                    <TimeEstimate estimate="+30-60 min extra scan time" />
                  </div>
                )}
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>
                  Wildcard Filtering{' '}
                  <span className={styles.badgeActive}>활성</span>
                </h3>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      Puredns 와일드카드 필터링
                    </span>
                    <p className={styles.toggleDescription}>
                      발견된 서브도메인을 퍼블릭 DNS 리솔버로 검증하고
                      와일드카드 항목과 DNS 포이쉜된 결과를 제거합니다 — 모든
                      탐지 도구 완료 후 실행
                    </p>
                  </div>
                  <Toggle
                    checked={data.purednsEnabled}
                    onChange={(checked) =>
                      updateField('purednsEnabled', checked)
                    }
                  />
                </div>

                {data.purednsEnabled && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        스레드 (0 = 자동)
                      </label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.purednsThreads}
                        onChange={(e) =>
                          updateField(
                            'purednsThreads',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        min={0}
                        max={1000}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        요청 제한 (0 = 무제한)
                      </label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.purednsRateLimit}
                        onChange={(e) =>
                          updateField(
                            'purednsRateLimit',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        min={0}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>DNS 성능</h3>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>DNS 워커 수</label>
                    <input
                      type="number"
                      className="textInput"
                      value={data.dnsMaxWorkers ?? 50}
                      onChange={(e) =>
                        updateField(
                          'dnsMaxWorkers',
                          parseInt(e.target.value) || 50,
                        )
                      }
                      min={1}
                      max={200}
                    />
                    <span className={styles.fieldHint}>병렬 DNS 풀리 워커</span>
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      DNS 레코드 병렬 처리
                    </span>
                    <p className={styles.toggleDescription}>
                      호스트당 모든 DNS 레코드 타입을 병렬로 쿼리
                    </p>
                  </div>
                  <Toggle
                    checked={data.dnsRecordParallelism ?? true}
                    onChange={(checked) =>
                      updateField('dnsRecordParallelism', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>
                  DNS &amp; WHOIS{' '}
                  <span className={styles.badgePassive}>비활성</span>
                </h3>

                <div className={styles.toggleRowCompact}>
                  <div className={styles.toggleRowCompactInfo}>
                    <span className={styles.toggleLabelLg}>WHOIS Lookup</span>
                    <p className={styles.toggleDescription}>
                      도메인 등록 정보 조회 위해 퍼블릭 WHOIS 데이터베이스 쿼리
                      (등록자, 날짜, 연락처)
                    </p>
                  </div>
                  {data.whoisEnabled && (
                    <>
                      <span className={styles.toggleRowCompactLabel}>
                        재시도
                      </span>
                      <input
                        type="number"
                        className={`textInput ${styles.toggleRowCompactInput}`}
                        value={data.whoisMaxRetries}
                        onChange={(e) =>
                          updateField(
                            'whoisMaxRetries',
                            parseInt(e.target.value) || 6,
                          )
                        }
                        min={1}
                        max={20}
                      />
                    </>
                  )}
                  <Toggle
                    checked={data.whoisEnabled}
                    onChange={(checked) => updateField('whoisEnabled', checked)}
                  />
                </div>

                <div className={styles.toggleRowCompact}>
                  <div className={styles.toggleRowCompactInfo}>
                    <span className={styles.toggleLabelLg}>DNS Resolution</span>
                    <p className={styles.toggleDescription}>
                      DNS 레코드 (A, AAAA, MX, NS, TXT) 풀리 및 발견된 호스트에
                      대한 역방향 DNS
                    </p>
                  </div>
                  {data.dnsEnabled && (
                    <>
                      <span className={styles.toggleRowCompactLabel}>
                        재시도
                      </span>
                      <input
                        type="number"
                        className={`textInput ${styles.toggleRowCompactInput}`}
                        value={data.dnsMaxRetries}
                        onChange={(e) =>
                          updateField(
                            'dnsMaxRetries',
                            parseInt(e.target.value) || 3,
                          )
                        }
                        min={1}
                        max={10}
                      />
                    </>
                  )}
                  <Toggle
                    checked={data.dnsEnabled}
                    onChange={(checked) => updateField('dnsEnabled', checked)}
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
