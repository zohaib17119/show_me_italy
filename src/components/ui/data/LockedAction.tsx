import { cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Tooltip } from 'antd';
import { LockOutlined } from '@ant-design/icons';

export const NOT_AUTHORIZED_MESSAGE = 'You are not authorized for this action';

export interface LockedActionProps {
  allowed: boolean;
  children: ReactElement;
  tooltip?: string;
}

/**
 * Wraps an action element (AppButton / button). When `allowed` is false the
 * child is disabled, a lock icon is appended, and a tooltip explains why.
 */
export function LockedAction({ allowed, children, tooltip }: LockedActionProps) {
  if (allowed) return children;
  if (!isValidElement(children)) return children;

  const childProps = children.props as {
    children?: ReactNode;
    icon?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  };

  const locked = cloneElement(children as ReactElement<Record<string, unknown>>, {
    disabled: true,
    'aria-disabled': true,
    onClick: undefined,
    children: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {childProps.children as ReactNode}
        <LockOutlined style={{ fontSize: 12 }} />
      </span>
    ),
  });

  return (
    <Tooltip title={tooltip ?? NOT_AUTHORIZED_MESSAGE}>
      {/* span wrapper so tooltip works on disabled element */}
      <span style={{ display: 'inline-flex', cursor: 'not-allowed' }}>{locked}</span>
    </Tooltip>
  );
}
