'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  useUsers,
  useCreateUser,
  useDeleteUser,
  useChangePassword,
} from '@/hooks/useUsers';
import { Modal } from '@/components/ui';
import styles from './page.module.css';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'password'; userId: string; userName: string }
  | { type: 'delete'; userId: string; userName: string }
  | { type: 'changeOwn' };

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, isAdmin, isLoading: authLoading } = useAuth();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const changePasswordMutation = useChangePassword();

  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('standard');
  const [currentPassword, setCurrentPassword] = useState('');

  const wantsPasswordChange = searchParams.get('changePassword') === 'true';

  // Handle ?changePassword=true from UserSelector for standard users
  useEffect(() => {
    if (wantsPasswordChange && authUser) {
      setModal({ type: 'changeOwn' });
      router.replace('/settings/users', { scroll: false });
    }
  }, [wantsPasswordChange, authUser, router]);

  // Redirect non-admin to graph (unless they came for password change)
  useEffect(() => {
    if (
      !authLoading &&
      !isAdmin &&
      !wantsPasswordChange &&
      modal.type !== 'changeOwn'
    ) {
      router.push('/graph');
    }
  }, [authLoading, isAdmin, wantsPasswordChange, modal, router]);

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('standard');
    setCurrentPassword('');
    setFormError('');
    setFormSuccess('');
  }

  function openModal(state: ModalState) {
    resetForm();
    setModal(state);
  }

  function closeModal() {
    setModal({ type: 'none' });
    resetForm();
  }

  async function handleCreateUser() {
    setFormError('');
    if (!name || !email) {
      setFormError('이름과 이메일은 필수입니다');
      return;
    }
    if (password && password !== confirmPassword) {
      setFormError('비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      await createUser.mutateAsync({
        name,
        email,
        password: password || undefined,
        role,
      });
      closeModal();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : '사용자 생성에 실패했습니다',
      );
    }
  }

  async function handleSetPassword() {
    setFormError('');
    setFormSuccess('');
    if (!password || password.length < 4) {
      setFormError('비밀번호는 최소 4자 이상이어야 합니다');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (modal.type !== 'password') return;

    try {
      await changePasswordMutation.mutateAsync({
        userId: modal.userId,
        data: { newPassword: password },
      });
      setFormSuccess('비밀번호가 업데이트되었습니다');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다',
      );
    }
  }

  async function handleChangeOwnPassword() {
    setFormError('');
    setFormSuccess('');
    if (!currentPassword) {
      setFormError('현재 비밀번호가 필요합니다');
      return;
    }
    if (!password || password.length < 4) {
      setFormError('새 비밀번호는 최소 4자 이상이어야 합니다');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('비밀번호가 일치하지 않습니다');
      return;
    }
    if (!authUser) return;

    try {
      await changePasswordMutation.mutateAsync({
        userId: authUser.id,
        data: { newPassword: password, currentPassword },
      });
      setFormSuccess('비밀번호가 성공적으로 변경되었습니다');
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다',
      );
    }
  }

  async function handleDeleteUser() {
    if (modal.type !== 'delete') return;
    setFormError('');

    try {
      await deleteUser.mutateAsync(modal.userId);
      closeModal();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : '사용자 삭제에 실패했습니다',
      );
    }
  }

  // Show change password modal for standard users
  if (!isAdmin && modal.type === 'changeOwn') {
    return (
      <div className={styles.page}>
        <Modal isOpen onClose={closeModal} title="비밀번호 변경" size="small">
          <div className={styles.form}>
            {formError && <div className={styles.error}>{formError}</div>}
            {formSuccess && <div className={styles.success}>{formSuccess}</div>}
            <div className={styles.field}>
              <label className={styles.label}>현재 비밀번호</label>
              <input
                type="password"
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>새 비밀번호</label>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>새 비밀번호 확인</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.actionButton} onClick={closeModal}>
                취소
              </button>
              <button
                className="primaryButton"
                onClick={handleChangeOwnPassword}
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending
                  ? '저장 중...'
                  : '비밀번호 변경'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>사용자 관리</h1>
        <button
          className="primaryButton"
          onClick={() => openModal({ type: 'create' })}
        >
          사용자 생성
        </button>
      </div>

      {isLoading ? (
        <div className={styles.empty}>사용자 로딩 중...</div>
      ) : !users || users.length === 0 ? (
        <div className={styles.empty}>사용자를 찾을 수 없습니다</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>이름</th>
              <th className={styles.th}>이메일</th>
              <th className={styles.th}>역할</th>
              <th className={styles.th}>비밀번호</th>
              <th className={styles.th}>프로젝트</th>
              <th className={styles.th}>작업</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.tr}>
                <td className={styles.td}>
                  {user.name}
                  {user.id === authUser?.id && (
                    <span className={styles.selfLabel}>(본인)</span>
                  )}
                </td>
                <td className={styles.td}>
                  <span className={styles.email}>{user.email}</span>
                </td>
                <td className={styles.td}>
                  <span
                    className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeStandard}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className={styles.td}>
                  {user.hasPassword ? (
                    <span className={`${styles.badge} ${styles.badgeYes}`}>
                      설정됨
                    </span>
                  ) : (
                    <span className={styles.badgeNo}>설정되지 않음</span>
                  )}
                </td>
                <td className={styles.td}>{user._count?.projects ?? 0}</td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionButton}
                      onClick={() =>
                        openModal({
                          type: 'password',
                          userId: user.id,
                          userName: user.name,
                        })
                      }
                    >
                      비밀번호 설정
                    </button>
                    {user.id !== authUser?.id && (
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() =>
                          openModal({
                            type: 'delete',
                            userId: user.id,
                            userName: user.name,
                          })
                        }
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={modal.type === 'create'}
        onClose={closeModal}
        title="사용자 생성"
      >
        <div className={styles.form}>
          {formError && <div className={styles.error}>{formError}</div>}
          <div className={styles.field}>
            <label className={styles.label}>이름 *</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>이메일 *</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 없는 사용자로 두려면 비워두세요"
            />
            <span className={styles.hint}>
              비밀번호 없는 사용자는 관리자 전환을 통해서만 접속할 수 있습니다
            </span>
          </div>
          {password && (
            <div className={styles.field}>
              <label className={styles.label}>비밀번호 확인</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>역할</label>
            <select
              className={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="standard">일반 사용자</option>
              <option value="admin">관리자</option>
            </select>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.actionButton} onClick={closeModal}>
              취소
            </button>
            <button
              className="primaryButton"
              onClick={handleCreateUser}
              disabled={createUser.isPending}
            >
              {createUser.isPending ? '생성 중...' : '사용자 생성'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Set Password Modal */}
      <Modal
        isOpen={modal.type === 'password'}
        onClose={closeModal}
        title={`비밀번호 설정 - ${modal.type === 'password' ? modal.userName : ''}`}
        size="small"
      >
        <div className={styles.form}>
          {formError && <div className={styles.error}>{formError}</div>}
          {formSuccess && <div className={styles.success}>{formSuccess}</div>}
          <div className={styles.field}>
            <label className={styles.label}>새 비밀번호</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호 확인</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.actionButton} onClick={closeModal}>
              취소
            </button>
            <button
              className="primaryButton"
              onClick={handleSetPassword}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending
                ? '저장 중...'
                : '비밀번호 설정'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modal.type === 'delete'}
        onClose={closeModal}
        title="사용자 삭제"
        size="small"
      >
        <div className={styles.form}>
          {formError && <div className={styles.error}>{formError}</div>}
          <p
            style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}
          >
            정말로{' '}
            <strong>{modal.type === 'delete' ? modal.userName : ''}</strong>님을
            삭제하시겠습니까? 사용자의 모든 프로젝트, 대화 및 설정도 삭제됩니다.
          </p>
          <div className={styles.modalActions}>
            <button className={styles.actionButton} onClick={closeModal}>
              취소
            </button>
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={handleDeleteUser}
              disabled={deleteUser.isPending}
              style={{ borderColor: 'var(--status-error)' }}
            >
              {deleteUser.isPending ? '삭제 중...' : '사용자 삭제'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
