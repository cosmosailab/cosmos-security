'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { formatContextLength } from './modelUtils';
import type { ModelOption } from './modelUtils';
import { formatModelDisplay } from './phaseConfig';
import styles from './AIAssistantDrawer.module.css';

interface ModelPickerModalProps {
  showModelModal: boolean;
  setShowModelModal: (v: boolean) => void;
  modelSearch: string;
  setModelSearch: (v: string) => void;
  modelSearchRef: React.RefObject<HTMLInputElement | null>;
  modelsLoading: boolean;
  modelsError: boolean;
  filteredModels: Record<string, ModelOption[]>;
  modelName?: string;
  onModelChange?: (modelId: string) => void;
  handleSelectModel: (id: string) => void;
}

export function ModelPickerModal({
  showModelModal,
  setShowModelModal,
  modelSearch,
  setModelSearch,
  modelSearchRef,
  modelsLoading,
  modelsError,
  filteredModels,
  modelName,
  onModelChange,
  handleSelectModel,
}: ModelPickerModalProps) {
  if (!showModelModal) return null;

  return (
    <div
      className={styles.settingsModalOverlay}
      onClick={() => setShowModelModal(false)}
    >
      <div
        className={`${styles.settingsModal} ${styles.modelModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.settingsModalHeader}>
          <h2 className={styles.settingsModalTitle}>모델 변경</h2>
          <button
            className={styles.settingsModalClose}
            onClick={() => setShowModelModal(false)}
          >
            <X size={16} />
          </button>
        </div>
        <div className={styles.modelModalBody}>
          <input
            ref={modelSearchRef}
            className={styles.modelModalSearch}
            type="text"
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            placeholder="모델 검색..."
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowModelModal(false);
            }}
          />
          <div className={styles.modelList}>
            {modelsLoading ? (
              <div className={styles.modelListEmpty}>
                <Loader2 size={16} className={styles.spinner} />
                <span>모델 로딩 중...</span>
              </div>
            ) : modelsError ? (
              <div className={styles.modelListEmpty}>
                <span>
                  모델을 불러올 수 없습니다. 모델 ID를 직접 입력하세요:
                </span>
                <input
                  className={styles.modelModalManualInput}
                  type="text"
                  value={modelName || ''}
                  onChange={(e) => onModelChange?.(e.target.value)}
                  placeholder="예: claude-opus-4-6, gpt-5.2, openrouter/meta-llama/llama-4-maverick"
                />
              </div>
            ) : Object.keys(filteredModels).length === 0 ? (
              <div className={styles.modelListEmpty}>
                {modelSearch
                  ? `"${modelSearch}"와 일치하는 모델이 없습니다`
                  : '구성된 제공자가 없습니다'}
              </div>
            ) : (
              Object.entries(filteredModels).map(([provider, models]) => (
                <div key={provider} className={styles.modelListGroup}>
                  <div className={styles.modelListGroupHeader}>{provider}</div>
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className={`${styles.modelListOption} ${model.id === modelName ? styles.modelListOptionSelected : ''}`}
                      onClick={() => handleSelectModel(model.id)}
                    >
                      <div className={styles.modelListOptionMain}>
                        <span className={styles.modelListOptionName}>
                          {model.name}
                        </span>
                        {model.context_length && (
                          <span className={styles.modelListOptionCtx}>
                            {formatContextLength(model.context_length)}
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <span className={styles.modelListOptionDesc}>
                          {model.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
