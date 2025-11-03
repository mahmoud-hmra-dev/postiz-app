'use client';

import { FC } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useShallow } from 'zustand/react/shallow';
import { useExistingData } from '@gitroom/frontend/components/launches/helpers/use.existing.data';

export const PicksSocialsComponent: FC<{ toolTip?: boolean }> = ({
  toolTip,
}) => {
  const exising = useExistingData();

  const {
    locked,
    addOrRemoveSelectedIntegration,
    integrations,
    selectedIntegrations,
  } = useLaunchStore(
    useShallow((state) => ({
      integrations: state.integrations,
      selectedIntegrations: state.selectedIntegrations,
      addOrRemoveSelectedIntegration: state.addOrRemoveSelectedIntegration,
      locked: state.locked,
    }))
  );

  return (
    <div className={clsx('flex', locked && 'opacity-50 pointer-events-none')}>
      <div className="flex">
        <div className="innerComponent">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-[12px]">
            {integrations
              .filter((f) => {
                if (exising.integration) {
                  return f.id === exising.integration;
                }
                return !f.inBetweenSteps && !f.disabled;
              })
              .map((integration) => {
                const isSelected =
                  selectedIntegrations.findIndex(
                    (p) => p.integration.id === integration.id
                  ) !== -1;

                return (
                  <div
                    key={integration.id}
                    className="flex flex-col items-center gap-[8px] text-center"
                    {...(toolTip && {
                      'data-tooltip-id': 'tooltip',
                      'data-tooltip-content': integration.name,
                    })}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (exising.integration) {
                          return;
                        }
                        addOrRemoveSelectedIntegration(integration, {});
                      }}
                      className={clsx(
                        'relative w-[48px] h-[48px] rounded-full flex justify-center items-center bg-fifth transition-all duration-300 outline-none border border-transparent',
                        isSelected
                          ? 'border-btnPrimary shadow-[0_0_10px_rgba(64,87,255,0.35)]'
                          : 'opacity-40 hover:opacity-60'
                      )}
                    >
                      <Image
                        src={integration.picture || '/no-picture.jpg'}
                        className="rounded-full"
                        alt={integration.identifier}
                        width={44}
                        height={44}
                      />
                      {integration.identifier === 'youtube' ? (
                        <img
                          src="/icons/platforms/youtube.svg"
                          className="absolute z-10 -bottom-[5px] -end-[5px]"
                          width={20}
                        />
                      ) : (
                        <Image
                          src={`/icons/platforms/${integration.identifier}.png`}
                          className="rounded-full absolute z-10 -bottom-[5px] -end-[5px] border border-fifth"
                          alt={integration.identifier}
                          width={20}
                          height={20}
                        />
                      )}
                    </button>
                    <span
                      className={clsx(
                        'text-[12px] leading-[1.2] text-textColor px-[4px] break-words',
                        !isSelected && 'opacity-70'
                      )}
                    >
                      {integration.name}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
