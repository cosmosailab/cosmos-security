'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '로그인에 실패했습니다');
        setLoading(false);
        return;
      }

      // Force full page reload to pick up the new cookie in middleware
      window.location.href = '/graph';
    } catch {
      setError('서버에 연결할 수 없습니다');
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Image
        src="/logo.png"
        alt=""
        width={520}
        height={520}
        className={styles.watermark}
        priority
      />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoRow}>
            <Image
              src="/logo.png"
              alt="COSMOS SEQURITY"
              width={40}
              height={40}
              priority
            />
            <span className={styles.logoText}>
              <span className={styles.logoAccent}>COSMOS</span>SEQURITY
            </span>
          </div>
          <p className={styles.subtitle}>로그인하세요</p>
        </div>

        <div className={styles.body}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                이메일
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="admin@redamon.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !email || !password}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <div className={styles.footer}>
          <span className={styles.version}>
            {process.env.NEXT_PUBLIC_REDAMON_VERSION
              ? `v${process.env.NEXT_PUBLIC_REDAMON_VERSION}`
              : 'RedAmon'}
          </span>
        </div>
      </div>
    </div>
  );
}
