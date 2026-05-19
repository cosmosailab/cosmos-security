'use client';

import { useState } from 'react';
import { ChevronDown, Search, AlertTriangle } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import Link from 'next/link';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface TrufflehogSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  hasGithubToken?: boolean;
}

export function TrufflehogSection({
  data,
  updateField,
  hasGithubToken = false,
}: TrufflehogSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const hasConfig =
    ((data as any).trufflehogGithubOrg ?? '').length > 0 ||
    ((data as any).trufflehogGithubRepos ?? '').length > 0;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Search size={16} />
          TruffleHog 시크릿 스캐너
          <WikiInfoButton target="Trufflehog" />
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
            700개 이상의 탐지기와 라이브 API 선택적 검증을 지원하는 심층 시크릿
            스칄닝.
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
            <label className={styles.fieldLabel}>GitHub 조직</label>
            <input
              type="text"
              className="textInput"
              value={(data as any).trufflehogGithubOrg ?? ''}
              onChange={(e) =>
                updateField('trufflehogGithubOrg' as any, e.target.value)
              }
              placeholder="organization-name"
              disabled={!hasGithubToken}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>GitHub 레포지토리</label>
            <input
              type="text"
              className="textInput"
              value={(data as any).trufflehogGithubRepos ?? ''}
              onChange={(e) =>
                updateField('trufflehogGithubRepos' as any, e.target.value)
              }
              placeholder="org/repo1, org/repo2"
              disabled={!hasGithubToken}
            />
            <span className={styles.fieldHint}>
              콤마로 구분. 전체 URL 또는 org/repo 형식.
            </span>
          </div>

          {hasConfig && hasGithubToken && (
            <>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>검증된 시크릿만</span>
                  <p className={styles.toggleDescription}>
                    라이브 API에 대해 활성으로 검증된 시크릿만 출력
                  </p>
                </div>
                <Toggle
                  checked={(data as any).trufflehogOnlyVerified ?? false}
                  onChange={(checked) =>
                    updateField('trufflehogOnlyVerified' as any, checked)
                  }
                />
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>검증 건너맰기</span>
                  <p className={styles.toggleDescription}>
                    빠른 스칄닝을 위해 API 검증 생략
                  </p>
                </div>
                <Toggle
                  checked={(data as any).trufflehogNoVerification ?? false}
                  onChange={(checked) =>
                    updateField('trufflehogNoVerification' as any, checked)
                  }
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>동시 처리</label>
                <input
                  type="number"
                  className="textInput"
                  value={(data as any).trufflehogConcurrency ?? 8}
                  onChange={(e) =>
                    updateField(
                      'trufflehogConcurrency' as any,
                      parseInt(e.target.value) || 8,
                    )
                  }
                  min={1}
                  max={32}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>포함 탐지기</label>
                <input
                  type="text"
                  className="textInput"
                  value={(data as any).trufflehogIncludeDetectors ?? ''}
                  onChange={(e) =>
                    updateField(
                      'trufflehogIncludeDetectors' as any,
                      e.target.value,
                    )
                  }
                  placeholder="AWS,GitHub,Slack"
                />
                <span className={styles.fieldHint}>
                  콤마로 구분, AWS,GitHub,Slack. 비워두면 모두 사용.
                </span>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>제외 탐지기</label>
                <input
                  type="text"
                  className="textInput"
                  value={(data as any).trufflehogExcludeDetectors ?? ''}
                  onChange={(e) =>
                    updateField(
                      'trufflehogExcludeDetectors' as any,
                      e.target.value,
                    )
                  }
                  placeholder="DetectorName1,DetectorName2"
                />
                <span className={styles.fieldHint}>
                  건너맰 탐지기 콤마 구분
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
