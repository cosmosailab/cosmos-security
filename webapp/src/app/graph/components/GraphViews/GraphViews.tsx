'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Loader2, Sparkles, RefreshCw, Save, ListFilter } from 'lucide-react';
import { GraphCanvas } from '../GraphCanvas';
import { useDimensions } from '../../hooks';
import { useGraphViews } from '../../hooks/useGraphViews';
import type { GraphData, GraphNode } from '../../types';
import styles from './GraphViews.module.css';

interface GraphViewsProps {
  projectId: string;
  userId: string;
  modelConfigured: boolean;
  is3D: boolean;
  showLabels: boolean;
  isDark: boolean;
  onFilterCreated?: () => void;
  onFilterCreatedAndSelect?: (filterId: string) => void;
}

const EXAMPLE_QUERIES: { label: string; items: string[] }[] = [
  {
    label: 'Infrastructure',
    items: [
      'All subdomains that resolve to at least 4 IPs',
      'Subdomains with open port 443 and their technologies',
      'All services running on non-standard ports (not 80 or 443)',
      'IPs with SSH (port 22) open and the services running on them',
      'Subdomains with CNAME DNS records and the IPs they resolve to',
    ],
  },
  {
    label: 'Vulnerabilities & CVEs',
    items: [
      'IPs with critical vulnerabilities and their open ports',
      'Technologies with known CVEs and the affected subdomains',
      'All critical and high severity vulnerabilities found by nuclei',
      'GVM vulnerabilities with CISA KEV flag and their target IPs',
      'CVEs with CVSS score above 9 and the technologies they affect',
    ],
  },
  {
    label: 'Web Application',
    items: [
      'All endpoints with injectable parameters',
      'BaseURLs with expired or invalid TLS certificates',
      'Secrets discovered in JavaScript files and their source URLs',
      'BaseURLs missing security headers like X-Frame-Options or CSP',
    ],
  },
  {
    label: 'Threat Intelligence',
    items: [
      'IPs or domains appearing in OTX threat pulses with named adversaries',
      'Malware samples associated with IPs and the related threat pulses',
      'External domains discovered during recon and how they were found',
    ],
  },
  {
    label: 'Attack Chains',
    items: [
      'Attack chains that reached exploitation phase',
      'Chain findings with critical severity and the steps that produced them',
      'GVM confirmed exploits (ExploitGvm) and their target IPs and CVEs',
    ],
  },
];

