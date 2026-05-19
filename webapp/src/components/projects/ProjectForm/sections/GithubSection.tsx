'use client';

import { useState } from 'react';
import { ChevronDown, Github, AlertTriangle } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { TimeEstimate } from '../TimeEstimate';
import Link from 'next/link';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface GithubSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  hasGithubToken?: boolean;
}

export function GithubSection({
  data,
  updateField,
  hasGithubToken = false,
}: GithubSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Github size={16} />
          GitHub 시크릿 헌팅
          <NodeInfoTooltip section="Github" />
          <WikiInfoButton target="Github" />
          <span className={styles.badgePassive}>비활성</span>
        </h2>
        <ChevronDown
          size={16}
          className={`${styles.sectionIcon} ${isOpen ? styles.sectionIconOpen : ''}`}
        />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <p className={styles.sectionDescription}>
            타겟 도메인과 관련된 노입 시크릿, API 키, 자격증명에 대해 GitHub
            레포지토리를 검색합니다. 시스템 및 서비스에 대한 무단 접근을
            가능하게 하는 누없된 민감한 데이터를 탐지합니다.
          </p>

          {!hasGithubToken && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                marginBottom: '12px',
              }}
            >
              <AlertTriangle
                size={16}
                style={{ color: '#f59e0b', flexShrink: 0 }}
              />
              <span
                style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
              >
                GitHub 액세스 토큰이 필요합니다.{' '}
                <Link
                  href="/settings"
                  style={{ color: 'var(--accent-primary)', fontWeight: 500 }}
                >
                  글로벌 설정에서 설정하세요
                </Link>
              </span>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>타겟 조직</label>
            <input
              type="text"
              className="textInput"
              value={data.githubTargetOrg}
              onChange={(e) => updateField('githubTargetOrg', e.target.value)}
              placeholder="organization-name"
              disabled={!hasGithubToken}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>타겟 레포지토리</label>
            <input
              type="text"
              className="textInput"
              value={data.githubTargetRepos}
              onChange={(e) => updateField('githubTargetRepos', e.target.value)}
              placeholder="repo1, repo2, repo3"
              disabled={!hasGithubToken}
            />
            <span className={styles.fieldHint}>
              콤마로 구분. 비워두면 모든 레포지토리 스캔.
            </span>
          </div>

          {hasGithubToken && (
            <>
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>스캔 옵션</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      멤버 레포지토리 스캔
                    </span>
                    <p className={styles.toggleDescription}>
                      조직 멤버의 레포지토리 포함
                    </p>
                  </div>
                  <Toggle
                    checked={data.githubScanMembers}
                    onChange={(checked) =>
                      updateField('githubScanMembers', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>Gists 스캔</span>
                    <p className={styles.toggleDescription}>
                      Gists에서 시크릿 검색
                    </p>
                  </div>
                  <Toggle
                    checked={data.githubScanGists}
                    onChange={(checked) =>
                      updateField('githubScanGists', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>코밋 스캔</span>
                    <p className={styles.toggleDescription}>
                      코밋 히스토리에서 시크릿 검색
                    </p>
                    <TimeEstimate estimate="Most expensive operation — disabling saves 50%+ time" />
                  </div>
                  <Toggle
                    checked={data.githubScanCommits}
                    onChange={(checked) =>
                      updateField('githubScanCommits', checked)
                    }
                  />
                </div>
              </div>

              {data.githubScanCommits && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 스캔 코밋 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.githubMaxCommits}
                    onChange={(e) =>
                      updateField(
                        'githubMaxCommits',
                        parseInt(e.target.value) || 100,
                      )
                    }
                    min={1}
                    max={1000}
                  />
                  <span className={styles.fieldHint}>
                    레포지토리당 스캔할 코밋 수
                  </span>
                  <TimeEstimate estimate="Scales linearly: 100 = default, 1000 = ~10x slower" />
                </div>
              )}

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>JSON으로 출력</span>
                  <p className={styles.toggleDescription}>
                    JSON 형식으로 결과 저장
                  </p>
                </div>
                <Toggle
                  checked={data.githubOutputJson}
                  onChange={(checked) =>
                    updateField('githubOutputJson', checked)
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
