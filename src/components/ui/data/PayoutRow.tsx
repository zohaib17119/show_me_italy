import styles from './ui.module.css';

export interface PayoutRowProps {
  date: string;
  tour: string;
  guide?: string;
  amount: string;
  className?: string;
}

export function PayoutRow({ date, tour, guide, amount, className }: PayoutRowProps) {
  return (
    <div className={[styles.payoutRow, className].filter(Boolean).join(' ')}>
      <div className={styles.payoutDate}>{date}</div>
      <div className={styles.payoutBody}>
        <div className={styles.payoutTour}>{tour}</div>
        {guide && <div className={styles.payoutGuide}>{guide}</div>}
      </div>
      <div className={styles.payoutAmount}>{amount}</div>
    </div>
  );
}
