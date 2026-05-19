'use client';

import { useState } from 'react';
import { ChevronDown, Globe, Play } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { TimeEstimate } from '../TimeEstimate';
import { FileImportButton } from '../FileImportButton';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface HttpxSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onRun?: () => void;
}

export function HttpxSection({ data, updateField, onRun }: HttpxSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Globe size={16} />
          httpx HTTP 프로빙
          <NodeInfoTooltip section="Httpx" />
          <WikiInfoButton target="Httpx" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <div className={styles.sectionHeaderRight}>
          {onRun && data.httpxEnabled && (
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
              title="httpx HTTP 프로빙 실행"
            >
              <Play size={10} /> 부분 정찰 실행
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              checked={data.httpxEnabled}
              onChange={(checked) => updateField('httpxEnabled', checked)}
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
            httpx를 사용한 HTTP 프로빙 및 지문 감지. 실질 웹 서비스를 검증하고
            서버 헤더, 기술 스택, TLS 인증서 등 메타데이터를 추출합니다.
            Wappalyzer를 통해 종합적인 기술 탐지를 지원합니다.
          </p>
          {data.httpxEnabled && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Threads</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.httpxThreads}
                    onChange={(e) =>
                      updateField(
                        'httpxThreads',
                        parseInt(e.target.value) || 50,
                      )
                    }
                    min={1}
                    max={200}
                  />
                  <span className={styles.fieldHint}>
                    동시 HTTP 프로빙 스레드
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>타임아웃 (초)</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.httpxTimeout}
                    onChange={(e) =>
                      updateField(
                        'httpxTimeout',
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>URL당 요청 타임아웃</span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>요청 제한</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.httpxRateLimit}
                    onChange={(e) =>
                      updateField(
                        'httpxRateLimit',
                        parseInt(e.target.value) || 50,
                      )
                    }
                    min={1}
                  />
                  <span className={styles.fieldHint}>
                    요청/초. 낙게 (10-50) 설정하면 WAF 탐지 회피
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>재시도</label>
                  <input
                    type="number"
                    className="textInput"
                    value={data.httpxRetries}
                    onChange={(e) =>
                      updateField('httpxRetries', parseInt(e.target.value) || 2)
                    }
                    min={0}
                    max={10}
                  />
                  <span className={styles.fieldHint}>
                    실패한 요청 재시도 횟수
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>리다이렉트</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      리다이렉트 따르기
                    </span>
                    <p className={styles.toggleDescription}>
                      301/302/307 리다이렉트를 에당 목적지까지 쭬습니다
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxFollowRedirects}
                    onChange={(checked) =>
                      updateField('httpxFollowRedirects', checked)
                    }
                  />
                </div>
                {data.httpxFollowRedirects && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>최대 리다이렉트</label>
                    <input
                      type="number"
                      className="textInput"
                      value={data.httpxMaxRedirects}
                      onChange={(e) =>
                        updateField(
                          'httpxMaxRedirects',
                          parseInt(e.target.value) || 10,
                        )
                      }
                      min={1}
                      max={50}
                    />
                    <span className={styles.fieldHint}>
                      루프 방지를 위한 최대 리다이렉트 깊이
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>응답 프로브 옵션</h3>
                <p
                  className={styles.fieldHint}
                  style={{ marginBottom: '0.5rem' }}
                >
                  HTTP 응답에서 데이터 추출
                </p>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>상태 코드</span>
                    <p className={styles.toggleDescription}>
                      HTTP 상태 (200, 404, 500 등)
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeStatusCode}
                    onChange={(checked) =>
                      updateField('httpxProbeStatusCode', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>콘텐츠 길이</span>
                    <p className={styles.toggleDescription}>
                      응답 본문 크기 (bytes)
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeContentLength}
                    onChange={(checked) =>
                      updateField('httpxProbeContentLength', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>콘텐츠 타입</span>
                    <p className={styles.toggleDescription}>
                      MIME 타입 (text/html, application/json 등)
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeContentType}
                    onChange={(checked) =>
                      updateField('httpxProbeContentType', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>페이지 제목</span>
                    <p className={styles.toggleDescription}>
                      HTML title 태그 콘텐츠
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeTitle}
                    onChange={(checked) =>
                      updateField('httpxProbeTitle', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>서버 헤더</span>
                    <p className={styles.toggleDescription}>
                      웹 서버 소프트웨어 (nginx, Apache, IIS 등)
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeServer}
                    onChange={(checked) =>
                      updateField('httpxProbeServer', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>응답 시간</span>
                    <p className={styles.toggleDescription}>
                      서버 응답 지연 (밀리초)
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeResponseTime}
                    onChange={(checked) =>
                      updateField('httpxProbeResponseTime', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>단어 수</span>
                    <p className={styles.toggleDescription}>
                      응답 본문의 단어 수
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeWordCount}
                    onChange={(checked) =>
                      updateField('httpxProbeWordCount', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>줄 수</span>
                    <p className={styles.toggleDescription}>
                      응답 본문의 줄 수
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeLineCount}
                    onChange={(checked) =>
                      updateField('httpxProbeLineCount', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>기술 스택 탐지</span>
                    <p className={styles.toggleDescription}>
                      프레임워크, CMS, 라이브러리 탐지 (Wappalyzer 기반)
                    </p>
                    <TimeEstimate estimate="+10-30% probing time" />
                  </div>
                  <Toggle
                    checked={data.httpxProbeTechDetect}
                    onChange={(checked) =>
                      updateField('httpxProbeTechDetect', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>네트워크 정보</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>IP 주소</span>
                    <p className={styles.toggleDescription}>
                      IPv4/IPv6 풀리 주소
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeIp}
                    onChange={(checked) => updateField('httpxProbeIp', checked)}
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>CNAME 레코드</span>
                    <p className={styles.toggleDescription}>
                      DNS 정식 이름 별칭 (CDN/호스팅 노캜)
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeCname}
                    onChange={(checked) =>
                      updateField('httpxProbeCname', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>ASN 정보</span>
                    <p className={styles.toggleDescription}>
                      자율 시스템 번호 및 네트워크 소유자
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeAsn}
                    onChange={(checked) =>
                      updateField('httpxProbeAsn', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>CDN 탐지</span>
                    <p className={styles.toggleDescription}>
                      CDN 프로바이더 확인 (Cloudflare, Akamai, AWS CloudFront)
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeCdn}
                    onChange={(checked) =>
                      updateField('httpxProbeCdn', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>TLS/SSL 정보</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>TLS 정보</span>
                    <p className={styles.toggleDescription}>
                      인증서 발급자, 만료일, 암호 스위트 세부정보
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeTlsInfo}
                    onChange={(checked) =>
                      updateField('httpxProbeTlsInfo', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      TLS 인증서 가져오기
                    </span>
                    <p className={styles.toggleDescription}>
                      SAN 및 체인을 포함한 전체 인증서 데이터 추출
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeTlsGrab}
                    onChange={(checked) =>
                      updateField('httpxProbeTlsGrab', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>지문 식별</h3>
                <p
                  className={styles.fieldHint}
                  style={{ marginBottom: '0.5rem' }}
                >
                  유사한 서버/서비스 매칭을 위한 고유 식별자
                </p>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>파비콘 해시</span>
                    <p className={styles.toggleDescription}>
                      Shodan/Censys 연관을 위한 MMH3 해시
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxProbeFavicon}
                    onChange={(checked) =>
                      updateField('httpxProbeFavicon', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>JARM 지문작</span>
                    <p className={styles.toggleDescription}>
                      C2/말웨어 탐지를 위한 TLS 서버 지문작
                    </p>
                    <TimeEstimate estimate="+10-50 ms per URL (adds up with many hosts)" />
                  </div>
                  <Toggle
                    checked={data.httpxProbeJarm}
                    onChange={(checked) =>
                      updateField('httpxProbeJarm', checked)
                    }
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    응답 해시 알고리즘
                  </label>
                  <select
                    className="select"
                    value={data.httpxProbeHash}
                    onChange={(e) =>
                      updateField('httpxProbeHash', e.target.value)
                    }
                  >
                    <option value="sha256">SHA-256</option>
                    <option value="md5">MD5</option>
                    <option value="sha1">SHA-1</option>
                    <option value="sha512">SHA-512</option>
                  </select>
                  <span className={styles.fieldHint}>
                    응답 본문 지문작을 위한 해시 알고리즘
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>응답 데이터</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>응답 본문 포함</span>
                    <p className={styles.toggleDescription}>
                      전체 HTML/JSON 본문 저장. Wappalyzer에 필요. 출력 크기
                      증가
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxIncludeResponse}
                    onChange={(checked) =>
                      updateField('httpxIncludeResponse', checked)
                    }
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>응답 헤더 포함</span>
                    <p className={styles.toggleDescription}>
                      보안 헤더 분석을 위한 모든 헤더 저장
                    </p>
                  </div>
                  <Toggle
                    checked={data.httpxIncludeResponseHeaders}
                    onChange={(checked) =>
                      updateField('httpxIncludeResponseHeaders', checked)
                    }
                  />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>커스텀 경로 & 헤더</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>추가 프로빙 경로</label>
                  <div className={styles.fileImportWrap}>
                    <textarea
                      className="textarea"
                      value={(data.httpxPaths ?? []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'httpxPaths',
                          e.target.value.split('\n').filter(Boolean),
                        )
                      }
                      placeholder="/robots.txt&#10;/.well-known/security.txt&#10;/sitemap.xml"
                      rows={3}
                    />
                    <FileImportButton
                      variant="textarea"
                      fieldName="paths"
                      onImport={(values) => updateField('httpxPaths', values)}
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    각 호스트에서 이 경로를 캐루주었제 (루트 외 추가)
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>커스텀 헤더</label>
                  <div className={styles.fileImportWrap}>
                    <textarea
                      className="textarea"
                      value={(data.httpxCustomHeaders ?? []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'httpxCustomHeaders',
                          e.target.value.split('\n').filter(Boolean),
                        )
                      }
                      placeholder="User-Agent: CustomAgent/1.0&#10;Authorization: Bearer token"
                      rows={3}
                    />
                    <FileImportButton
                      variant="textarea"
                      fieldName="headers"
                      onImport={(values) =>
                        updateField('httpxCustomHeaders', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    브라우저와 유사한 헤더로 WAF/봇 탐지 회피
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>상태 코드 필터</h3>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>매칭 상태 코드</label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.httpxMatchCodes ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'httpxMatchCodes',
                          e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="200, 301, 302 (empty = all)"
                    />
                    <FileImportButton
                      fieldName="status codes"
                      validator={(t) => /^\d+$/.test(t)}
                      onImport={(values) =>
                        updateField('httpxMatchCodes', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    화이트리스트: 이 코드를 반환하는 호스트만 포함
                  </span>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>제외 상태 코드</label>
                  <div className={styles.fileImportWrap}>
                    <input
                      type="text"
                      className="textInput"
                      value={(data.httpxFilterCodes ?? []).join(', ')}
                      onChange={(e) =>
                        updateField(
                          'httpxFilterCodes',
                          e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="404, 503"
                    />
                    <FileImportButton
                      fieldName="status codes"
                      validator={(t) => /^\d+$/.test(t)}
                      onImport={(values) =>
                        updateField('httpxFilterCodes', values)
                      }
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    블랙리스트: 이 코드를 반환하는 호스트 제외
                  </span>
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>Wappalyzer 기술 탐지</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>
                      Wappalyzer 활성화
                    </span>
                    <p className={styles.toggleDescription}>
                      HTML에서 CMS 플러그인, 분석 도구, 보안 도구, 프레임워크
                      탐지
                    </p>
                    <TimeEstimate estimate="+30-50% probing time" />
                  </div>
                  <Toggle
                    checked={data.wappalyzerEnabled}
                    onChange={(checked) =>
                      updateField('wappalyzerEnabled', checked)
                    }
                  />
                </div>
                {data.wappalyzerEnabled && (
                  <>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          최소 신뢰도 (%)
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={data.wappalyzerMinConfidence}
                          onChange={(e) =>
                            updateField(
                              'wappalyzerMinConfidence',
                              parseInt(e.target.value) || 50,
                            )
                          }
                          min={0}
                          max={100}
                        />
                        <span className={styles.fieldHint}>
                          낙을수록 탐지 많지만 오탐 증가
                        </span>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          캐시 TTL (시간)
                        </label>
                        <input
                          type="number"
                          className="textInput"
                          value={data.wappalyzerCacheTtlHours}
                          onChange={(e) =>
                            updateField(
                              'wappalyzerCacheTtlHours',
                              parseInt(e.target.value) || 24,
                            )
                          }
                          min={1}
                        />
                        <span className={styles.fieldHint}>
                          기술 DB 캐시 유지 시간 (0 = 항상 최신)
                        </span>
                      </div>
                    </div>
                    <div className={styles.toggleRow}>
                      <div>
                        <span className={styles.toggleLabel}>
                          HTML 본문 필수
                        </span>
                        <p className={styles.toggleDescription}>
                          HTML이 아닌 응답 스킵. 정확도 향상에 권장
                        </p>
                      </div>
                      <Toggle
                        checked={data.wappalyzerRequireHtml}
                        onChange={(checked) =>
                          updateField('wappalyzerRequireHtml', checked)
                        }
                      />
                    </div>
                    <div className={styles.toggleRow}>
                      <div>
                        <span className={styles.toggleLabel}>
                          DB 자동 업데이트
                        </span>
                        <p className={styles.toggleDescription}>
                          npm에서 최신 기술 시그니처 다운로드 (권장)
                        </p>
                      </div>
                      <Toggle
                        checked={data.wappalyzerAutoUpdate}
                        onChange={(checked) =>
                          updateField('wappalyzerAutoUpdate', checked)
                        }
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>NPM 버전</label>
                      <input
                        type="text"
                        className="textInput"
                        value={data.wappalyzerNpmVersion}
                        disabled
                      />
                      <span className={styles.fieldHint}>
                        기술 DB를 위한 Wappalyzer 패키지 버전
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subSectionTitle}>배너 수집</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <span className={styles.toggleLabel}>배너 수집 활성화</span>
                    <p className={styles.toggleDescription}>
                      HTTP가 아닌 포트의 서비스 버전 탐지 (SSH, FTP, MySQL,
                      SMTP)
                    </p>
                  </div>
                  <Toggle
                    checked={data.bannerGrabEnabled}
                    onChange={(checked) =>
                      updateField('bannerGrabEnabled', checked)
                    }
                  />
                </div>
                {data.bannerGrabEnabled && (
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>타임아웃 (초)</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.bannerGrabTimeout}
                        onChange={(e) =>
                          updateField(
                            'bannerGrabTimeout',
                            parseInt(e.target.value) || 5,
                          )
                        }
                        min={1}
                      />
                      <span className={styles.fieldHint}>
                        포트당 연결 타임아웃
                      </span>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>스레드</label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.bannerGrabThreads}
                        onChange={(e) =>
                          updateField(
                            'bannerGrabThreads',
                            parseInt(e.target.value) || 20,
                          )
                        }
                        min={1}
                      />
                      <span className={styles.fieldHint}>
                        동시 배너 수집 스레드
                      </span>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        최대 배너 길이
                      </label>
                      <input
                        type="number"
                        className="textInput"
                        value={data.bannerGrabMaxLength}
                        onChange={(e) =>
                          updateField(
                            'bannerGrabMaxLength',
                            parseInt(e.target.value) || 1000,
                          )
                        }
                        min={100}
                        max={5000}
                      />
                      <span className={styles.fieldHint}>
                        이 길이 초과 배너 잘라내기 (문자)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Docker 이미지</label>
                <input
                  type="text"
                  className="textInput"
                  value={data.httpxDockerImage}
                  disabled
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
