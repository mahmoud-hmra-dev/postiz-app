'use client';

import { FC, useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { Button } from '@gitroom/react/form/button';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useCustomProviderFunction } from '@gitroom/frontend/components/launches/helpers/use.custom.provider.function';
import { useIntegration } from '@gitroom/frontend/components/launches/helpers/use.integration';
export const LinkedinContinue: FC<{
  closeModal: () => void;
  existingId: string[];
}> = (props) => {
  const { closeModal, existingId } = props;
  const t = useT();

  const call = useCustomProviderFunction();
  const { integration } = useIntegration();
  const [pages, setSelectedPages] = useState<string[]>([]);
  const fetch = useFetch();
  const loadPages = useCallback(async () => {
    try {
      const pages = await call.get('companies');
      return pages;
    } catch (e) {
      closeModal();
    }
  }, []);
  const togglePage = useCallback((id: string) => {
    setSelectedPages((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pageId) => pageId !== id);
      }

      return [...prev, id];
    });
  }, []);
  const { data, isLoading } = useSWR('load-pages', loadPages, {
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });
  const saveLinkedin = useCallback(async () => {
    await fetch(`/integrations/linkedin-page/${integration?.id}`, {
      method: 'POST',
      body: JSON.stringify({ pages }),
    });
    closeModal();
  }, [integration, pages]);
  const filteredData = useMemo(() => {
    return (
      data?.filter((p: { id: string }) => !existingId.includes(p.id)) || []
    );
  }, [data]);
  if (!isLoading && !data?.length) {
    return (
      <div className="text-center flex justify-center items-center text-[18px] leading-[50px] h-[300px]">
        {t(
          'we_couldn_t_find_any_business_connected_to_your_linkedin_page',
          "We couldn't find any business connected to your LinkedIn Page."
        )}
        <br />
        {t(
          'please_close_this_dialog_create_a_new_page_and_add_a_new_channel_again',
          'Please close this dialog, create a new page, and add a new channel again.'
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[20px]">
      <div>{t('select_linkedin_page', 'Select Linkedin Page:')}</div>
      <div className="grid grid-cols-3 justify-items-center select-none cursor-pointer">
        {filteredData?.map(
          (p: {
            id: string;
            pageId: string;
            username: string;
            name: string;
            picture: string;
          }) => (
            <div
              key={p.id}
              className={clsx(
                'flex flex-col w-full text-center gap-[10px] border border-input p-[10px] hover:bg-seventh',
                pages.includes(p.id) && 'bg-seventh'
              )}
              onClick={() => togglePage(p.id)}
            >
              <div>
                <img className="w-full" src={p.picture} alt="profile" />
              </div>
              <div>{p.name}</div>
            </div>
          )
        )}
      </div>
      <div>
        <Button disabled={!pages.length} onClick={saveLinkedin}>
          {t('save', 'Save')}
        </Button>
      </div>
    </div>
  );
};
