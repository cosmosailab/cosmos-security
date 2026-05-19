'use client';

import {
  Download,
  Shield,
  Clock,
  Ban,
  FileText,
  Users,
  AlertTriangle,
  Lock,
  Globe,
} from 'lucide-react';
import styles from './RoeViewer.module.css';

interface RoeViewerProps {
  projectId: string;
  project: {
    roeEnabled?: boolean;
    roeClientName?: string;
    roeClientContactName?: string;
    roeClientContactEmail?: string;
    roeClientContactPhone?: string;
    roeEmergencyContact?: string;
    roeEngagementStartDate?: string;
    roeEngagementEndDate?: string;
    roeEngagementType?: string;
    roeExcludedHosts?: string[];
    roeExcludedHostReasons?: string[];
    roeTimeWindowEnabled?: boolean;
    roeTimeWindowTimezone?: string;
    roeTimeWindowDays?: string[];
    roeTimeWindowStartTime?: string;
    roeTimeWindowEndTime?: string;
    roeForbiddenCategories?: string[];
    roeMaxSeverityPhase?: string;
    roeAllowDos?: boolean;
    roeAllowSocialEngineering?: boolean;
    roeAllowPhysicalAccess?: boolean;
    roeAllowDataExfiltration?: boolean;
    roeAllowAccountLockout?: boolean;
    roeAllowProductionTesting?: boolean;
    roeGlobalMaxRps?: number;
    roeSensitiveDataHandling?: string;
    roeDataRetentionDays?: number;
    roeRequireDataEncryption?: boolean;
    roeStatusUpdateFrequency?: string;
    roeCriticalFindingNotify?: boolean;
    roeIncidentProcedure?: string;
    roeThirdPartyProviders?: string[];
    roeComplianceFrameworks?: string[];
    roeNotes?: string;
    roeDocumentName?: string;
    targetDomain?: string;
    targetIps?: string[];
    [key: string]: unknown;
  };
}

function PermBadge({ allowed, label }: { allowed: boolean; label: string }) {
  return (
    <span
      className={`${styles.permBadge} ${allowed ? styles.permAllowed : styles.permDenied}`}
    >
      {allowed ? '\u2713' : '\u2717'} {label}
    </span>
  );
}

