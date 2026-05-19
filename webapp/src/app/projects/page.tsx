'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderOpen, Users, RefreshCw, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useProjects, useDeleteProject } from '@/hooks/useProjects'
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUsers'
import { useProject } from '@/providers/ProjectProvider'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useAlertModal, useToast, WikiInfoButton } from '@/components/ui'
import { ImportModal } from './ImportModal'
import styles from './page.module.css'

export default function ProjectsPage() {
  const router = useRouter()
  const { userId, setUserId, setCurrentProject } = useProject()
  const { alertError, dangerConfirm } = useAlertModal()
  const toast = useToast()
  const [showUserModal, setShowUserModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')

  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: projects, isLoading: projectsLoading, refetch } = useProjects(userId || undefined)
  const deleteProjectMutation = useDeleteProject()
  const createUserMutation = useCreateUser()
  const deleteUserMutation = useDeleteUser()
  const hasAutoSelected = useRef(false)

  // Clear stale userId if deleted, or auto-select first user on initial load
  useEffect(() => {
    if (!users) return
    if (userId && !users.find(u => u.id === userId)) {
      setUserId(users.length > 0 ? users[0].id : null)
      setCurrentProject(null)
    } else if (!hasAutoSelected.current && !userId && users.length > 0) {
      setUserId(users[0].id)
      hasAutoSelected.current = true
    }
  }, [userId, users, setUserId, setCurrentProject])

  const handleSelectProject = (project: { id: string; name: string; targetDomain: string }) => {
    setCurrentProject({
      id: project.id,
      name: project.name,
      targetDomain: project.targetDomain,
      createdAt: '',
      updatedAt: ''
    })
    router.push(`/graph?project=${project.id}`)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (await dangerConfirm('이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await deleteProjectMutation.mutateAsync(projectId)
      toast.success('프로젝트가 삭제되었습니다')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await createUserMutation.mutateAsync({
        name: newUserName,
        email: newUserEmail
      })
      setUserId(user.id)
      setShowUserModal(false)
      setNewUserName('')
      setNewUserEmail('')
      toast.success('사용자가 생성되었습니다')
    } catch (error) {
      alertError(error instanceof Error ? error.message : '사용자 생성에 실패했습니다')
    }
  }

  const handleDeleteUser = async () => {
    if (!userId) return
    const selectedUser = users?.find(u => u.id === userId)
    const projectCount = selectedUser?._count?.projects ?? 0
    const warning = projectCount > 0
      ? `사용자 "${selectedUser?.name}"와(과) 해당 사용자의 프로젝트 ${projectCount}개를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
      : `사용자 "${selectedUser?.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
    if (await dangerConfirm(warning)) {
      try {
        await deleteUserMutation.mutateAsync(userId)
        setUserId(null)
        setCurrentProject(null)
        toast.success('사용자가 삭제되었습니다')
      } catch (error) {
        alertError(error instanceof Error ? error.message : '사용자 삭제에 실패했습니다')
      }
    }
  }

  const isLoading = usersLoading || projectsLoading

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FolderOpen size={20} />
          <h1 className={styles.title}>프로젝트</h1>
          <WikiInfoButton target="projects" title="프로젝트 생성 위키 페이지 열기" />
        </div>
        <div className={styles.headerActions}>
          <button
            className="iconButton"
            onClick={() => refetch()}
            title="새로고침"
          >
            <RefreshCw size={14} />
          </button>
          {userId && (
            <button
              className="secondaryButton"
              onClick={() => setShowImportModal(true)}
              title="백업에서 프로젝트 가져오기"
            >
              <Upload size={14} />
              프로젝트 가져오기
            </button>
          )}
          {userId ? (
            <Link href="/projects/new" className="primaryButton">
              <Plus size={14} />
              새 프로젝트
            </Link>
          ) : (
            <button className="primaryButton" disabled>
              <Plus size={14} />
              새 프로젝트
            </button>
          )}
        </div>
      </div>

      <div className={styles.userSelector}>
        <div className={styles.userSelectorLabel}>
          <Users size={14} />
          <span>사용자:</span>
        </div>
        <select
          className="select"
          value={userId || ''}
          onChange={(e) => setUserId(e.target.value || null)}
        >
          <option value="">사용자 선택</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        <button
          className="secondaryButton"
          onClick={() => setShowUserModal(true)}
        >
          <Plus size={12} />
          새 사용자
        </button>
        {userId && (
          <button
            className="iconButton"
            onClick={handleDeleteUser}
            disabled={deleteUserMutation.isPending}
            title="선택한 사용자 삭제"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : projects && projects.length > 0 ? (
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              targetDomain={project.targetDomain}
              description={project.description}
              createdAt={project.createdAt}
              onSelect={() => handleSelectProject(project)}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <FolderOpen size={48} />
          <h2>프로젝트가 없습니다</h2>
          <p>첫 번째 프로젝트를 생성하여 정찰을 시작하세요.</p>
          {userId ? (
            <Link href="/projects/new" className="primaryButton">
              <Plus size={14} />
              프로젝트 생성
            </Link>
          ) : (
            <button className="primaryButton" disabled>
              <Plus size={14} />
              프로젝트 생성
            </button>
          )}
        </div>
      )}

      {userId && (
        <ImportModal
          isOpen={showImportModal}
          userId={userId}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {showUserModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>새 사용자 생성</h2>
            <form onSubmit={handleCreateUser}>
              <div className="formGroup">
                <label className="formLabel formLabelRequired">이름</label>
                <input
                  type="text"
                  className="textInput"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="사용자 이름 입력"
                  required
                />
              </div>
              <div className="formGroup">
                <label className="formLabel formLabelRequired">이메일</label>
                <input
                  type="email"
                  className="textInput"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="이메일 주소 입력"
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => setShowUserModal(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="primaryButton"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? '생성 중...' : '사용자 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
