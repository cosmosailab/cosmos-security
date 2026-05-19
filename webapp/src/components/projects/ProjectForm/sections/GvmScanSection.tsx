'use client';

import { useState } from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';
import { NodeInfoTooltip } from '../NodeInfoTooltip';
import { TimeEstimate } from '../TimeEstimate';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface GvmScanSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function GvmScanSection({ data, updateField }: GvmScanSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Shield size={16} />
          GVM Vulnerability Scan
          <NodeInfoTooltip section="GvmScan" />
          <WikiInfoButton target="GvmScan" />
          <span className={styles.badgeActive}>활성</span>
        </h2>
        <ChevronDown
          size={16}
          className={`${styles.sectionIcon} ${isOpen ? styles.sectionIconOpen : ''}`}
        />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <p className={styles.sectionDescription}>
            Configure GVM/OpenVAS network-level vulnerability scanning. These
            settings control scan depth, target strategy, and timeouts for the
            Greenbone vulnerability scanner.
          </p>

          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>Scan Configuration</h3>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>스캔 프로파일</label>
                <select
                  className="select"
                  value={data.gvmScanConfig}
                  onChange={(e) => updateField('gvmScanConfig', e.target.value)}
                >
                  <option value="Full and fast">
                    Full and fast — 종합적, 고성능 (권장)
                  </option>
                  <option value="Full and fast ultimate">
                    Full and fast ultimate — 가장 승물이, 느림
                  </option>
                  <option value="Full and very deep">
                    Full and very deep — 심층 스캔, 매우 느림
                  </option>
                  <option value="Full and very deep ultimate">
                    Full and very deep ultimate — 최대 커버리지, 매우 느림
                  </option>
                  <option value="Discovery">
                    Discovery — 네트워크 디스커버리만, 취약점 테스트 없음
                  </option>
                  <option value="Host Discovery">
                    Host Discovery — 기본 호스트 열거
                  </option>
                  <option value="System Discovery">
                    System Discovery — 시스템 열거
                  </option>
                </select>
                <span className={styles.fieldHint}>
                  GVM scan configuration preset. &ldquo;Full and fast&rdquo; is
                  recommended for most targets.
                </span>
                <TimeEstimate estimate="Discovery: ~5-10 min | Full and fast: ~30-60 min | Deep: hours" />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>스캔 대상 전략</label>
                <select
                  className="select"
                  value={data.gvmScanTargets}
                  onChange={(e) =>
                    updateField('gvmScanTargets', e.target.value)
                  }
                >
                  <option value="both">Both — IP와 호스트명을 각각 스캔</option>
                  <option value="ips_only">IPs Only — IP 주소만 스캔</option>
                  <option value="hostnames_only">
                    Hostnames Only — 호스트명/서브도메인만 스캔
                  </option>
                </select>
                <span className={styles.fieldHint}>
                  Which targets from recon data to scan. &ldquo;Both&rdquo;
                  provides the most thorough coverage.
                </span>
                <TimeEstimate estimate="&ldquo;Both&rdquo; doubles the number of targets vs single strategy" />
              </div>
            </div>
          </div>

          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>Timeouts & Polling</h3>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Task Timeout (seconds)
                </label>
                <input
                  type="number"
                  className="textInput"
                  value={data.gvmTaskTimeout}
                  onChange={(e) =>
                    updateField('gvmTaskTimeout', parseInt(e.target.value) || 0)
                  }
                  min={0}
                />
                <span className={styles.fieldHint}>
                  Maximum time to wait for a single scan task. 0 = unlimited.
                  Default: 14400 (4 hours).
                </span>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Poll Interval (seconds)
                </label>
                <input
                  type="number"
                  className="textInput"
                  value={data.gvmPollInterval}
                  onChange={(e) =>
                    updateField(
                      'gvmPollInterval',
                      parseInt(e.target.value) || 5,
                    )
                  }
                  min={5}
                  max={300}
                />
                <span className={styles.fieldHint}>
                  Seconds between scan status checks. Lower values give faster
                  log updates.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>Post-Scan</h3>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>Cleanup After Scan</span>
                <p className={styles.toggleDescription}>
                  Remove scan targets and tasks from GVM&apos;s internal
                  database after results are extracted. Keeps the GVM instance
                  clean across multiple scans. Results are always saved to JSON
                  and Neo4j regardless of this setting.
                </p>
              </div>
              <Toggle
                checked={data.gvmCleanupAfterScan}
                onChange={(checked) =>
                  updateField('gvmCleanupAfterScan', checked)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
