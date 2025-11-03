'use client';
import { FC, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';

export const MenuItem: FC<{
  label: string;
  icon: ReactNode;
  path: string;
  external?: boolean;
}> = ({
  label,
  icon,
  path,
  external,
}) => {
  const currentPath = usePathname();
  const isExternal = external || path.startsWith('http');
  const isActive = !isExternal && path.indexOf(currentPath) === 0;

  const className = clsx(
    'w-full h-[54px] py-[8px] px-[6px] gap-[4px] flex flex-col text-[10px] font-[600] items-center justify-center rounded-[12px] hover:text-textItemFocused hover:bg-boxFocused',
    isActive ? 'text-textItemFocused bg-boxFocused' : 'text-textItemBlur'
  );

  if (isExternal) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <div>{icon}</div>
        <div className="text-[10px]">{label}</div>
      </a>
    );
  }

  return (
    <Link prefetch={true} href={path} className={className}>
      <div>{icon}</div>
      <div className="text-[10px]">{label}</div>
    </Link>
  );
};
