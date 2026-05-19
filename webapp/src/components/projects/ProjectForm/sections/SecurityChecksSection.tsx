'use client';

import { useState } from 'react';
import { ChevronDown, Play, ShieldCheck } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { AiToggleLabel } from '../AiToggleLabel';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface SecurityChecksSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function SecurityChecksSection({
  data,
  updateField,
  onRun,
}: SecurityChecksSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <ShieldCheck size={16} />
          보안 점검
          <NodeInfoTooltip section="SecurityChecks" />
          <WikiInfoButton target="SecurityChecks" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.securityCheckEnabled && (
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
              title="보안 점검 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.securityCheckEnabled}
              onChange={(checked) =>
                updateField('securityCheckEnabled', checked)
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
            발견된 취약점에 커스텀 보안 검증을 실행합니다. 헤더 분석, SSL/TLS
            설정 검토, 자동화된 보안 평가를 통해 취약점을 검증 및
            컨텍스트화합니다.
          </p>

          {data.securityCheckEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.securityCheckTimeout}
                    onChange={(e) =>
                      updateField(
                        'securityCheckTimeout',
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={1}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 워커</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.securityCheckMaxWorkers}
                    onChange={(e) =>
                      updateField(
                        'securityCheckMaxWorkers',
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={1}
                    max={50}
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>직접 IP 접근</h3>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>직접 IP HTTP 확인</span>
                  <Toggle
                    checked={data.securityCheckDirectIpHttp}
                    onChange={(checked) =>
                      updateField('securityCheckDirectIpHttp', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>직접 IP HTTPS 확인</span>
                  <Toggle
                    checked={data.securityCheckDirectIpHttps}
                    onChange={(checked) =>
                      updateField('securityCheckDirectIpHttps', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>IP API 노옶 확인</span>
                  <Toggle
                    checked={data.securityCheckIpApiExposed}
                    onChange={(checked) =>
                      updateField('securityCheckIpApiExposed', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>WAF 우회 확인</span>
                  <Toggle
                    checked={data.securityCheckWafBypass}
                    onChange={(checked) =>
                      updateField('securityCheckWafBypass', checked)
                    }
                  />
                </div>
                <div
                  className={styles.toggleRow}
                  style={{ alignItems: 'center', gap: 'var(--space-4)' }}
                >
                  <AiToggleLabel
                    label="WAF 분류에 AI 사용"
                    tooltip={
                      '정적 WAF/CDN 헤더 토큰 검사를 보강합니다. ' +
                      '정적 목록이 미스할 경우(앱던 WAF는 헤더를 숨기거나 리브랜딩), ' +
                      '원본 맨모델이 헤더, 본문 지문, 쿠키, 지연 시간에서 WAF 존재를 ' +
                      '0-100으로 점수화합니다. ' +
                      'AI 탐지 우회는 detection_method=ai_classifier, waf_type, waf_confidence로 태그됩니다. ' +
                      (!data.aiInPipeline
                        ? '사용하려면 타겟 탭의 "AI 기능 활성화"를 켜세요.'
                        : '')
                    }
                  />
                  <Toggle
                    checked={data.wafAiClassifier}
                    disabled={!data.aiInPipeline}
                    onChange={(checked) =>
                      updateField('wafAiClassifier', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>TLS/SSL</h3>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>TLS 만료 임박 확인</span>
                  <Toggle
                    checked={data.securityCheckTlsExpiringSoon}
                    onChange={(checked) =>
                      updateField('securityCheckTlsExpiringSoon', checked)
                    }
                  />
                </div>
                {data.securityCheckTlsExpiringSoon && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>만료 경고 일수</label>
                    <input
                      type="number"
                      className="textInput"
                      value={data.securityCheckTlsExpiryDays}
                      onChange={(e) =>
                        updateField(
                          'securityCheckTlsExpiryDays',
                          parseInt(e.target.value) || 30,
                        )
                      }
                      min={1}
                      max={365}
                    />
                  </div>
                )}
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>보안 헤더</h3>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    Referrer-Policy 누락
                  </span>
                  <Toggle
                    checked={data.securityCheckMissingReferrerPolicy}
                    onChange={(checked) =>
                      updateField('securityCheckMissingReferrerPolicy', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    Permissions-Policy 누락
                  </span>
                  <Toggle
                    checked={data.securityCheckMissingPermissionsPolicy}
                    onChange={(checked) =>
                      updateField(
                        'securityCheckMissingPermissionsPolicy',
                        checked,
                      )
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>COOP 누락</span>
                  <Toggle
                    checked={data.securityCheckMissingCoop}
                    onChange={(checked) =>
                      updateField('securityCheckMissingCoop', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>CORP 누락</span>
                  <Toggle
                    checked={data.securityCheckMissingCorp}
                    onChange={(checked) =>
                      updateField('securityCheckMissingCorp', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>COEP 누락</span>
                  <Toggle
                    checked={data.securityCheckMissingCoep}
                    onChange={(checked) =>
                      updateField('securityCheckMissingCoep', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>Cache-Control 누락</span>
                  <Toggle
                    checked={data.securityCheckCacheControlMissing}
                    onChange={(checked) =>
                      updateField('securityCheckCacheControlMissing', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    CSP 안전하지 않은 인라인
                  </span>
                  <Toggle
                    checked={data.securityCheckCspUnsafeInline}
                    onChange={(checked) =>
                      updateField('securityCheckCspUnsafeInline', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>인증</h3>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>HTTPS 없이 로그인</span>
                  <Toggle
                    checked={data.securityCheckLoginNoHttps}
                    onChange={(checked) =>
                      updateField('securityCheckLoginNoHttps', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    세션 쿠키 Secure 없음
                  </span>
                  <Toggle
                    checked={data.securityCheckSessionNoSecure}
                    onChange={(checked) =>
                      updateField('securityCheckSessionNoSecure', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    세션 쿠키 HttpOnly 없음
                  </span>
                  <Toggle
                    checked={data.securityCheckSessionNoHttponly}
                    onChange={(checked) =>
                      updateField('securityCheckSessionNoHttponly', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    TLS 없이 Basic 인증
                  </span>
                  <Toggle
                    checked={data.securityCheckBasicAuthNoTls}
                    onChange={(checked) =>
                      updateField('securityCheckBasicAuthNoTls', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>DNS 보안</h3>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>SPF 레코드 누락</span>
                  <Toggle
                    checked={data.securityCheckSpfMissing}
                    onChange={(checked) =>
                      updateField('securityCheckSpfMissing', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>DMARC 레코드 누락</span>
                  <Toggle
                    checked={data.securityCheckDmarcMissing}
                    onChange={(checked) =>
                      updateField('securityCheckDmarcMissing', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>DNSSEC 누락</span>
                  <Toggle
                    checked={data.securityCheckDnssecMissing}
                    onChange={(checked) =>
                      updateField('securityCheckDnssecMissing', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    Zone Transfer 활성화
                  </span>
                  <Toggle
                    checked={data.securityCheckZoneTransfer}
                    onChange={(checked) =>
                      updateField('securityCheckZoneTransfer', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>노출된 서비스</h3>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>관리 포트 노출</span>
                  <Toggle
                    checked={data.securityCheckAdminPortExposed}
                    onChange={(checked) =>
                      updateField('securityCheckAdminPortExposed', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>데이터베이스 노출</span>
                  <Toggle
                    checked={data.securityCheckDatabaseExposed}
                    onChange={(checked) =>
                      updateField('securityCheckDatabaseExposed', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>Redis 인증 없음</span>
                  <Toggle
                    checked={data.securityCheckRedisNoAuth}
                    onChange={(checked) =>
                      updateField('securityCheckRedisNoAuth', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    Kubernetes API 노출
                  </span>
                  <Toggle
                    checked={data.securityCheckKubernetesApiExposed}
                    onChange={(checked) =>
                      updateField('securityCheckKubernetesApiExposed', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>SMTP 오픈 릴레이</span>
                  <Toggle
                    checked={data.securityCheckSmtpOpenRelay}
                    onChange={(checked) =>
                      updateField('securityCheckSmtpOpenRelay', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>애플리케이션</h3>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>
                    안전하지 않은 폼 액션
                  </span>
                  <Toggle
                    checked={data.securityCheckInsecureFormAction}
                    onChange={(checked) =>
                      updateField('securityCheckInsecureFormAction', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>속도 제한 없음</span>
                  <Toggle
                    checked={data.securityCheckNoRateLimiting}
                    onChange={(checked) =>
                      updateField('securityCheckNoRateLimiting', checked)
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
