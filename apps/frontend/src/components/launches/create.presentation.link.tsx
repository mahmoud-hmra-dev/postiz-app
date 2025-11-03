import { useT } from '@gitroom/react/translation/get.transation.service.client';
import React from 'react';

export const CreatePresentationLink = () => {
  const t = useT();

  return (
    <a
      href="https://karen.ai.clindoctor.net/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-btnText bg-btnSimple h-[44px] pt-[12px] pb-[14px] ps-[16px] pe-[20px] group-[.sidebar]:p-0 rounded-[8px] flex justify-center items-center gap-[8px] outline-none transition-colors group-[.sidebar]:w-full"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="min-w-[20px] min-h-[20px]"
      >
        <path
          d="M2.5 5.83366C2.5 4.43352 2.5 3.73346 2.77248 3.19868C3.01217 2.72828 3.39462 2.34583 3.86502 2.10614C4.3998 1.83366 5.09987 1.83366 6.5 1.83366H13.5C14.9001 1.83366 15.6002 1.83366 16.135 2.10614C16.6054 2.34583 16.9878 2.72828 17.2275 3.19868C17.5 3.73346 17.5 4.43352 17.5 5.83366V14.167C17.5 15.5671 17.5 16.2672 17.2275 16.8019C16.9878 17.2723 16.6054 17.6548 16.135 17.8945C15.6002 18.167 14.9001 18.167 13.5 18.167H6.5C5.09987 18.167 4.3998 18.167 3.86502 17.8945C3.39462 17.6548 3.01217 17.2723 2.77248 16.8019C2.5 16.2672 2.5 15.5671 2.5 14.167V5.83366Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66602 9.16699H13.3327"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66602 12.5H13.3327"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.33268 5.83366L9.99935 4.16699L11.666 5.83366"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex-1 text-start group-[.sidebar]:hidden">
        {t('create_presentation', 'Create Presentation')}
      </div>
    </a>
  );
};
