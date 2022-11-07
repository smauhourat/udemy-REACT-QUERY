import { act, renderHook } from '@testing-library/react-hooks';

import { createQueryClientWrapper } from '../../../test-utils';
import { useAppointments } from '../hooks/useAppointments';

test('filter appointments by availability', async () => {
  const { result, waitFor } = renderHook(useAppointments, {
    wrapper: createQueryClientWrapper(),
  });

  // wait for the appointments to populate
  await waitFor(() => Object.keys(result.current.appointments).length > 0);

  const filteredAppoinmentsLength = Object.keys(result.current.appointments)
    .length;

  // set to show all appointments
  act(() => result.current.setShowAll(true));

  // wait for teh appointments to show more than when filtered
  await waitFor(
    () =>
      Object.keys(result.current.appointments).length >
      filteredAppoinmentsLength,
  );
});
