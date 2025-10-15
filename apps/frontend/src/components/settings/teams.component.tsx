import { Button } from '@gitroom/react/form/button';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR, { useSWRConfig } from 'swr';
import React, { useCallback, useMemo } from 'react';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { capitalize } from 'lodash';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { TopTitle } from '@gitroom/frontend/components/launches/helpers/top.title.component';
import { Input } from '@gitroom/react/form/input';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Select } from '@gitroom/react/form/select';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { AddTeamMemberDto } from '@gitroom/nestjs-libraries/dtos/settings/add.team.member.dto';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
const roles = [
  {
    name: 'User',
    value: 'USER',
  },
  {
    name: 'Admin',
    value: 'ADMIN',
  },
];

type IntegrationOption = {
  id: string;
  name: string;
  display?: string;
  identifier: string;
};

export const AddMember = () => {
  const modals = useModals();
  const fetch = useFetch();
  const toast = useToaster();
  const { mutate: mutateGlobal } = useSWRConfig();
  const resolver = useMemo(() => {
    return classValidatorResolver(AddTeamMemberDto);
  }, []);
  const form = useForm({
    values: {
      email: '',
      role: '',
      password: '',
      passwordConfirm: '',
      integrations: [] as string[],
    },
    resolver,
    mode: 'onChange',
  });

  const loadIntegrations = useCallback(async () => {
    const response = await fetch('/integrations/list');
    if (!response.ok) {
      throw new Error('Failed to load integrations');
    }

    const data = await response.json();
    return (data.integrations || []) as IntegrationOption[];
  }, [fetch]);

  const { data: integrations } = useSWR('/integrations/list', loadIntegrations, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const t = useT();

  const submit = useCallback(
    async (values: {
      email: string;
      role: string;
      password: string;
      passwordConfirm: string;
      integrations: string[];
    }) => {
      try {
        const response = await fetch('/settings/team', {
          method: 'POST',
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.message || t('failed_to_create_team_member', 'Failed to create team member'));
        }

        await mutateGlobal('/api/teams');
        modals.closeAll();
        toast.show(t('team_member_created', 'Team member created'), 'success');
      } catch (err) {
        const fallback = t('failed_to_create_team_member', 'Failed to create team member');
        const message = err instanceof Error ? err.message : fallback;
        toast.show(message || fallback, 'error');
      }
    },
    [fetch, modals, mutateGlobal, t, toast]
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="relative flex gap-[10px] flex-col flex-1 p-[16px] pt-0">
          <Input
            label={t('email', 'Email')}
            placeholder={t('enter_email', 'Enter email')}
            name="email"
          />
          <Select label="Role" name="role">
            <option value="">{t('select_role', 'Select Role')}</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.name}
              </option>
            ))}
          </Select>
          <Input
            label={t('password', 'Password')}
            placeholder={t('enter_password', 'Enter password')}
            name="password"
            type="password"
          />
          <Input
            label={t('confirm_password', 'Confirm Password')}
            placeholder={t('confirm_password', 'Confirm Password')}
            name="passwordConfirm"
            type="password"
          />
          <div className="flex flex-col gap-[8px]">
            <div className="text-[14px] text-customColor18">
              {t('select_pages_to_publish', 'Select the pages this member can publish to')}
            </div>
            <Controller
              name="integrations"
              control={form.control}
              render={({ field }) => {
                const selectedIds = Array.isArray(field.value)
                  ? (field.value as string[])
                  : [];

                const toggleIntegration = (id: string) => () => {
                  const current = Array.isArray(field.value)
                    ? (field.value as string[])
                    : [];
                  if (current.includes(id)) {
                    field.onChange(current.filter((value) => value !== id));
                    return;
                  }
                  field.onChange([...current, id]);
                };

                return (
                  <div className="max-h-[200px] overflow-y-auto rounded-[4px] border border-customColor21 p-[12px] flex flex-col gap-[8px]">
                    {(integrations || []).map((integration) => {
                      const isChecked = selectedIds.includes(integration.id);
                      return (
                        <label
                          key={integration.id}
                          className="flex items-center gap-[8px] text-[14px] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={isChecked}
                            onChange={toggleIntegration(integration.id)}
                            onBlur={field.onBlur}
                          />
                          <span>{integration.display || integration.name}</span>
                        </label>
                      );
                    })}
                    {!(integrations || []).length && (
                      <div className="text-[14px] text-customColor18">
                        {t('no_integrations_available', 'No pages available yet')}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            {form.formState.errors.integrations && (
              <div className="text-[12px] text-[#F87171]">
                {form.formState.errors.integrations.message?.toString()}
              </div>
            )}
          </div>
          <Button type="submit" className="mt-[18px]">
            {t('create_team_member', 'Create Team Member')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
export const TeamsComponent = () => {
  const fetch = useFetch();
  const user = useUser();
  const modals = useModals();
  const myLevel = user?.role === 'USER' ? 0 : user?.role === 'ADMIN' ? 1 : 2;
  const getLevel = useCallback(
    (role: 'USER' | 'ADMIN' | 'SUPERADMIN') =>
      role === 'USER' ? 0 : role === 'ADMIN' ? 1 : 2,
    []
  );
  const loadTeam = useCallback(async () => {
    return (await (await fetch('/settings/team')).json()).users as Array<{
      allowedIntegrations?: string[];
      role: 'SUPERADMIN' | 'ADMIN' | 'USER';
      user: {
        email: string;
        id: string;
      };
    }>;
  }, [fetch]);
  const addMember = useCallback(() => {
    modals.openModal({
      classNames: {
        modal: 'bg-transparent text-textColor',
      },
      title: 'Add Team Member',
      withCloseButton: true,
      children: <AddMember />,
    });
  }, []);
  const { data, mutate } = useSWR('/api/teams', loadTeam, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });
  const remove = useCallback(
    (toRemove: {
        user: {
          id: string;
        };
      }) =>
      async () => {
        if (
          !(await deleteDialog(
            'Are you sure you want to remove this team member?'
          ))
        ) {
          return;
        }
        await fetch(`/settings/team/${toRemove.user.id}`, {
          method: 'DELETE',
        });
        await mutate();
      },
    []
  );

  const t = useT();

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">{t('team_members', 'Team Members')}</h3>
      <div className="text-customColor18 mt-[4px]">
        {t(
          'invite_your_assistant_or_team_member_to_manage_your_account',
          'Invite your assistant or team member to manage your account'
        )}
      </div>
      <div className="my-[16px] mt-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[16px]">
          {(data || []).map((p) => (
            <div key={p.user.id} className="flex items-center">
              <div className="flex-1">
                {capitalize(p.user.email.split('@')[0]).split('.')[0]}
              </div>
              <div className="flex-1">
                {p.role === 'USER'
                  ? 'User'
                  : p.role === 'ADMIN'
                  ? 'Admin'
                  : 'Super Admin'}
              </div>
              {+myLevel > +getLevel(p.role) ? (
                <div className="flex-1 flex justify-end">
                  <Button
                    className={`!bg-customColor3 !h-[24px] border border-customColor21 rounded-[4px] text-[12px]`}
                    onClick={remove(p)}
                    secondary={true}
                  >
                    <div className="flex justify-center items-center gap-[4px]">
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="15"
                          viewBox="0 0 14 15"
                          fill="none"
                        >
                          <path
                            d="M11.8125 3.125H9.625V2.6875C9.625 2.3394 9.48672 2.00556 9.24058 1.75942C8.99444 1.51328 8.6606 1.375 8.3125 1.375H5.6875C5.3394 1.375 5.00556 1.51328 4.75942 1.75942C4.51328 2.00556 4.375 2.3394 4.375 2.6875V3.125H2.1875C2.07147 3.125 1.96019 3.17109 1.87814 3.25314C1.79609 3.33519 1.75 3.44647 1.75 3.5625C1.75 3.67853 1.79609 3.78981 1.87814 3.87186C1.96019 3.95391 2.07147 4 2.1875 4H2.625V11.875C2.625 12.1071 2.71719 12.3296 2.88128 12.4937C3.04538 12.6578 3.26794 12.75 3.5 12.75H10.5C10.7321 12.75 10.9546 12.6578 11.1187 12.4937C11.2828 12.3296 11.375 12.1071 11.375 11.875V4H11.8125C11.9285 4 12.0398 3.95391 12.1219 3.87186C12.2039 3.78981 12.25 3.67853 12.25 3.5625C12.25 3.44647 12.2039 3.33519 12.1219 3.25314C12.0398 3.17109 11.9285 3.125 11.8125 3.125ZM5.25 2.6875C5.25 2.57147 5.29609 2.46019 5.37814 2.37814C5.46019 2.29609 5.57147 2.25 5.6875 2.25H8.3125C8.42853 2.25 8.53981 2.29609 8.62186 2.37814C8.70391 2.46019 8.75 2.57147 8.75 2.6875V3.125H5.25V2.6875ZM10.5 11.875H3.5V4H10.5V11.875ZM6.125 6.1875V9.6875C6.125 9.80353 6.07891 9.91481 5.99686 9.99686C5.91481 10.0789 5.80353 10.125 5.6875 10.125C5.57147 10.125 5.46019 10.0789 5.37814 9.99686C5.29609 9.91481 5.25 9.80353 5.25 9.6875V6.1875C5.25 6.07147 5.29609 5.96019 5.37814 5.87814C5.46019 5.79609 5.57147 5.75 5.6875 5.75C5.80353 5.75 5.91481 5.79609 5.99686 5.87814C6.07891 5.96019 6.125 6.07147 6.125 6.1875ZM8.75 6.1875V9.6875C8.75 9.80353 8.70391 9.91481 8.62186 9.99686C8.53981 10.0789 8.42853 10.125 8.3125 10.125C8.19647 10.125 8.08519 10.0789 8.00314 9.99686C7.92109 9.91481 7.875 9.80353 7.875 9.6875V6.1875C7.875 6.07147 7.92109 5.96019 8.00314 5.87814C8.08519 5.79609 8.19647 5.75 8.3125 5.75C8.42853 5.75 8.53981 5.79609 8.62186 5.87814C8.70391 5.96019 8.75 6.07147 8.75 6.1875Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <div>{t('remove', 'Remove')}</div>
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          ))}
        </div>
        <div>
          <Button onClick={addMember}>
            {t('add_another_member', 'Add another member')}
          </Button>
        </div>
      </div>
    </div>
  );
};