export function GraphViews({
  projectId,
  userId,
  modelConfigured,
  is3D,
  showLabels,
  isDark,
  onFilterCreated,
  onFilterCreatedAndSelect,
}: GraphViewsProps) {
  const { createView, generateCypher, executeCypher } =
    useGraphViews(projectId);

  const [nlQuery, setNlQuery] = useState('');
  const [viewName, setViewName] = useState('');
  const [generatedCypher, setGeneratedCypher] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<GraphData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(canvasRef);

  useEffect(() => {
    if (!examplesOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setExamplesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [examplesOpen]);

  const handleGenerate = useCallback(async () => {
    if (!nlQuery.trim()) return;
    setGenerating(true);
    setPreviewError(null);
    setGeneratedCypher(null);
    setPreviewData(null);

    const result = await generateCypher(nlQuery.trim(), userId);

    if ('error' in result) {
      setPreviewError(result.error);
      setGenerating(false);
      return;
    }

    setGeneratedCypher(result.cypher);
    setViewName(nlQuery.trim().slice(0, 60));

    // Execute the generated cypher for preview
    setPreviewLoading(true);
    const execResult = await executeCypher(result.cypher);
    setGenerating(false);
    setPreviewLoading(false);

    if ('error' in execResult) {
      setPreviewError(execResult.error);
      setPreviewData(null);
    } else {
      setPreviewData({
        nodes: execResult.nodes || [],
        links: execResult.links || [],
        projectId,
      });
    }
  }, [nlQuery, userId, projectId, generateCypher, executeCypher]);

  const handleRegenerate = useCallback(async () => {
    setGeneratedCypher(null);
    setPreviewData(null);
    setPreviewError(null);
    await handleGenerate();
  }, [handleGenerate]);

  const handleSave = useCallback(async () => {
    if (!generatedCypher || !viewName.trim()) return;
    setSaving(true);
    const result = await createView(
      viewName.trim(),
      nlQuery.trim(),
      generatedCypher,
    );
    setSaving(false);
    if (result) {
      setNlQuery('');
      setViewName('');
      setGeneratedCypher(null);
      setPreviewData(null);
      setPreviewError(null);
      setSelectedNode(null);
      onFilterCreated?.();
    }
  }, [generatedCypher, viewName, nlQuery, createView, onFilterCreated]);

  const handleSaveAndSelect = useCallback(async () => {
    if (!generatedCypher || !viewName.trim()) return;
    setSaving(true);
    const result = await createView(
      viewName.trim(),
      nlQuery.trim(),
      generatedCypher,
    );
    setSaving(false);
    if (result) {
      setNlQuery('');
      setViewName('');
      setGeneratedCypher(null);
      setPreviewData(null);
      setPreviewError(null);
      setSelectedNode(null);
      onFilterCreatedAndSelect?.(result.id);
    }
  }, [
    generatedCypher,
    viewName,
    nlQuery,
    createView,
    onFilterCreatedAndSelect,
  ]);

  const handleDiscard = useCallback(() => {
    setNlQuery('');
    setViewName('');
    setGeneratedCypher(null);
    setPreviewData(null);
    setPreviewError(null);
    setSelectedNode(null);
  }, []);

  const handleExampleClick = useCallback((example: string) => {
    setNlQuery(example);
    setExamplesOpen(false);
  }, []);

  const nodeCount = useMemo(
    () => previewData?.nodes.length ?? 0,
    [previewData],
  );

  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        {/* Left panel - form controls */}
        <div className={styles.leftPanel}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h2 className={styles.title}>Surface Shaper</h2>
              <span className={styles.subtitle}>
                자연어로 공격 표면을 조형하여 그래프 맵, 데이터 테이블, AI
                에이전트 범위를 설정스니다
              </span>
            </div>
          </div>

          {!modelConfigured && (
            <div className={styles.noLlmBanner}>
              <Sparkles size={14} />
              <span>
                프로젝트 설정에서 AI 모델을 설정하여 자연어로 공격 표면을
                조형하세요.
              </span>
            </div>
          )}

          <div className={styles.createForm}>
            <div className={styles.labelRow}>
              <label className={styles.label}>
                조형할 공격 표면을 설명하세요
              </label>
              <div className={styles.examplesDropdown} ref={dropdownRef}>
                <button
                  className={styles.examplesToggle}
                  onClick={() => setExamplesOpen((o) => !o)}
                  title="예시 쿼리"
                  disabled={generating}
                >
                  <ListFilter size={13} />
                </button>
                {examplesOpen && (
                  <div className={styles.examplesMenu}>
                    {EXAMPLE_QUERIES.map((group, gi) => (
                      <div key={gi} className={styles.examplesGroup}>
                        <span className={styles.examplesGroupLabel}>
                          {group.label}
                        </span>
                        {group.items.map((item, ii) => (
                          <button
                            key={ii}
                            className={styles.examplesItem}
                            onClick={() => handleExampleClick(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <textarea
              className={styles.textarea}
              placeholder="예) 중요 취약점이 있는 모든 IP와 열린 포트"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              rows={3}
              disabled={generating || !modelConfigured}
            />

            <div className={styles.generateRow}>
              <button
                className={styles.generateBtn}
                onClick={handleGenerate}
                disabled={!nlQuery.trim() || generating || !modelConfigured}
              >
                {generating ? (
                  <>
                    <Loader2 size={14} className={styles.spin} />
                    <span>생성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Cypher 생성</span>
                  </>
                )}
              </button>
            </div>

            {previewError && (
              <div className={styles.errorBanner}>
                <span>{previewError}</span>
                <button className={styles.retryBtn} onClick={handleRegenerate}>
                  <RefreshCw size={12} />
                  재시도
                </button>
              </div>
            )}

            {generatedCypher && (
              <>
                <div className={styles.cypherBlock}>
                  <div className={styles.cypherHeader}>
                    <label className={styles.label}>생성된 Cypher</label>
                    <button
                      className={styles.retryBtn}
                      onClick={handleRegenerate}
                    >
                      <RefreshCw size={12} />
                      재생성
                    </button>
                  </div>
                  <pre className={styles.cypherCode}>{generatedCypher}</pre>
                </div>

                <div className={styles.saveRow}>
                  <input
                    className={styles.nameInput}
                    placeholder="표면 이름"
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                  />
                  <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={!viewName.trim() || saving}
                  >
                    {saving ? (
                      <Loader2 size={14} className={styles.spin} />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>{saving ? '저장 중...' : '저장'}</span>
                  </button>
                  <button
                    className={styles.saveSelectBtn}
                    onClick={handleSaveAndSelect}
                    disabled={!viewName.trim() || saving}
                  >
                    {saving ? (
                      <Loader2 size={14} className={styles.spin} />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>{saving ? '저장 중...' : '저장 후 선택'}</span>
                  </button>
                  <button className={styles.discardBtn} onClick={handleDiscard}>
                    취소
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right panel - graph preview */}
        <div className={styles.rightPanel}>
          <div className={styles.previewHeader}>
            <span className={styles.label}>
              미리보기 {nodeCount > 0 && `(${nodeCount}개 노드)`}
            </span>
          </div>
          <div ref={canvasRef} className={styles.previewCanvas}>
            <GraphCanvas
              data={previewData ?? undefined}
              isLoading={previewLoading}
              error={previewError ? new Error(previewError) : null}
              projectId={projectId}
              is3D={is3D}
              width={dimensions.width}
              height={dimensions.height}
              showLabels={showLabels}
              selectedNode={selectedNode}
              onNodeClick={setSelectedNode}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
