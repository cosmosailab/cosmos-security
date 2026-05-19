'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Bug,
  KeyRound,
  Mail,
  Swords,
  Loader2,
  Settings,
  Zap,
  Database,
  Code2,
  Globe,
  Terminal,
  FolderTree,
  Download,
} from 'lucide-react';
import type { Project } from '@prisma/client';
import { useProject } from '@/providers/ProjectProvider';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { useAlertModal } from '@/components/ui/AlertModal';
import { WikiInfoButton } from '@/components/ui/WikiInfoButton';
import { HydraSection } from './BruteForceSection';
import { PhishingSection } from './PhishingSection';
import { DosSection } from './DosSection';
import { SqliSection } from './SqliSection';
import { SsrfSection } from './SsrfSection';
import { RceSection } from './RceSection';
import { PathTraversalSection } from './PathTraversalSection';
import styles from '../ProjectForm.module.css';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface AttackSkillsSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

interface BuiltInSkillDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface UserSkillDef {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

const BUILT_IN_SKILLS: BuiltInSkillDef[] = [
  {
    id: 'cve_exploit',
    name: 'CVE (MSF)',
    description:
      'Metasploit Framework 모듈을 사용하여 타겟 서비스의 알려진 CVE 취약점을 익스플로잇',
    icon: <Bug size={16} />,
  },
  {
    id: 'sql_injection',
    name: 'SQL 인젝션',
    description:
      'SQLMap을 이용한 SQL 인젝션 테스트 (WAF 바이패스, 블라인드 인젝션, OOB DNS 유출)',
    icon: <Database size={16} />,
  },
  {
    id: 'xss',
    name: '크로스사이트 스크립팅',
    description:
      'Dalfox, kxss, Playwright를 사용한 리플렉트드/저장된/DOM 기반/블라인드 XSS 테스트 및 CSP 바이패스 가이드',
    icon: <Code2 size={16} />,
  },
  {
    id: 'ssrf',
    name: '서버 측 요청 위조',
    description:
      'SSRF 탐지, 내부 네트워크 프로빙, 클라우드 메타데이터 피벗, 프로토콜 스머글링, DNS 리바인딩, Redis/FastCGI/Docker RCE 체인',
    icon: <Globe size={16} />,
  },
  {
    id: 'rce',
    name: '원격 코드 실행',
    description:
      '6가지 프리미티브를 통한 RCE/명령 인젝션: 쉘 메타 문자 인젝션(commix), SSTI(sstimap), Java/PHP/Python 역직렬화(ysoserial), eval/OGNL/SpEL, 마디어 파이프라인 RCE, SSRF-to-RCE 체인',
    icon: <Terminal size={16} />,
  },
  {
    id: 'path_traversal',
    name: '경로 트래버싀 / LFI / RFI',
    description:
      '경로 트래버싀, 로컈 파일 포함, 원격 파일 포함, PHP 래퍼 체인(php://filter, data://, expect://), 로그 오염, Zip Slip 아카이브 추출 테스트',
    icon: <FolderTree size={16} />,
  },
  {
    id: 'brute_force_credential_guess',
    name: '자격 증명 테스트',
    description: 'Hydra를 사용한 로그인 서비스 자격 증명 정책 유효성 검증',
    icon: <KeyRound size={16} />,
  },
  {
    id: 'phishing_social_engineering',
    name: '소셜 엔지니어링 시뮬레이션',
    description:
      '승인된 인식 제고 테스트를 위한 페이로드 생성, 문서 제작, 이메일 발송',
    icon: <Mail size={16} />,
  },
  {
    id: 'denial_of_service',
    name: '가용성 테스트',
    description: '플러딩, 리소스 소진, 크래시 벡터를 사용한 서비스 복원력 평가',
    icon: <Zap size={16} />,
  },
];

type AttackSkillConfig = {
  builtIn: Record<string, boolean>;
  user: Record<string, boolean>;
};

const DEFAULT_CONFIG: AttackSkillConfig = {
  builtIn: {
    cve_exploit: true,
    sql_injection: true,
    xss: true,
    ssrf: true,
    rce: true,
    path_traversal: true,
    brute_force_credential_guess: false,
    phishing_social_engineering: false,
    denial_of_service: false,
  },
  user: {},
};

function getConfig(data: FormData): AttackSkillConfig {
  const raw = data.attackSkillConfig as unknown;
  if (
    raw &&
    typeof raw === 'object' &&
    'builtIn' in (raw as Record<string, unknown>)
  ) {
    return raw as AttackSkillConfig;
  }
  return DEFAULT_CONFIG;
}

export function AttackSkillsSection({
  data,
  updateField,
}: AttackSkillsSectionProps) {
  const { userId } = useProject();
  const { alertError, alert: showAlert } = useAlertModal();
  const [builtInOpen, setBuiltInOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [userSkills, setUserSkills] = useState<UserSkillDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const config = getConfig(data);

  // Fetch available user skills
  const fetchUserSkills = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const resp = await fetch(`/api/users/${userId}/attack-skills`);
      if (resp.ok) setUserSkills(await resp.json());
    } catch (err) {
      console.error('Failed to fetch user attack skills:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserSkills();
  }, [fetchUserSkills]);

  const isBuiltInEnabled = (skillId: string) => {
    if (skillId in config.builtIn) {
      return config.builtIn[skillId] !== false;
    }
    // Key missing from saved config: fall back to the shipped default so the
    // UI matches what the Python agent does (get_enabled_builtin_skills is a
    // strict has-key check; missing key = disabled). Without this fallback,
    // legacy projects show new skills as ON in the UI while the agent treats
    // them as OFF, and toggling does not persist until the user explicitly
    // clicks. Default-OFF skills like ssrf are the obvious victim.
    return DEFAULT_CONFIG.builtIn[skillId] ?? false;
  };

  const isUserEnabled = (skillId: string) => {
    return config.user[skillId] === true;
  };

  const toggleBuiltIn = (skillId: string, enabled: boolean) => {
    const newConfig: AttackSkillConfig = {
      ...config,
      builtIn: { ...config.builtIn, [skillId]: enabled },
    };
    // Sync hydraEnabled with brute force master toggle
    if (skillId === 'brute_force_credential_guess') {
      updateField('hydraEnabled', enabled);
    }
    updateField(
      'attackSkillConfig',
      newConfig as unknown as FormData['attackSkillConfig'],
    );
  };

  const toggleUser = (skillId: string, enabled: boolean) => {
    const newConfig: AttackSkillConfig = {
      ...config,
      user: { ...config.user, [skillId]: enabled },
    };
    updateField(
      'attackSkillConfig',
      newConfig as unknown as FormData['attackSkillConfig'],
    );
  };

  const downloadSkill = useCallback(
    async (skillId: string, skillName: string) => {
      if (!userId) return;
      try {
        const resp = await fetch(
          `/api/users/${userId}/attack-skills/${skillId}`,
        );
        if (!resp.ok) return;
        const skill = await resp.json();
        const blob = new Blob([skill.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${skillName}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download skill:', err);
      }
    },
    [userId],
  );

  const importCommunityAgentSkills = useCallback(async () => {
    if (!userId || importing) return;
    setImporting(true);
    try {
      const previousIds = new Set(userSkills.map((s) => s.id));

      const resp = await fetch(
        `/api/users/${userId}/attack-skills/import-community`,
        { method: 'POST' },
      );
      const result = await resp.json();
      if (!resp.ok) {
        alertError(result.error || 'Failed to import community skills');
        return;
      }

      const refreshResp = await fetch(`/api/users/${userId}/attack-skills`);
      if (!refreshResp.ok) {
        showAlert(
          result.message ||
            `Imported ${result.imported ?? 0} community skill(s).`,
        );
        return;
      }
      const fresh: UserSkillDef[] = await refreshResp.json();
      setUserSkills(fresh);

      // Enable newly imported skills in THIS project's config (existing ones untouched).
      const newlyImported = fresh.filter((s) => !previousIds.has(s.id));
      if (newlyImported.length > 0) {
        const updatedUser = { ...config.user };
        for (const s of newlyImported) updatedUser[s.id] = true;
        const newConfig: AttackSkillConfig = { ...config, user: updatedUser };
        updateField(
          'attackSkillConfig',
          newConfig as unknown as FormData['attackSkillConfig'],
        );
      }

      showAlert(
        `Imported ${result.imported ?? 0} community skill(s)` +
          (result.skipped ? `, skipped ${result.skipped} duplicate(s)` : '') +
          '. New skills are enabled for this project.',
      );
    } catch (err) {
      console.error('Failed to import community skills:', err);
      alertError('Failed to import community skills');
    } finally {
      setImporting(false);
    }
  }, [
    userId,
    importing,
    userSkills,
    config,
    updateField,
    alertError,
    showAlert,
  ]);

  return (
    <>
      {/* Built-in Agent Skills */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => setBuiltInOpen(!builtInOpen)}
        >
          <h2 className={styles.sectionTitle}>
            <Bug size={16} />
            빌트인 에이전트 스킬
            <WikiInfoButton target="AttackSkills" />
            <span className={styles.badgeActive}>활성</span>
          </h2>
          <ChevronDown
            size={16}
            className={`${styles.sectionIcon} ${builtInOpen ? styles.sectionIconOpen : ''}`}
          />
        </div>

        {builtInOpen && (
          <div className={styles.sectionContent}>
            <p className={styles.sectionDescription}>
              핵심 에이전트 스킬 (전문 워크플로우 포함). 스킬을 비활성화하면
              에이전트가 해당 유형으로 요청을 분류하거나 프롬프트를 사용하지
              못하게 합니다.
            </p>

            {BUILT_IN_SKILLS.map((skill) => {
              const enabled = isBuiltInEnabled(skill.id);
              return (
                <div
                  key={skill.id}
                  style={{
                    marginBottom: 'var(--space-4)',
                    opacity: enabled ? 1 : 0.5,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      marginBottom: enabled ? 'var(--space-3)' : 0,
                      padding: 'var(--space-3)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-default)',
                    }}
                  >
                    <Toggle
                      checked={enabled}
                      onChange={(v) => toggleBuiltIn(skill.id, v)}
                      size="large"
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1-5)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {skill.icon}
                        {skill.name}
                        <span className={styles.badgeActive}>활성</span>
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                        }}
                      >
                        {skill.description}
                      </div>
                    </div>
                  </div>

                  {/* Sub-settings rendered when skill is ON */}
                  {enabled && skill.id === 'brute_force_credential_guess' && (
                    <HydraSection data={data} updateField={updateField} />
                  )}
                  {enabled && skill.id === 'phishing_social_engineering' && (
                    <PhishingSection data={data} updateField={updateField} />
                  )}
                  {enabled && skill.id === 'denial_of_service' && (
                    <DosSection data={data} updateField={updateField} />
                  )}
                  {enabled && skill.id === 'sql_injection' && (
                    <SqliSection data={data} updateField={updateField} />
                  )}
                  {enabled && skill.id === 'ssrf' && (
                    <SsrfSection data={data} updateField={updateField} />
                  )}
                  {enabled && skill.id === 'rce' && (
                    <RceSection data={data} updateField={updateField} />
                  )}
                  {enabled && skill.id === 'path_traversal' && (
                    <PathTraversalSection
                      data={data}
                      updateField={updateField}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Agent Skills */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => setUserOpen(!userOpen)}
        >
          <h2 className={styles.sectionTitle}>
            <Swords size={16} />
            사용자 에이전트 스킬
            <WikiInfoButton
              target="https://github.com/samugit83/redamon/wiki/Agent-Skills#community-skills"
              title="Open Community Agent Skills wiki section"
            />
          </h2>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              className="secondaryButton"
              onClick={(e) => {
                e.stopPropagation();
                importCommunityAgentSkills();
              }}
              disabled={importing || !userId}
              title="커뮤니티의 모든 공격 스킬을 내 라이브러리에 가져오고 이 프로젝트에 활성화"
            >
              {importing ? (
                <Loader2
                  size={14}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              ) : (
                <Download size={14} />
              )}
              커뮤니티에서 가져오기
            </button>
            <ChevronDown
              size={16}
              className={`${styles.sectionIcon} ${userOpen ? styles.sectionIconOpen : ''}`}
            />
          </div>
        </div>

        {userOpen && (
          <div className={styles.sectionContent}>
            <p className={styles.sectionDescription}>
              전역 설정에서 업로드된 커스텀 에이전트 스킬. 스킬을 활성화하면
              에이전트가 해당 유형으로 요청을 분류하고 워크플로우를 사용합니다.
              신규 가져오기 스킬은 새 프로젝트에서 기본적으로 OFF; 위의 가져오기
              버튼으로 커뮤니티 템플릿을 일괄 가져오거나 이 프로젝트에 자동
              활성화하세요.
            </p>

            {loading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-4)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <Loader2
                  size={16}
                  style={{ animation: 'spin 1s linear infinite' }}
                />{' '}
                불러오는 중...
              </div>
            ) : userSkills.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-6) var(--space-4)',
                  color: 'var(--text-tertiary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <p style={{ marginBottom: 'var(--space-3)' }}>
                  아직 업로드된 사용자 스킬이 없습니다. 전역 설정에서{' '}
                  <code>.md</code> 스킬 파일을 업로드하여 커스텀 공격
                  워크플로우를 만드세요.
                </p>
                <Link
                  href="/settings"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-1-5)',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-default)',
                    textDecoration: 'none',
                    transition: 'var(--transition-all)',
                  }}
                >
                  <Settings size={13} />
                  전역 설정으로 이동
                </Link>
              </div>
            ) : (
              userSkills.map((skill) => {
                const enabled = isUserEnabled(skill.id);
                return (
                  <div
                    key={skill.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-2)',
                      padding: 'var(--space-3)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-default)',
                      opacity: enabled ? 1 : 0.5,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Toggle
                      checked={enabled}
                      onChange={(v) => toggleUser(skill.id, v)}
                      size="large"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1-5)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <Swords size={14} />
                        {skill.name}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                        }}
                      >
                        {skill.description || (
                          <span style={{ opacity: 0.5, fontStyle: 'italic' }}>
                            설명 없음
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                        }}
                      >
                        업로드됨{' '}
                        {new Date(skill.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="iconButton"
                      title=".md 다운로드"
                      onClick={() => downloadSkill(skill.id, skill.name)}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
