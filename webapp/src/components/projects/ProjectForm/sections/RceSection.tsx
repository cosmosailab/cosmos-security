'use client';

import type { Project } from '@prisma/client';
import { WikiInfoButton } from '@/components/ui/WikiInfoButton';
import styles from '../ProjectForm.module.css';

type FormData = Omit<
  Project,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user'
>;

interface RceSectionProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const ROW_STYLE: React.CSSProperties = {
  marginBottom: 'var(--space-4)',
};

const GROUP_HEADER_STYLE: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--text-primary)',
  marginTop: 'var(--space-5)',
  marginBottom: 'var(--space-3)',
  paddingBottom: 'var(--space-2)',
  borderBottom: '1px solid var(--border-subtle, var(--border-default))',
};

const FIRST_GROUP_HEADER_STYLE: React.CSSProperties = {
  ...GROUP_HEADER_STYLE,
  marginTop: 'var(--space-3)',
};

const CHECKBOX_LABEL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
};

export function RceSection({ data, updateField }: RceSectionProps) {
  return (
    <div
      style={{ padding: 'var(--space-3) var(--space-4)', position: 'relative' }}
    >
      <div style={{ position: 'absolute', top: 8, right: 16 }}>
        <WikiInfoButton
          target="https://github.com/samugit83/redamon/wiki/Agent-Skills"
          title="Open Agent Skills wiki page"
        />
      </div>
      <p
        className={styles.sectionDescription}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        Configure how the agent tests for RCE / command injection. Disable
        sub-workflows you don&apos;t want injected into the prompt and gate
        destructive payloads behind the explicit aggressive toggle.
      </p>

      <h3 style={FIRST_GROUP_HEADER_STYLE}>Sub-workflow injection</h3>

      <div className={styles.fieldRow} style={ROW_STYLE}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} style={CHECKBOX_LABEL_STYLE}>
            <input
              type="checkbox"
              checked={data.rceOobCallbackEnabled ?? true}
              onChange={(e) =>
                updateField('rceOobCallbackEnabled', e.target.checked)
              }
            />
            OOB callback workflow (interactsh)
          </label>
          <span className={styles.fieldHint}>
            Adds the blind-RCE / OOB sub-prompt. The agent registers an oast.fun
            domain and uses DNS or HTTP callbacks as a quiet oracle for command
            execution. Disable when external OOB providers are off-limits.
          </span>
        </div>
      </div>

      <div className={styles.fieldRow} style={ROW_STYLE}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} style={CHECKBOX_LABEL_STYLE}>
            <input
              type="checkbox"
              checked={data.rceDeserializationEnabled ?? true}
              onChange={(e) =>
                updateField('rceDeserializationEnabled', e.target.checked)
              }
            />
            Deserialization gadget workflow (ysoserial)
          </label>
          <span className={styles.fieldHint}>
            Adds the Java / PHP / Python / Ruby / .NET deserialization
            sub-prompt with ysoserial gadget-chain guidance (URLDNS,
            CommonsCollections, Spring, etc.). Disable when the target stack
            does not deserialize untrusted input or when you want a leaner
            prompt.
          </span>
        </div>
      </div>

      <div className={styles.fieldRow} style={ROW_STYLE}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} style={CHECKBOX_LABEL_STYLE}>
            <input
              type="checkbox"
              checked={data.rceAggressivePayloads ?? false}
              onChange={(e) =>
                updateField('rceAggressivePayloads', e.target.checked)
              }
            />
            \uacf5\uaca9\uc801 \ud398\uc774\ub85c\ub4dc (\ud30c\uc77c
            \uc4f0\uae30, \uc6f9 \uc258, \ucee8\ud14c\uc774\ub108 \ud0c8\ucd9c)
          </label>
          <span className={styles.fieldHint}>
            <strong>\uae30\ubcf8 OFF.</strong> \ud65c\uc131\ud654\ud558\uba74
            \uc6cc\ud06c\ud50c\ub85c\uc6b0 7\ub2e8\uacc4\uc5d0\uc11c /tmp
            \uc678\ubd80 \ud30c\uc77c \uc4f0\uae30, \uc601\uad6c \uc6f9 \uc258 /
            cron / systemd \ud6c5, \ub9ac\ubc84\uc2a4 \uc178 \ud578\ub4e4\ub7ec,
            \ucee8\ud14c\uc774\ub108 / Kubernetes \ud0c8\ucd9c
            \ud504\ub85c\ube0c\ub97c \ud5c8\uc6a9\ud569\ub2c8\ub2e4.
            \uc77d\uae30 \uc804\uc6a9 \uc99d\uba85 (id, whoami,
            /etc/passwd)\uc740 \uc774\ubbf8 Level 3 \uacb0\uacfc\ub97c
            \uc0dd\uc131\ud558\uc73c\ubbc0\ub85c OFF\ub85c \ub450\uc138\uc694.
            Level 4 \uc911\uc694 \uc601\ud5a5 \uc99d\uba85\uc774
            \uba85\uc2dc\uc801\uc73c\ub85c \uc2b9\uc778\ub41c \uac83\uc5b0
            \ub2e8\ub9cc \ud65c\uc131\ud654\ud558\uc138\uc694.
          </span>
        </div>
      </div>
    </div>
  );
}
