'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Drawer, ExternalLink } from '@/components/ui'
import { GraphNode } from '../../types'
import { getNodeColor, getNodeUrl } from '../../utils'
import { renderPropertyValue } from '../../utils/renderPropertyValue'
import { ClusterNodeList } from './ClusterNodeList'
import styles from './NodeDrawer.module.css'
import clusterStyles from './ClusterNodeList.module.css'

interface NodeDrawerProps {
  node: GraphNode | null
  isOpen: boolean
  onClose: () => void
  onDeleteNode?: (nodeId: string) => Promise<void>
  expandedChild?: GraphNode | null
  onExpandChild?: (child: GraphNode) => void
  onCollapseChild?: () => void
}

export function NodeDrawer({
  node,
  isOpen,
  onClose,
  onDeleteNode,
  expandedChild,
  onExpandChild,
  onCollapseChild,
}: NodeDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const isCluster = !!node?.isCluster
  const displayNode: GraphNode | null = isCluster ? (expandedChild ?? null) : node
  const showList = isCluster && !expandedChild

  const handleDeleteConfirm = async () => {
    if (!displayNode || !onDeleteNode) return
    setIsDeleting(true)
    try {
      await onDeleteNode(displayNode.id)
      setShowDeleteConfirm(false)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  const hiddenKeys = ['project_id', 'user_id']
  const sortedProperties = displayNode
    ? Object.entries(displayNode.properties || {})
        .filter(([key]) => !hiddenKeys.includes(key))
        .sort(([a], [b]) => {
          const bottomKeys = ['created_at', 'updated_at']
          const aIsBottom = bottomKeys.includes(a)
          const bIsBottom = bottomKeys.includes(b)
          if (aIsBottom && !bIsBottom) return 1
          if (!aIsBottom && bIsBottom) return -1
          if (aIsBottom && bIsBottom) return bottomKeys.indexOf(a) - bottomKeys.indexOf(b)
          return 0
        })
    : []

  const drawerTitle = node
    ? isCluster
      ? expandedChild
        ? `${expandedChild.type}: ${expandedChild.name}`
        : `클러스터: ${node.clusterChildType ?? ''}`
      : `${node.type}: ${node.name}`
    : undefined

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      mode="overlay"
      title={drawerTitle}
    >
      {node && showList && (
        <ClusterNodeList
          cluster={node}
          onSelectChild={(child) => onExpandChild?.(child)}
        />
      )}

      {displayNode && !showList && (
        <>
          {isCluster && onCollapseChild && (
            <button
              className={clusterStyles.backBtn}
              onClick={onCollapseChild}
            >
              <ArrowLeft size={14} />
              목록으로 돌아가기
            </button>
          )}

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitleBasicInfo}>기본 정보</h3>
              {displayNode.type !== 'Domain' && displayNode.type !== 'Subdomain' && onDeleteNode && (
                <button
                  className={styles.deleteButton}
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  title="노드 삭제"
                >
                  {isDeleting ? '...' : '\uD83D\uDDD1'}
                </button>
              )}
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyKey}>유형</span>
              <span
                className={styles.propertyBadge}
                style={{ backgroundColor: getNodeColor(displayNode) }}
              >
                {displayNode.type}
              </span>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyKey}>ID</span>
              <span className={styles.propertyValue}>{displayNode.id}</span>
            </div>
            <div className={styles.propertyRow}>
              <span className={styles.propertyKey}>이름</span>
              <span className={styles.propertyValue}>
                {(() => {
                  const url = getNodeUrl(displayNode)
                  return url
                    ? <ExternalLink href={url}>{displayNode.name}</ExternalLink>
                    : displayNode.name
                })()}
              </span>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitleProperties}>속성</h3>
            {sortedProperties.map(([key, value]) => {
              const nodeUrl = key === 'name' ? getNodeUrl(displayNode) : null
              return (
                <div key={key} className={styles.propertyRow}>
                  <span className={styles.propertyKey}>{key}</span>
                  <span className={styles.propertyValue}>
                    {nodeUrl
                      ? <ExternalLink href={nodeUrl}>{String(value)}</ExternalLink>
                      : renderPropertyValue(value)}
                  </span>
                </div>
              )
            })}
            {sortedProperties.length === 0 && (
              <p className={styles.emptyProperties}>추가 속성 없음</p>
            )}
          </div>

          {/* Delete confirmation modal */}
          {showDeleteConfirm && (
            <div className={styles.confirmOverlay} onClick={handleDeleteCancel}>
              <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmIcon}>
                  <AlertTriangle size={28} />
                </div>
                <h4 className={styles.confirmTitle}>노드 삭제</h4>
                <p className={styles.confirmText}>
                  <strong>{displayNode.type}: {displayNode.name}</strong>을(를) 삭제하면 해당 노드와 그래프상의 모든 관계가 영구적으로 제거됩니다.
                </p>
                <p className={styles.confirmWarning}>
                  이 작업은 그래프의 연결성을 깨뜨릴 수 있으며 에이전트가 공격 체인 컨텍스트를 해석하는 능력에 영향을 줄 수 있습니다.
                </p>
                <div className={styles.confirmActions}>
                  <button
                    className={styles.confirmCancelBtn}
                    onClick={handleDeleteCancel}
                  >
                    취소
                  </button>
                  <button
                    className={styles.confirmDeleteBtn}
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Drawer>
  )
}
