import { act, renderHook } from '@testing-library/react-hooks';

import { createQueryClientWrapper } from '../../../test-utils';
import { useStaff } from '../hooks/useStaff';

test('filter staff', async () => {
  const { result, waitFor } = renderHook(useStaff, {
    wrapper: createQueryClientWrapper(),
  });

  await waitFor(() => Object.keys(result.current.staff).length === 4);

  // set to show only
  act(() => result.current.setFilter('sandra'));

  await waitFor(() => Object.keys(result.current.staff).length === 1);
});
