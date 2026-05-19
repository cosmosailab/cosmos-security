'use client';

import { useState, type CSSProperties } from 'react';
import { ChevronDown, ShieldAlert, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { AiToggleLabel } from '../AiToggleLabel';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface TakeoverSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

// Inline code-snippet style — keeps monospace snippets smaller than surrounding text
const codeStyle: CSSProperties = {
  fontSize: '0.85em',
  padding: '1px 4px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderRadius: '3px',
};

const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low', 'info'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#e53e3e',
  high: '#dd6b20',
  medium: '#d69e2e',
  low: '#38a169',
  info: '#3182ce',
};

// Must match recon/helpers/takeover_helpers.py::BADDNS_MODULES.
// Upstream ships 11 modules; only 10 are CLI-addressable (MTA-STS fails the
// baddns 2.1.0 validate_modules regex). Excluded here deliberately.
const BADDNS_MODULE_OPTIONS = [
  'cname',
  'ns',
  'mx',
  'txt',
  'spf',
  'dmarc',
  'wildcard',
  'nsec',
  'references',
  'zonetransfer',
] as const;

const BADDNS_MODULE_DESCRIPTIONS: Record<string, string> = {
  cname: 'Dangling CNAME records + takeover potential',
  ns: 'Dangling NS records (expired nameservers, cloud DNS delegations)',
  mx: 'Dangling MX records + base-domain availability',
  txt: 'TXT record takeover opportunities',
  spf: 'SPF include/redirect chain to dangling domains',
  dmarc: 'Missing or misconfigured DMARC',
  wildcard: 'Wildcard DNS enabling broad takeovers',
  nsec: 'Subdomain enumeration via NSEC-walking (slow)',
  references: 'HTML links pointing to hijackable domains',
  zonetransfer: 'DNS zone-transfer attempts (AXFR, slow)',
};

