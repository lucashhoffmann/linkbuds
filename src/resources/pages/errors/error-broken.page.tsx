import { ErrorStatusPage } from './error-status-page.component';

export function ErrorBrokenPage() {
  return (
    <ErrorStatusPage
      status='500'
      title='Algo saiu do eixo'
      description='A interface encontrou um erro inesperado.'
    />
  );
}
