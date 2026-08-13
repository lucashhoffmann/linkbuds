import { ErrorStatusPage } from './error-status-page.component';

export function ErrorInternalPage() {
  return (
    <ErrorStatusPage
      status='500'
      title='Erro interno'
      description='A API retornou uma falha inesperada.'
    />
  );
}
