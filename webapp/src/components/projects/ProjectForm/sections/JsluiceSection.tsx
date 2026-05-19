'use client';

import { useState } from 'react';
import { ChevronDown, Code, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface JsluiceSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function JsluiceSection({
  data,
  updateField,
  onRun,
}: JsluiceSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Code size={16} />
          jsluice JS Analyzer
          <NodeInfoTooltip section="Jsluice" />
          <WikiInfoButton target="Jsluice" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.jsluiceEnabled && (
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
              title="jsluice JS 분석기 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.jsluiceEnabled}
              onChange={(checked) => updateField('jsluiceEnabled', checked)}
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
            Bishop Fox의 jsluice를 사용한 JavaScript 파일 정적 분석. Katana와
            Hakrawler가 발견한 JS 소스 코드에서 숨겨진 API 엔드포인트, 경로,
            쿼리 파라맸터, 시크릿 (AWS 키, API 토큰)을 추출합니다. JS 파일
            가져오기 외에는 대상에 대한 추가 트래픽이 없습니다.
          </p>

          {data.jsluiceEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>최대 JS 파일 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.jsluiceMaxFiles}
                    onChange={(e) =>
                      updateField(
                        'jsluiceMaxFiles',
                        parseInt(e.target.value) || 10000,
                      )
                    }
                    min={1}
                    max={10000}
                  />
                  <span className={styles.fieldHint}>
                    .가져오고 분석할 .js 파일 최대 수
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.jsluiceTimeout}
                    onChange={(e) =>
                      updateField(
                        'jsluiceTimeout',
                        parseInt(e.target.value) || 300,
                      )
                    }
                    min={30}
                  />
                  <span className={styles.fieldHint}>전체 분석 타임아웃</span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>동시 실행 수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.jsluiceConcurrency}
                    onChange={(e) =>
                      updateField(
                        'jsluiceConcurrency',
                        parseInt(e.target.value) || 5,
                      )
                    }
                    min={1}
                    max={20}
                  />
                  <span className={styles.fieldHint}>
                    jsluice가 동시에 처리하는 파일 수
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>병렬수</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.jsluiceParallelism ?? 3}
                    onChange={(e) =>
                      updateField(
                        'jsluiceParallelism',
                        parseInt(e.target.value) || 3,
                      )
                    }
                    min={1}
                    max={10}
                  />
                  <span className={styles.fieldHint}>
                    병렬 기본 URL 분석 배치
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>추출 모드</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>URL 추출</span>
                    <p className={styles.toggleDescription}>
                      fetch(), XMLHttpRequest, jQuery.ajax 및 문자열 리터럴에서
                      API 엔드포인트, 경로, 파라미터 추출
                    </p>
                  </div>
                  <Toggle
                    checked={data.jsluiceExtractUrls}
                    onChange={(checked) =>
                      updateField('jsluiceExtractUrls', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>시크릿 추출</span>
                    <p className={styles.toggleDescription}>
                      AWS 키, GCP 인증, GitHub 토큰 및 기타 내장 시크릿 감지
                    </p>
                  </div>
                  <Toggle
                    checked={data.jsluiceExtractSecrets}
                    onChange={(checked) =>
                      updateField('jsluiceExtractSecrets', checked)
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
