import styles from './ui.module.css';

export interface GuideAvatarProps {
  initials: string;
  profilePicture?: string | null;
  size?: 'sm' | 'lg';
  alt?: string;
  className?: string;
}

export function GuideAvatar({
  initials,
  profilePicture,
  size = 'sm',
  alt = '',
  className,
}: GuideAvatarProps) {
  const url = profilePicture?.trim();
  const sizeClass = size === 'lg' ? styles.guideAvatarLg : styles.guideAvatar;

  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={[sizeClass, styles.guideAvatarImage, className].filter(Boolean).join(' ')}
      />
    );
  }

  return (
    <div className={[sizeClass, className].filter(Boolean).join(' ')} aria-hidden={!alt}>
      {initials}
    </div>
  );
}
