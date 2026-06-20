import styles from './ui.module.css';

export type StepStatus = 'done' | 'active' | 'wait';

export interface StepperStep {
  label: string;
  status: StepStatus;
}

export interface StepperProps {
  steps: StepperStep[];
  className?: string;
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <div className={[styles.stepper, className].filter(Boolean).join(' ')} role="list">
      {steps.map((step, index) => {
        const stepClass =
          step.status === 'done'
            ? styles.stepDone
            : step.status === 'active'
              ? styles.stepActive
              : '';

        return (
          <div
            key={`${step.label}-${index}`}
            className={[styles.step, stepClass].filter(Boolean).join(' ')}
            role="listitem"
            aria-current={step.status === 'active' ? 'step' : undefined}
          >
            <div className={styles.stepDot}>
              {step.status === 'done' ? '✓' : index + 1}
            </div>
            <div className={styles.stepLabel}>{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}
