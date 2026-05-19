'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Globe, Info, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import { useProject } from '@/providers/ProjectProvider';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface UrlscanSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function UrlscanSection({
  data,
  updateField,
  onRun,
}: UrlscanSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { userId } = useProject();
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const checkApiKey = useCallback(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((settings) => {
        if (settings) {
          setHasApiKey(!!settings.urlscanApiKey);
        }
      })
      .catch(() => setHasApiKey(false));
  }, [userId]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Globe size={16} />
          URLScan.io 실정찰 확대
          <NodeInfoTooltip section="Urlscan" />
          <WikiInfoButton target="Urlscan" />
          <span className={styles.badgePassive}>비활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.urlscanEnabled && (
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
              title="URLScan 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.urlscanEnabled}
              onChange={(checked) => updateField('urlscanEnabled', checked)}
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
            URLScan.io 역사 스캔 데이터를 이용한 패시브 OSINT 데이터 강화.
            타겟에 직접 접속 없이 추가 서브도메인, IP, ASN 정보, 도메인 연령,
            TLS 인증서, 서버 기술, 스크린샷 정보를 발견합니다. 도메인 탐지 이후,
            포트 스칄닝 전에 실행됩니다.
          </p>

          <div
            className={styles.shodanWarning}
            style={{ borderColor: 'var(--color-info, #3b82f6)' }}
          >
            <Info size={14} />
            {hasApiKey
              ? 'URLScan API 키 설정됨 — 높은 요청 한도 활성화.'
              : 'API 키 없이도 사용 가능 (공개 결과만). 더 높은 요청 한도를 위해 글로벌 설정에서 키를 추가하세요.'}
          </div>

          {data.urlscanEnabled && (
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>최대 결과</label>
                <input
                  type="number"
                  className="textInput"
                  value={data.urlscanMaxResults}
                  onChange={(e) =>
                    updateField(
                      'urlscanMaxResults',
                      parseInt(e.target.value) || 50000,
                    )
                  }
                  min={1}
                  max={50000}
                />
                <span className={styles.fieldHint}>
                  URLScan API에서 가져올 최대 스캔 결과 수
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