function Section({
  title,
  icon,
  children,
  fullWidth,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`${styles.card} ${fullWidth ? styles.fullWidth : ''}`}>
      <div className={styles.cardHeader}>
        {icon}
        <h3>{title}</h3>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

const ENGAGEMENT_TYPE_LABELS: Record<string, string> = {
  external: 'External Penetration Test',
  internal: 'Internal Penetration Test',
  web_app: 'Web Application Test',
  api: 'API Security Test',
  mobile: 'Mobile Application Test',
  physical: 'Physical Security Test',
  social_engineering: 'Social Engineering',
  red_team: 'Red Team Engagement',
};

const CATEGORY_LABELS: Record<string, string> = {
  brute_force: 'Credential Testing',
  dos: 'Availability Testing',
  social_engineering: 'Social Engineering',
  physical: 'Physical Access',
};

export function RoeViewer({ projectId, project }: RoeViewerProps) {
  if (!project.roeEnabled) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <Shield size={44} strokeWidth={1.5} />
            <h2>RoE가 없습니다</h2>
            <p>이 프로젝트에 RoE 문서가 설정되지 않았습니다.</p>
            <p className={styles.hint}>
              프로젝트 생성 시 RoE 문서를 업로드하여 에이전트 제약을
              활성화하세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    window.open(`/api/projects/${projectId}/roe/download`, '_blank');
  };

  // Time window status
  let timeWindowActive = false;
  if (project.roeTimeWindowEnabled) {
    try {
      const now = new Date();
      const day = now
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();
      timeWindowActive = (project.roeTimeWindowDays || []).includes(day);
      const currentTime = now.toTimeString().slice(0, 5);
      if (timeWindowActive) {
        const start = project.roeTimeWindowStartTime || '00:00';
        const end = project.roeTimeWindowEndTime || '23:59';
        if (start <= end) {
          timeWindowActive = currentTime >= start && currentTime <= end;
        } else {
          timeWindowActive = currentTime >= start || currentTime <= end;
        }
      }
    } catch {
      // ignore
    }
  }

  const maxPhase = project.roeMaxSeverityPhase || 'post_exploitation';
  const phaseClass =
    maxPhase === 'informational'
      ? styles.phaseInfo
      : maxPhase === 'exploitation'
        ? styles.phaseExploit
        : styles.phaseAll;
  const phaseLabel =
    maxPhase === 'informational'
      ? '정보 수집만'
      : maxPhase === 'exploitation'
        ? '익스플로잇까지'
        : '모든 페이즈';

  const dataHandlingLabels: Record<string, string> = {
    no_access: 'No access to sensitive data',
    prove_access_only: 'Prove access only (no collection)',
    limited_collection: 'Limited collection allowed',
    full_access: 'Full access permitted',
  };

  const frequencyLabels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    on_finding: 'On each finding',
    none: 'None',
  };

  const excludedHosts = project.roeExcludedHosts || [];
  const forbiddenCategories = project.roeForbiddenCategories || [];
  const complianceFrameworks = project.roeComplianceFrameworks || [];
  const thirdPartyProviders = project.roeThirdPartyProviders || [];

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Shield size={20} />
            <h2>RoE</h2>
          </div>
          {project.roeDocumentName && (
            <button className={styles.downloadBtn} onClick={handleDownload}>
              <Download size={14} />
              {project.roeDocumentName}
            </button>
          )}
        </div>

        <div className={styles.grid}>
          {/* Engagement Info */}
          <Section title="고객사" icon={<Users size={15} />}>
            {project.roeClientName && (
              <div className={styles.row}>
                <span>고객사</span>
                <strong>{project.roeClientName}</strong>
              </div>
            )}
            {project.roeEngagementType && (
              <div className={styles.row}>
                <span>유형</span>
                <strong>
                  {ENGAGEMENT_TYPE_LABELS[project.roeEngagementType] ||
                    project.roeEngagementType}
                </strong>
              </div>
            )}
            {(project.roeEngagementStartDate ||
              project.roeEngagementEndDate) && (
              <div className={styles.row}>
                <span>기간</span>
                <strong>
                  {project.roeEngagementStartDate || '?'} &rarr;{' '}
                  {project.roeEngagementEndDate || '?'}
                </strong>
              </div>
            )}
            {project.roeClientContactName && (
              <div className={styles.row}>
                <span>담당자</span>
                <strong>{project.roeClientContactName}</strong>
              </div>
            )}
            {project.roeClientContactEmail && (
              <div className={styles.row}>
                <span>이메일</span>
                <strong>{project.roeClientContactEmail}</strong>
              </div>
            )}
            {project.roeClientContactPhone && (
              <div className={styles.row}>
                <span>전화</span>
                <strong>{project.roeClientContactPhone}</strong>
              </div>
            )}
            {project.roeEmergencyContact && (
              <div className={styles.row}>
                <span>비상 연락잘</span>
                <strong>{project.roeEmergencyContact}</strong>
              </div>
            )}
          </Section>

          {/* Scope */}
          <Section title="스코프" icon={<Globe size={15} />}>
            {project.targetDomain && (
              <div className={styles.row}>
                <span>도메인</span>
                <strong>{project.targetDomain}</strong>
              </div>
            )}
            {project.targetIps && project.targetIps.length > 0 && (
              <div className={styles.row}>
                <span>IP 대역</span>
                <strong>{project.targetIps.join(', ')}</strong>
              </div>
            )}
            {excludedHosts.length > 0 && (
              <div className={styles.row}>
                <span>제외 항목</span>
                <strong>{excludedHosts.length}개 호스트</strong>
              </div>
            )}
          </Section>

          {/* Exclusions — full width */}
          {excludedHosts.length > 0 && (
            <Section title="제외 호스트" icon={<Ban size={15} />} fullWidth>
              {excludedHosts.map((host, i) => (
                <div key={i} className={styles.exclusionRow}>
                  <span className={styles.exclusionHost}>{host}</span>
                  {(project.roeExcludedHostReasons || [])[i] && (
                    <span className={styles.exclusionReason}>
                      &mdash; {(project.roeExcludedHostReasons || [])[i]}
                    </span>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Time Window */}
          {project.roeTimeWindowEnabled && (
            <Section title="시간 윈도우" icon={<Clock size={15} />}>
              <div className={styles.row}>
                <span>요일</span>
                <strong>
                  {(project.roeTimeWindowDays || [])
                    .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
                    .join(', ')}
                </strong>
              </div>
              <div className={styles.row}>
                <span>시간</span>
                <strong>
                  {project.roeTimeWindowStartTime} &ndash;{' '}
                  {project.roeTimeWindowEndTime}
                </strong>
              </div>
              <div className={styles.row}>
                <span>시간대</span>
                <strong>{project.roeTimeWindowTimezone || 'UTC'}</strong>
              </div>
              <div className={styles.row}>
                <span>상태</span>
                <span
                  className={
                    timeWindowActive
                      ? styles.statusActive
                      : styles.statusInactive
                  }
                >
                  {timeWindowActive ? '\u25CF ACTIVE' : '\u25CB OUTSIDE WINDOW'}
                </span>
              </div>
            </Section>
          )}

          {/* Testing Permissions */}
          <Section title="테스트 허가" icon={<Shield size={15} />}>
            <div className={styles.permGrid}>
              <PermBadge allowed={!!project.roeAllowDos} label="가용성" />
              <PermBadge
                allowed={!!project.roeAllowSocialEngineering}
                label="소셜 공학"
              />
              <PermBadge
                allowed={!!project.roeAllowPhysicalAccess}
                label="물리적 접근"
              />
              <PermBadge
                allowed={!!project.roeAllowDataExfiltration}
                label="데이터 유출"
              />
              <PermBadge
                allowed={!!project.roeAllowAccountLockout}
                label="계정 잠금"
              />
              <PermBadge
                allowed={project.roeAllowProductionTesting !== false}
                label="프로덕션"
              />
            </div>
          </Section>

          {/* Constraints */}
          <Section title="제약 사항" icon={<AlertTriangle size={15} />}>
            <div className={styles.row}>
              <span>최대 페이즈</span>
              <span className={`${styles.phaseIndicator} ${phaseClass}`}>
                {phaseLabel}
              </span>
            </div>
            {(project.roeGlobalMaxRps || 0) > 0 && (
              <div className={styles.row}>
                <span>속도 제한</span>
                <strong>{project.roeGlobalMaxRps} rps</strong>
              </div>
            )}
            {forbiddenCategories.length > 0 && (
              <>
                <div className={styles.row}>
                  <span>금지 사항</span>
                  <span />
                </div>
                <div className={styles.tagList}>
                  {forbiddenCategories.map((cat) => (
                    <span key={cat} className={styles.tagDanger}>
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* Data Handling */}
          <Section title="데이터 처리" icon={<Lock size={15} />}>
            <div className={styles.row}>
              <span>정책</span>
              <span className={styles.dataHandling}>
                {
                  dataHandlingLabels[
                    project.roeSensitiveDataHandling || 'no_access'
                  ]
                }
              </span>
            </div>
            <div className={styles.row}>
              <span>보유 기간</span>
              <strong>{project.roeDataRetentionDays || 90} days</strong>
            </div>
            {project.roeRequireDataEncryption !== false && (
              <div className={styles.row}>
                <span>암호화</span>
                <span className={styles.encryptionBadge}>
                  {'\u2713'} 필수 (저장 + 전송 시 암호화)
                </span>
              </div>
            )}
          </Section>

          {/* Communication */}
          <Section title="커뮤니케이션" icon={<FileText size={15} />}>
            <div className={styles.row}>
              <span>상태 업데이트</span>
              <strong>
                {frequencyLabels[project.roeStatusUpdateFrequency || 'daily'] ||
                  project.roeStatusUpdateFrequency}
              </strong>
            </div>
            <div className={styles.row}>
              <span>중요 알림</span>
              <strong>
                {project.roeCriticalFindingNotify !== false ? '즉시' : '없음'}
              </strong>
            </div>
            {project.roeIncidentProcedure && (
              <div className={styles.textBlock}>
                <span>인시던트 절차</span>
                <p>{project.roeIncidentProcedure}</p>
              </div>
            )}
          </Section>

          {/* Compliance */}
          {(complianceFrameworks.length > 0 ||
            thirdPartyProviders.length > 0) && (
            <Section title="컴플라이언스 및 인가" icon={<Shield size={15} />}>
              {complianceFrameworks.length > 0 && (
                <>
                  <div className={styles.row}>
                    <span>프레임워크</span>
                    <span />
                  </div>
                  <div className={styles.tagList}>
                    {complianceFrameworks.map((fw) => (
                      <span key={fw} className={styles.tagInfo}>
                        {fw}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {thirdPartyProviders.length > 0 && (
                <>
                  <div className={styles.row}>
                    <span>제3자</span>
                    <span />
                  </div>
                  <div className={styles.tagList}>
                    {thirdPartyProviders.map((p) => (
                      <span key={p} className={styles.tag}>
                        {p}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Section>
          )}

          {/* Notes — full width */}
          {project.roeNotes && (
            <Section title="추가 메모" icon={<FileText size={15} />} fullWidth>
              <p className={styles.notes}>{project.roeNotes}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
