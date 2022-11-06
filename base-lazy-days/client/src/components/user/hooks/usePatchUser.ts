import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newUserData: User | null) => patchUserOnServer(newUserData, user),
    {
      // onMutate return context that is passed to onError
      onMutate: async (newData: User | null) => {
        // cancel any outgoing queries for user data, so old server data doesnt overrite our optimistic update
        queryClient.cancelQueries(queryKeys.user);

        // snapshoot of previous user values
        const previousUserData: User = queryClient.getQueryData(queryKeys.user);

        // optimistically update the cache with the new value
        updateUser(newData);

        // return context object with the snapshooted value
        return { previousUserData };
      },
      onError: (error, newData, context) => {
        // tollback the cache to saved value
        if (context.previousUserData) {
          updateUser(context.previousUserData);
          toast({
            title: 'Update failed, restoring previous values',
            status: 'error',
          });
        }
      },
      onSuccess: (userData: User | null) => {
        // updateUser(userData);
        toast({
          title: 'User updated successfully',
          status: 'success',
        });
      },
      onSettled: () => {
        // invalidate user query to make sure we'are in sync with the server data
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  return patchUser;
}
