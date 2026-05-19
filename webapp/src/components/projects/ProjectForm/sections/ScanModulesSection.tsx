'use client';

import { useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import { Toggle, WikiInfoButton } from '@/components/ui';
import type { Project } from '@prisma/client';
import styles from '../ProjectForm.module.css';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface ScanModulesSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const SCAN_MODULE_OPTIONS = [
  {
    id: 'domain_discovery',
    label: '도메인 탐색 & OSINT',
    description: '서브도메인 열거, Shodan, URLScan',
    indent: 0,
  },
  {
    id: 'port_scan',
    label: '포트 스캔',
    description: 'Naabu + Masscan 포트 스캔너',
    indent: 1,
  },
  {
    id: 'http_probe',
    label: 'HTTP 프로빙',
    description: 'httpx HTTP 분석',
    indent: 2,
  },
  {
    id: 'resource_enum',
    label: '리소스 열거',
    description: 'Katana, GAU, Kiterunner',
    indent: 3,
  },
  {
    id: 'vuln_scan',
    label: '취약점 스캔',
    description: 'Nuclei 취약점 스캔너',
    indent: 3,
  },
];

// Module dependency tree: child → parent
const MODULE_DEPENDENCIES: Record<string, string | null> = {
  domain_discovery: null,
  port_scan: 'domain_discovery',
  http_probe: 'port_scan',
  resource_enum: 'http_probe',
  vuln_scan: 'http_probe',
};

// Get all modules that depend on a given module (direct + transitive)
function getDependentModules(moduleId: string): string[] {
  const dependents: string[] = [];
  for (const [id, parent] of Object.entries(MODULE_DEPENDENCIES)) {
    if (parent === moduleId) {
      dependents.push(id, ...getDependentModules(id));
    }
  }
  return dependents;
}

// Check if a module's parent chain is all enabled
function isParentEnabled(moduleId: string, enabledModules: string[]): boolean {
  const parent = MODULE_DEPENDENCIES[moduleId];
  if (parent === null) return true;
  if (!enabledModules.includes(parent)) return false;
  return isParentEnabled(parent, enabledModules);
}

export function ScanModulesSection({
  data,
  updateField,
}: ScanModulesSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleModule = (moduleId: string) => {
    const current = data.scanModules;
    if (current.includes(moduleId)) {
      // Disabling: also disable all dependent modules
      const dependents = getDependentModules(moduleId);
      const toRemove = new Set([moduleId, ...dependents]);
      updateField(
        'scanModules',
        current.filter((m) => !toRemove.has(m)),
      );
    } else {
      // Enabling: also enable all parent modules in the chain
      const toAdd = [moduleId];
      let parent = MODULE_DEPENDENCIES[moduleId];
      while (parent !== null) {
        if (!current.includes(parent)) {
          toAdd.push(parent);
        }
        parent = MODULE_DEPENDENCIES[parent];
      }
      updateField('scanModules', [...current, ...toAdd]);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.sectionTitle}>
          <Layers size={16} />
          스캔 모듈
          <WikiInfoButton target="ScanModules" />
        </h2>
        <ChevronDown
          size={16}
          className={`${styles.sectionIcon} ${isOpen ? styles.sectionIconOpen : ''}`}
        />
      </div>

      {isOpen && (
        <div className={styles.sectionContent}>
          <p className={styles.sectionDescription}>
            특정 모듈을 활성화 또는 비활성화하여 정찰 파이프라인을 제어합니다.
            각 모듈은 상위 모듈 결과를 기반으로 동작하며, 도메인 탐색부터 취약점
            감지까지 종합적인 공격 표면 지도를 생성합니다.
          </p>
          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>활성화된 모듈</h3>
            <p className={styles.fieldHint} style={{ marginBottom: '0.75rem' }}>
              모듈은 의존성이 있습니다: 상위 모듈을 비활성화하면 하위 모듈도
              비활성화됩니다
            </p>
            {SCAN_MODULE_OPTIONS.map((module) => {
              const isEnabled = data.scanModules.includes(module.id);
              const parentEnabled = isParentEnabled(
                module.id,
                data.scanModules,
              );
              const isDisabledByParent = !parentEnabled && !isEnabled;

              return (
                <div
                  key={module.id}
                  className={styles.toggleRow}
                  style={{
                    paddingLeft: `${module.indent * 1.25}rem`,
                    opacity: isDisabledByParent ? 0.5 : 1,
                  }}
                >
                  <div>
                    <span className={styles.toggleLabel}>
                      {module.indent > 0 && '└ '}
                      {module.label}
                    </span>
                    <p className={styles.toggleDescription}>
                      {module.description}
                      {isDisabledByParent && ' (상위 모듈 필요)'}
                    </p>
                  </div>
                  <Toggle
                    checked={isEnabled}
                    onChange={() => toggleModule(module.id)}
                  />
                </div>
              );
            })}
          </div>

          <div className={styles.subSection}>
            <h3 className={styles.subSectionTitle}>일반 옵션</h3>
            <div className={styles.toggleRow} style={{ opacity: 0.7 }}>
              <div>
                <span className={styles.toggleLabel}>그래프 DB 업데이트</span>
                <p className={styles.toggleDescription}>
                  스캔 결과를 Neo4j 그래프 DB에 저장 (항상 활성화)
                </p>
              </div>
              <Toggle checked={true} onChange={() => {}} disabled />
            </div>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabel}>Tor 라우팅 사용</span>
                <p className={styles.toggleDescription}>
                  Tor 네트워크를 통해 정찰 트래픽 라우팅
                </p>
              </div>
              <Toggle
                checked={data.useTorForRecon}
                onChange={(checked) => updateField('useTorForRecon', checked)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
