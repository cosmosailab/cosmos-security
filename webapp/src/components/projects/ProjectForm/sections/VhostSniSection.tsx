'use client';

import { useState, type CSSProperties } from 'react';
import { ChevronDown, Network, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface VhostSniSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

const codeStyle: CSSProperties = {
  fontSize: '0.85em',
  padding: '1px 4px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderRadius: '3px',
};

export function VhostSniSection({
  data,
  updateField,
  onRun,
}: VhostSniSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const customWordlistLines = (data.vhostSniCustomWordlist || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#')).length;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Network size={16} />
          VHost & SNI Enumeration
          <NodeInfoTooltip section="VhostSni" />
          <WikiInfoButton target="VhostSni" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.vhostSniEnabled && (
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
              title="VHost & SNI 열거 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.vhostSniEnabled}
              onChange={(checked) => updateField('vhostSniEnabled', checked)}
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
            모든 대상 IP에서 <strong>숨겨진 가상 호스트</strong>를 탐지합니다.
            두 가지 curl 요청으로 각 후보 호스트명을 프로빙합니다:{' '}
            <strong>L7 테스트</strong> (HTTP{' '}
            <code style={codeStyle}>Host:</code> 헤더 오버라이드)와{' '}
            <strong>L4 테스트</strong> (<code style={codeStyle}>--resolve</code>
            로 TLS SNI 강제). 미관측 IP 기준에서 비정상적인 응답은{' '}
            <code style={codeStyle}>source=&quot;vhost_sni_enum&quot;</code>의{' '}
            <code style={codeStyle}>Vulnerability</code> 노드로 출력됩니다. L7은
            전통적인 Apache/Nginx vhost를, L4는 TLS 레이어에서 라우팅하는 모던
            리버스 프록시 (k8s ingress, Traefik, Cloudflare)를 감지합니다.
          </p>

          {data.vhostSniEnabled && (
            <>
              {/* Layer toggles */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>테스트 레이어</label>

                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>
                      L7 테스트 (HTTP Host 헤더)
                    </div>
                    <div className={styles.toggleDescription}>
                      Sends{' '}
                      <code style={codeStyle}>
                        curl -H &quot;Host: candidate&quot; https://IP
                      </code>
                      . Catches classic vhost routing.
                    </div>
                  </div>
                  <Toggle
                    checked={data.vhostSniTestL7}
                    onChange={(checked) =>
                      updateField('vhostSniTestL7', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>
                      L4 테스트 (TLS SNI)
                    </div>
                    <div className={styles.toggleDescription}>
                      Sends{' '}
                      <code style={codeStyle}>
                        curl --resolve candidate:port:IP https://candidate
                      </code>
                      . Catches ingress/CDN routing.
                    </div>
                  </div>
                  <Toggle
                    checked={data.vhostSniTestL4}
                    onChange={(checked) =>
                      updateField('vhostSniTestL4', checked)
                    }
                  />
                </div>
              </div>

              {/* Candidate sources */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>후보 소스</label>

                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>
                      그래프 후보 사용 (권장)
                    </div>
                    <div className={styles.toggleDescription}>
                      Pulls hostnames from existing Subdomain, ExternalDomain,
                      TLS SAN list, CNAME targets and reverse-DNS PTR records
                      resolving to each target IP. Highest signal source.
                    </div>
                  </div>
                  <Toggle
                    checked={data.vhostSniUseGraphCandidates}
                    onChange={(checked) =>
                      updateField('vhostSniUseGraphCandidates', checked)
                    }
                  />
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>
                      기본 워드리스트 사용
                    </div>
                    <div className={styles.toggleDescription}>
                      ~2,300 curated admin / dev / staging / internal /
                      modern-stack prefixes from{' '}
                      <code style={codeStyle}>
                        recon/wordlists/vhost-common.txt
                      </code>
                      . Each prefix expands as{' '}
                      <code style={codeStyle}>{`{prefix}.{target_apex}`}</code>.
                    </div>
                  </div>
                  <Toggle
                    checked={data.vhostSniUseDefaultWordlist}
                    onChange={(checked) =>
                      updateField('vhostSniUseDefaultWordlist', checked)
                    }
                  />
                </div>
              </div>

              {/* Custom wordlist upload */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  커스텀 워드리스트 (줄당 하나, 현재 {customWordlistLines}개)
                </label>
                <textarea
                  className="textInput"
                  rows={8}
                  placeholder={
                    '# One prefix or full hostname per line.\n# Lines starting with # are ignored.\nadmin\nstaging\nhidden.acme.com'
                  }
                  value={data.vhostSniCustomWordlist || ''}
                  onChange={(e) =>
                    updateField('vhostSniCustomWordlist', e.target.value)
                  }
                  style={{
                    width: '100%',
                    minHeight: '160px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                <div className={styles.fieldHint}>
                  Bare prefixes (<code style={codeStyle}>admin</code>) are
                  expanded as{' '}
                  <code style={codeStyle}>{`admin.{target_apex}`}</code>. Full
                  hostnames (containing a dot) are used as-is. Combined with
                  graph candidates and the default wordlist, then deduped.
                </div>
              </div>

              {/* Performance / behavior */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    요청당 타임아웃 (s)
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.vhostSniTimeout ?? 3}
                    onChange={(e) =>
                      updateField(
                        'vhostSniTimeout',
                        parseInt(e.target.value, 10) || 3,
                      )
                    }
                    min={1}
                    max={30}
                  />
                  <span className={styles.fieldHint}>
                    curl <code style={codeStyle}>--connect-timeout</code>.
                    요청당 전체 예산은 이 값의 3배입니다.
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>동시 실행 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.vhostSniConcurrency ?? 20}
                    onChange={(e) =>
                      updateField(
                        'vhostSniConcurrency',
                        parseInt(e.target.value, 10) || 20,
                      )
                    }
                    min={1}
                    max={100}
                  />
                  <span className={styles.fieldHint}>
                    IP/포트당 병렬 curl 프로브 수. 높을수록 빠르지만 대상에 더
                    노이즈합니다.
                  </span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    기준 크기 허용 오차 (bytes)
                  </label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.vhostSniBaselineSizeTolerance ?? 50}
                    onChange={(e) =>
                      updateField(
                        'vhostSniBaselineSizeTolerance',
                        parseInt(e.target.value, 10) || 50,
                      )
                    }
                    min={0}
                    max={10000}
                  />
                  <span className={styles.fieldHint}>
                    이 바이트 이내의 본문 크기 차이는 플래그하지 않습니다
                    (Set-Cookie / 타임스탬 지터 억제).
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>IP당 최대 후보 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.vhostSniMaxCandidatesPerIp ?? 2000}
                    onChange={(e) =>
                      updateField(
                        'vhostSniMaxCandidatesPerIp',
                        parseInt(e.target.value, 10) || 2000,
                      )
                    }
                    min={10}
                    max={50000}
                  />
                  <span className={styles.fieldHint}>
                    실행 시간 제한을 위한 하드 상한. 기본 워드리스트 + 그래프
                    후보는 IP당 통상 2,500개를 넘지 않습니다.
                  </span>
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>
                    탐지된 숨겨진 vhost를 BaseURL로 주입
                  </div>
                  <div className={styles.toggleDescription}>
                    숨겨진 vhost가 확인되면{' '}
                    <code style={codeStyle}>BaseURL</code> 노드를 생성하여 후속
                    부분 정찰 (Katana, Nuclei)이 스캔할 수 있게 합니다. 권장.
                  </div>
                </div>
                <Toggle
                  checked={data.vhostSniInjectDiscovered}
                  onChange={(c) => updateField('vhostSniInjectDiscovered', c)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
