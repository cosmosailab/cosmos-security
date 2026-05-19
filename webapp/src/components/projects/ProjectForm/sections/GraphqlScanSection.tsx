'use client';

import { useState } from 'react';
import { ChevronDown, Braces, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface GraphqlScanSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  projectId?: string;
  mode?: 'create' | 'edit';
  onRun?: () => void;
}

export function GraphqlScanSection({
  data,
  updateField,
  projectId,
  mode,
  onRun,
}: GraphqlScanSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const enabled = (data as any).graphqlSecurityEnabled ?? false;
  const authType = (data as any).graphqlAuthType ?? '';

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Braces size={16} />
          GraphQL 보안 스칌너
          <NodeInfoTooltip section="GraphqlScan" />
          <WikiInfoButton target="GraphqlScan" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && enabled && (
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
              title="GraphQL 보안 스칌 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={enabled}
              onChange={(checked) =>
                updateField('graphqlSecurityEnabled' as any, checked)
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
            액티브 GraphQL 보안 스아너. 크롤링된 BaseURL + 엔드포인트에서
            GraphQL 엔드포인트를 발견하고, introspection 노출 테스트, 스키마
            추출, 민감 필드 탐지, mutation/proxy-path 취약점 플래깅합니다. 기존
            Endpoint 노드에 <code> is_graphql</code> + 스키마 메타데이터 를
            업데이트하고 Vulnerability 노드를 생성합니다.
          </p>

          {enabled && (
            <>
              {/* Test Modules */}
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>보안 테스트</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      Introspection 테스트
                    </span>
                    <p className={styles.toggleDescription}>
                      <code>__schema</code>를 프로빙하여 introspection 노출 여부
                      탐지 (패시브, 낙은 트래픽).
                    </p>
                  </div>
                  <Toggle
                    checked={(data as any).graphqlIntrospectionTest ?? true}
                    onChange={(checked) =>
                      updateField('graphqlIntrospectionTest' as any, checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>SSL 검증</span>
                    <p className={styles.toggleDescription}>
                      타겟 엔드포인트의 잘못된/자체 서명 TLS 인증서 거부.
                    </p>
                  </div>
                  <Toggle
                    checked={(data as any).graphqlVerifySsl ?? true}
                    onChange={(checked) =>
                      updateField('graphqlVerifySsl' as any, checked)
                    }
                  />
                </div>
              </div>

              {/* Execution Limits */}
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>실행 제한</h3>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>타임아웃 (초)</label>
                    <input
                      type="number"
                      className="textInput"
                      value={(data as any).graphqlTimeout ?? 30}
                      onChange={(e) =>
                        updateField(
                          'graphqlTimeout' as any,
                          parseInt(e.target.value) || 30,
                        )
                      }
                      min={1}
                      max={600}
                    />
                    <span className={styles.fieldHint}>
                      엔드포인트당 요청 타임아웃
                    </span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      요청 제한 (req/s)
                    </label>
                    <input
                      type="number"
                      className="textInput"
                      value={(data as any).graphqlRateLimit ?? 10}
                      onChange={(e) =>
                        updateField(
                          'graphqlRateLimit' as any,
                          parseInt(e.target.value) || 10,
                        )
                      }
                      min={0}
                      max={100}
                    />
                    <span className={styles.fieldHint}>
                      0 = unlimited. Capped by ROE_GLOBAL_MAX_RPS.
                    </span>
                  </div>
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>동시 실행</label>
                    <input
                      type="number"
                      className="textInput"
                      value={(data as any).graphqlConcurrency ?? 5}
                      onChange={(e) =>
                        updateField(
                          'graphqlConcurrency' as any,
                          parseInt(e.target.value) || 5,
                        )
                      }
                      min={1}
                      max={20}
                    />
                    <span className={styles.fieldHint}>
                      동시 엔드포인트 테스트
                    </span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>쿼리 디핀 제한</label>
                    <input
                      type="number"
                      className="textInput"
                      value={(data as any).graphqlDepthLimit ?? 10}
                      onChange={(e) =>
                        updateField(
                          'graphqlDepthLimit' as any,
                          parseInt(e.target.value) || 10,
                        )
                      }
                      min={1}
                      max={50}
                    />
                    <span className={styles.fieldHint}>
                      최대 introspection 중첩 깊이
                    </span>
                  </div>
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>재시도 횟수</label>
                    <input
                      type="number"
                      className="textInput"
                      value={(data as any).graphqlRetryCount ?? 3}
                      onChange={(e) =>
                        updateField(
                          'graphqlRetryCount' as any,
                          parseInt(e.target.value) || 3,
                        )
                      }
                      min={0}
                      max={10}
                    />
                    <span className={styles.fieldHint}>
                      429/5xx 및 네트워크 오류 시 재시도 (Cloudflare 친화적)
                    </span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      재시도 백오프 (초)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="textInput"
                      value={(data as any).graphqlRetryBackoff ?? 2.0}
                      onChange={(e) =>
                        updateField(
                          'graphqlRetryBackoff' as any,
                          parseFloat(e.target.value) || 2.0,
                        )
                      }
                      min={0}
                    />
                    <span className={styles.fieldHint}>
                      재시도 사이 지수 백오프 기반수
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Endpoints */}
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>타겟 오버라이드</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>커스텀 엔드포인트</label>
                  <textarea
                    className="textInput"
                    rows={3}
                    placeholder="https://api.target.com/graphql, https://api.target.com/v1/graphql"
                    value={(data as any).graphqlEndpoints ?? ''}
                    onChange={(e) =>
                      updateField('graphqlEndpoints' as any, e.target.value)
                    }
                  />
                  <span className={styles.fieldHint}>
                    콤마 구분 GraphQL 엔드포인트 URL. 비우면 크롤링된
                    BaseURL/Endpoint에서 자동 발견 (권장).
                  </span>
                </div>
              </div>

              {/* Authentication */}
              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>인증</h3>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>인증 타입</label>
                    <select
                      className="textInput"
                      value={authType}
                      onChange={(e) =>
                        updateField('graphqlAuthType' as any, e.target.value)
                      }
                    >
                      <option value="">없음</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic (user:pass)</option>
                      <option value="cookie">Cookie</option>
                      <option value="custom">Custom Header</option>
                    </select>
                    <span className={styles.fieldHint}>
                      모든 GraphQL 요청에 헤더를 첨부합니다
                    </span>
                  </div>
                  {authType && (
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>인증 값</label>
                      <input
                        type="password"
                        className="textInput"
                        value={(data as any).graphqlAuthValue ?? ''}
                        onChange={(e) =>
                          updateField('graphqlAuthValue' as any, e.target.value)
                        }
                        placeholder={
                          authType === 'bearer'
                            ? 'eyJhbGci...'
                            : authType === 'basic'
                              ? 'user:password'
                              : authType === 'cookie'
                                ? 'session=abc123; csrf=xyz'
                                : authType === 'custom'
                                  ? 'secret-token-value'
                                  : ''
                        }
                      />
                      <span className={styles.fieldHint}>
                        {authType === 'basic' && 'base64로 자동 인코딩됨'}
                        {authType !== 'basic' && '헤더에 그대로 전송됨'}
                      </span>
                    </div>
                  )}
                </div>
                {authType === 'custom' && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        커스텀 헤더 이름
                      </label>
                      <input
                        type="text"
                        className="textInput"
                        value={(data as any).graphqlAuthHeader ?? ''}
                        onChange={(e) =>
                          updateField(
                            'graphqlAuthHeader' as any,
                            e.target.value,
                          )
                        }
                        placeholder="X-Api-Key"
                      />
                      <span className={styles.fieldHint}>
                        위의 커스텀 인증 값을 위한 헤더 이름
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* graphql-cop External Scanner (Phase 2 §17) */}
              <GraphqlCopSubSection data={data} updateField={updateField} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface GraphqlCopSubSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

function GraphqlCopSubSection({
  data,
  updateField,
}: GraphqlCopSubSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const copEnabled = (data as any).graphqlCopEnabled ?? false;

  return (
    <div className={styles.subSection}>
      <h3
        className={styles.subSectionTitle}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronDown
          size={14}
          style={{
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 150ms',
          }}
        />
        graphql-cop 외부 스칌너
        <span className={styles.badgeActive} style={{ fontSize: '9px' }}>
          활성
        </span>
        <span
          style={{
            fontSize: '9px',
            padding: '1px 6px',
            borderRadius: '3px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            fontWeight: 500,
          }}
        >
          12 checks
        </span>
        {copEnabled && (
          <span style={{ fontSize: '9px', color: '#22c55e', fontWeight: 500 }}>
            ENABLED
          </span>
        )}
      </h3>

      {expanded && (
        <>
          <p className={styles.sectionDescription} style={{ marginTop: '8px' }}>
            External Docker-based misconfig scanner (
            <code>dolevf/graphql-cop:1.14</code>). Runs 12 checks per endpoint
            including alias/batch/directive DoS probes, GraphiQL detection,
            trace/debug disclosure, GET-method CSRF, unhandled errors, and field
            suggestions. Traffic is <strong>active</strong> &mdash; DoS probes
            auto-disable in stealth mode. Introspection test is off by default
            to dedupe with the native scanner above.
          </p>

          <div className={styles.toggleRow}>
            <div>
              <span className={styles.toggleLabel}>graphql-cop 활성화</span>
              <p className={styles.toggleDescription}>
                Docker-in-Docker 엔드포인트별 호출. 기본: 비활성 (opt-in).
              </p>
            </div>
            <Toggle
              checked={copEnabled}
              onChange={(checked) =>
                updateField('graphqlCopEnabled' as any, checked)
              }
            />
          </div>

          {copEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Docker 이미지</label>
                  <input
                    type="text"
                    className="textInput"
                    value={
                      (data as any).graphqlCopDockerImage ??
                      'dolevf/graphql-cop:1.14'
                    }
                    onChange={(e) =>
                      updateField(
                        'graphqlCopDockerImage' as any,
                        e.target.value,
                      )
                    }
                  />
                  <span className={styles.fieldHint}>
                    1.14 고정 (DockerHub 태그). 커스텀 포크에는 오버라이드 가능.
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={(data as any).graphqlCopTimeout ?? 120}
                    onChange={(e) =>
                      updateField(
                        'graphqlCopTimeout' as any,
                        parseInt(e.target.value) || 120,
                      )
                    }
                    min={10}
                    max={600}
                  />
                  <span className={styles.fieldHint}>
                    엔드포인트당 타임아웃
                  </span>
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>Force Scan</span>
                  <p className={styles.toggleDescription}>
                    Run checks even if endpoint doesn&apos;t look GraphQL-like
                    (graphql-cop&apos;s <code>-f</code> flag).
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopForceScan ?? false}
                  onChange={(checked) =>
                    updateField('graphqlCopForceScan' as any, checked)
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>Debug Mode</span>
                  <p className={styles.toggleDescription}>
                    Add <code>X-GraphQL-Cop-Test</code> header per request
                    (graphql-cop&apos;s <code>-d</code> flag).
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopDebug ?? false}
                  onChange={(checked) =>
                    updateField('graphqlCopDebug' as any, checked)
                  }
                />
              </div>

              <h4
                className={styles.subSectionTitle}
                style={{ marginTop: '16px', fontSize: '12px' }}
              >
                실행할 테스트
              </h4>
              <p className={styles.fieldHint} style={{ marginBottom: '8px' }}>
                Each toggle maps to one graphql-cop test.{' '}
                <strong>
                  Filters findings from the report only &mdash; DoS traffic
                  still fires
                </strong>{' '}
                until graphql-cop ships <code>-e</code> support on DockerHub
                (patched in git main v1.15, unreleased). To fully suppress a
                test&apos;s traffic, disable the master{' '}
                <em>Enable graphql-cop</em> toggle above.
              </p>

              {/* Info-leak + CSRF checks (low-noise) */}
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    Field Suggestions (LOW — 정보 누설)
                  </span>
                  <p className={styles.toggleDescription}>
                    &quot;하려는 작업이 X인가요?&quot; 오류로 introspection
                    꺼더라도 스키마 필드 누설.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestFieldSuggestions ?? true}
                  onChange={(checked) =>
                    updateField(
                      'graphqlCopTestFieldSuggestions' as any,
                      checked,
                    )
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    Introspection (HIGH — 정보 누설)
                  </span>
                  <p className={styles.toggleDescription}>
                    기본 비활성 — 위의 네이티브 스칌너가 이미 테스트함. 중복
                    검증에 활성화.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestIntrospection ?? false}
                  onChange={(checked) =>
                    updateField('graphqlCopTestIntrospection' as any, checked)
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    GraphQL IDE / Playground (LOW)
                  </span>
                  <p className={styles.toggleDescription}>
                    노출된 GraphiQL/Playground UI 탐지.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestGraphiql ?? true}
                  onChange={(checked) =>
                    updateField('graphqlCopTestGraphiql' as any, checked)
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    GET 메서드 쿼리 지원 (MEDIUM — CSRF)
                  </span>
                  <p className={styles.toggleDescription}>
                    GET으로 허용되는 쿼리는 CSRF 공격 가능.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestGetMethod ?? true}
                  onChange={(checked) =>
                    updateField('graphqlCopTestGetMethod' as any, checked)
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    GET 기반 Mutation (MEDIUM — CSRF)
                  </span>
                  <p className={styles.toggleDescription}>
                    GET 요청으로 실행 가능한 mutation.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestGetMutation ?? true}
                  onChange={(checked) =>
                    updateField('graphqlCopTestGetMutation' as any, checked)
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    POST URL 인코딩 CSRF (MEDIUM)
                  </span>
                  <p className={styles.toggleDescription}>
                    GraphQL이 <code>application/x-www-form-urlencoded</code>{' '}
                    POST를 허용.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestPostCsrf ?? true}
                  onChange={(checked) =>
                    updateField('graphqlCopTestPostCsrf' as any, checked)
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    Trace 모드 (INFO — 정보 누설)
                  </span>
                  <p className={styles.toggleDescription}>
                    Apollo tracing 확장 노설.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestTraceMode ?? true}
                  onChange={(checked) =>
                    updateField('graphqlCopTestTraceMode' as any, checked)
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    처리되지 않은 오류 (INFO — 정보 누설)
                  </span>
                  <p className={styles.toggleDescription}>
                    클라이언트에 반환된 예외 스택 트레이스.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestUnhandledError ?? true}
                  onChange={(checked) =>
                    updateField('graphqlCopTestUnhandledError' as any, checked)
                  }
                />
              </div>

              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '11px',
                  color: '#f87171',
                }}
              >
                <strong>DoS probes below &mdash; noisy traffic.</strong>{' '}
                Toggling these off hides their findings but the packets still
                fly (see note above). Auto-disabled only in stealth mode.
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    Alias 과부하 (HIGH — DoS)
                  </span>
                  <p className={styles.toggleDescription}>
                    속도 제한 우회를 위해 한 쿼리에 101개 alias 전송.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestAliasOverloading ?? true}
                  onChange={(checked) =>
                    updateField(
                      'graphqlCopTestAliasOverloading' as any,
                      checked,
                    )
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    배열 기반 쿼리 배치 (HIGH — DoS)
                  </span>
                  <p className={styles.toggleDescription}>
                    한 POST에 10개 이상의 쿼리를 배치로 전송.
                  </p>
                </div>
                <Toggle
                  checked={(data as any).graphqlCopTestBatchQuery ?? true}
                  onChange={(checked) =>
                    updateField('graphqlCopTestBatchQuery' as any, checked)
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    디렉티브 과부하 (HIGH — DoS)
                  </span>
                  <p className={styles.toggleDescription}>
                    10개 이상의 반복 디렉티브를 전송하여 파싱 폄진.
                  </p>
                </div>
                <Toggle
                  checked={
                    (data as any).graphqlCopTestDirectiveOverloading ?? true
                  }
                  onChange={(checked) =>
                    updateField(
                      'graphqlCopTestDirectiveOverloading' as any,
                      checked,
                    )
                  }
                />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <span className={styles.toggleLabel}>
                    Introspection 기반 순환 쿼리 (HIGH — DoS)
                  </span>
                  <p className={styles.toggleDescription}>
                    깊은 중첩 introspection으로 재귀 DoS 유발.
                  </p>
                </div>
                <Toggle
                  checked={
                    (data as any).graphqlCopTestCircularIntrospection ?? true
                  }
                  onChange={(checked) =>
                    updateField(
                      'graphqlCopTestCircularIntrospection' as any,
                      checked,
                    )
                  }
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
