import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import { IntegrationsPanel } from '../components/integrations-panel.component';

const mutateAsync = vi.fn().mockResolvedValue({});

vi.mock('@/app/modules/link-pages/use-cases/use-link-pages.use-case', () => ({
  useLinkPageMutations: () => ({ update: { mutateAsync } }),
}));

const formPage = {
  id: 'form-1',
  type: 'FORM',
  parentPageId: 'bio-1',
  gtmContainerId: null,
  ga4MeasurementId: null,
  formWebhookUrl: null,
} as LinkPageDetail;

async function flushAutosave() {
  await act(async () => {
    vi.advanceTimersByTime(700);
    await Promise.resolve();
  });
}

describe('IntegrationsPanel', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    mutateAsync.mockClear();
  });

  it('shows Google Sheets only on forms', () => {
    const { rerender } = render(<IntegrationsPanel linkPage={formPage} />);
    expect(screen.getByText('Google Sheets')).toBeTruthy();

    rerender(
      <IntegrationsPanel
        key='bio'
        linkPage={{ ...formPage, type: 'CLIENT', parentPageId: null }}
      />,
    );
    expect(screen.queryByText('Google Sheets')).toBeNull();
  });

  it('saves a valid Apps Script URL and holds an invalid one', async () => {
    render(<IntegrationsPanel linkPage={formPage} />);
    fireEvent.click(screen.getByText('Google Sheets'));
    const input = screen.getByPlaceholderText(
      'https://script.google.com/macros/s/.../exec',
    );

    fireEvent.change(input, { target: { value: 'https://evil.com/exec' } });
    await flushAutosave();
    expect(mutateAsync).not.toHaveBeenCalled();

    const url = 'https://script.google.com/macros/s/AKfycbx_abc-123XYZ/exec';
    fireEvent.change(input, { target: { value: url } });
    await flushAutosave();
    expect(mutateAsync).toHaveBeenCalledWith({ formWebhookUrl: url });
  });
});