export function TakeoverSection({
  data,
  updateField,
  onRun,
}: TakeoverSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSeverity = (severity: string) => {
    const current = data.takeoverSeverity ?? [];
    if (current.includes(severity)) {
      updateField(
        'takeoverSeverity',
        current.filter((s) => s !== severity),
      );
    } else {
      updateField('takeoverSeverity', [...current, severity]);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <ShieldAlert size={16} />
          서브도메인 탈취
          <NodeInfoTooltip section="SubdomainTakeover" />
          <WikiInfoButton target="SubdomainTakeover" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.subdomainTakeoverEnabled && (
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
              title="서브도메인 탈취 스캔 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.subdomainTakeoverEnabled}
              onChange={(checked) =>
                updateField('subdomainTakeoverEnabled', checked)
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
            계층적 서브도메인 탈취 탐지. <strong>Subjack</strong> (DNS 우선,
            고정밀)은 CNAME/NS/MX 레코드를 판별하여 후보를 검증하며,{' '}
            <strong>Nuclei 탈취 템플릿</strong>(
            <code style={codeStyle}>http/takeovers/</code> +{' '}
            <code style={codeStyle}>dns/</code>)은 샔 URL를 대상으로 HTTP 핵시량
            커버리지를 추가합니다. 탐지 결과는 도구 간 중복 제거 후 점수화되어{' '}
            <code style={codeStyle}>source=&quot;takeover_scan&quot;</code>으로{' '}
            <code style={codeStyle}>Vulnerability</code> 노드에 기록됩니다.
          </p>

          {data.subdomainTakeoverEnabled && (
            <>
              {/* Scanner toggles */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>스캐너</label>

                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>Subjack (DNS 우선)</div>
                    <div className={styles.toggleDescription}>
                      CNAME 체인을 풀고 서비스 핵시량을 확인합니다. Apache-2.0
                      Go 바이너리가 정찰 이미지에 포함되어 있습니다.
                    </div>
                  </div>
                  <Toggle
                    checked={data.subjackEnabled}
                    onChange={(checked) =>
                      updateField('subjackEnabled', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>Nuclei 탈취 템플릿</div>
                    <div className={styles.toggleDescription}>
                      httpx의 샔 URL를 대상으로{' '}
                      <code style={codeStyle}>-t http/takeovers/ -t dns/</code>
                      를 실행합니다. 기존 Nuclei Docker 이미지를 재사용합니다.
                    </div>
                  </div>
                  <Toggle
                    checked={data.nucleiTakeoversEnabled}
                    onChange={(checked) =>
                      updateField('nucleiTakeoversEnabled', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>BadDNS</div>
                    <div className={styles.toggleDescription}>
                      CNAME / NS / MX / TXT / SPF / DMARC / 와일드카드 / NSEC /
                      존 트랜스퍼 모듈에 걸친 심층 DNS 분석. 자체 격리된 Docker
                      이미지(
                      <code style={codeStyle}>redamon-baddns:latest</code>)에서
                      실행됩니다.{' '}
                      <code style={codeStyle}>
                        docker compose --profile tools build baddns-scanner
                      </code>
                      로 한 번 빌드하세요.
                    </div>
                  </div>
                  <Toggle
                    checked={data.baddnsEnabled}
                    onChange={(checked) =>
                      updateField('baddnsEnabled', checked)
                    }
                  />
                </div>

                <div
                  className={styles.toggleRow}
                  style={{ alignItems: 'center' }}
                >
                  <AiToggleLabel
                    label='Use AI to Disambiguate WAF "No-Host" Pages'
                    tooltip={
                      'Subjack/Nuclei body fingerprints collide with WAF block pages ' +
                      "for hostnames the WAF doesn't recognize. When on, each " +
                      'takeover candidate is probed; if no third-party vendor token ' +
                      '(Heroku-Request-Id, x-amz-bucket-region, etc.) is present, ' +
                      'the LLM classifies the body as real unclaimed page or WAF ' +
                      'block. AI-flagged collisions get a -40 score penalty and land ' +
                      'in manual_review instead of confirmed/likely. ' +
                      (!data.aiInPipeline
                        ? 'Enable "AI in Pipeline" in the Target tab to use this.'
                        : '')
                    }
                  />
                  <Toggle
                    checked={data.takeoverAiClassifier}
                    disabled={!data.aiInPipeline}
                    onChange={(checked) =>
                      updateField('takeoverAiClassifier', checked)
                    }
                  />
                </div>
              </div>

              {data.baddnsEnabled && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>BadDNS 모듈</label>
                  <div
                    style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
                  >
                    {BADDNS_MODULE_OPTIONS.map((mod) => {
                      const active = (data.baddnsModules ?? []).includes(mod);
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => {
                            const current = data.baddnsModules ?? [];
                            updateField(
                              'baddnsModules',
                              active
                                ? current.filter((m) => m !== mod)
                                : [...current, mod],
                            );
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
                            backgroundColor: active
                              ? 'rgba(99,102,241,0.15)'
                              : 'transparent',
                            color: active ? '#a5b4fc' : '#a0aec0',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                          title={BADDNS_MODULE_DESCRIPTIONS[mod]}
                        >
                          {mod}
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.fieldHint}>
                    모듈 목록이 <code style={codeStyle}>baddns -m</code>에
                    전달됩니다. 각 모듈에 마우스를 올리면 설명을 볼 수 있습니다.{' '}
                    <code style={codeStyle}>nsec</code>와{' '}
                    <code style={codeStyle}>zonetransfer</code>와 같은 무거운
                    모듈은 대형 타겟에서 느릴 수 있습니다.
                  </div>
                </div>
              )}

              {/* Subjack extras */}
              {data.subjackEnabled && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Subjack 확인</label>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleLabel}>
                        HTTPS 강제 (-ssl)
                      </div>
                      <div className={styles.toggleDescription}>
                        HTTPS로 타겟을 프로빙 -- 정확도 향상.
                      </div>
                    </div>
                    <Toggle
                      checked={data.subjackSsl}
                      onChange={(c) => updateField('subjackSsl', c)}
                    />
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleLabel}>
                        모든 URL 테스트 (-a)
                      </div>
                      <div className={styles.toggleDescription}>
                        CNAME이 명확하지 않은 서브도메인도 프로빙합니다.
                        느리지만 더 철저합니다.
                      </div>
                    </div>
                    <Toggle
                      checked={data.subjackAll}
                      onChange={(c) => updateField('subjackAll', c)}
                    />
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleLabel}>
                        NS 탈취 확인 (-ns)
                      </div>
                      <div className={styles.toggleDescription}>
                        만료된 네임서버 위임 및 다닝링 클라우드 DNS 지역 탐지.
                      </div>
                    </div>
                    <Toggle
                      checked={data.subjackCheckNs}
                      onChange={(c) => updateField('subjackCheckNs', c)}
                    />
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleLabel}>
                        A 레코드 오래된 항목 확인 (-ar)
                      </div>
                      <div className={styles.toggleDescription}>
                        죽은 클라우드 IP를 가리키는 A 레코드 표시 (IP 재사용
                        후보 -- 수동 확인 필요).
                      </div>
                    </div>
                    <Toggle
                      checked={data.subjackCheckAr}
                      onChange={(c) => updateField('subjackCheckAr', c)}
                    />
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <div className={styles.toggleLabel}>
                        SPF / MX 탈취 확인 (-mail)
                      </div>
                      <div className={styles.toggleDescription}>
                        죽은 인프라를 참조하는 SPF include와 MX 레코드 감사.
                      </div>
                    </div>
                    <Toggle
                      checked={data.subjackCheckMail}
                      onChange={(c) => updateField('subjackCheckMail', c)}
                    />
                  </div>
                </div>
              )}

              {/* Severity + scoring */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  심각도 필터 (Nuclei 탈취 템플릿)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SEVERITY_OPTIONS.map((sev) => {
                    const active = (data.takeoverSeverity ?? []).includes(sev);
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => toggleSeverity(sev)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: `1px solid ${active ? SEVERITY_COLORS[sev] : 'rgba(255,255,255,0.15)'}`,
                          backgroundColor: active
                            ? SEVERITY_COLORS[sev] + '33'
                            : 'transparent',
                          color: active ? SEVERITY_COLORS[sev] : '#a0aec0',
                          cursor: 'pointer',
                          fontSize: '12px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {sev}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Confidence threshold ({data.takeoverConfidenceThreshold ?? 60}
                  )
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={data.takeoverConfidenceThreshold ?? 60}
                  onChange={(e) =>
                    updateField(
                      'takeoverConfidenceThreshold',
                      parseInt(e.target.value, 10) || 60,
                    )
                  }
                  style={{ width: '100%' }}
                />
                <div className={styles.fieldHint}>
                  이 점수 이상은 <strong>확인됨</strong>. 10점 낙으면{' '}
                  <strong>가능성 높음</strong>. 그 이하는{' '}
                  <strong>수동 검토</strong> 대상이 됩니다.
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Nuclei 요청 제한 (req/s)
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.takeoverRateLimit ?? 50}
                    onChange={(e) =>
                      updateField(
                        'takeoverRateLimit',
                        parseInt(e.target.value, 10) || 50,
                      )
                    }
                    min={1}
                    max={500}
                  />
                  <span className={styles.fieldHint}>
                    Nuclei 탈취 패스의 상한. 실제 피크는 ~15% 초과 가능 (토큰
                    버킷).
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Subjack 스레드</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.subjackThreads ?? 10}
                    onChange={(e) =>
                      updateField(
                        'subjackThreads',
                        parseInt(e.target.value, 10) || 10,
                      )
                    }
                    min={1}
                    max={100}
                  />
                  <span className={styles.fieldHint}>
                    동시 DNS 프로빙 수. 높이는 것이 안전 -- 타겟 HTTP 부하 없음.
                  </span>
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>
                    수동 검토 항목 자동 게시
                  </div>
                  <div className={styles.toggleDescription}>
                    <code style={codeStyle}>manual_review</code> 항목을 메인
                    결과 테이블에 게시합니다 (기본:{' '}
                    <code style={codeStyle}>severity=&quot;info&quot;</code>로
                    별도 검토 큐에 보관).
                  </div>
                </div>
                <Toggle
                  checked={data.takeoverManualReviewAutoPublish}
                  onChange={(c) =>
                    updateField('takeoverManualReviewAutoPublish', c)
                  }
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
