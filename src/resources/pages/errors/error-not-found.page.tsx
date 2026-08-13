import { ErrorStatusPage } from './error-status-page.component';

export function ErrorNotFoundPage() {
  return (
    <ErrorStatusPage
      status='404'
      title='Página não encontrada'
      description='O endereço acessado não existe neste painel.'
    />
  );
}
