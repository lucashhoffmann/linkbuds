import { Link } from 'react-router-dom';
import { ThemeModeToggle } from '@/resources/components/base/theme-mode-toggle/theme-mode-toggle.component';
import { Button } from '@/resources/components/ui/button';
import Footer4Col from '@/resources/components/ui/footer-column';
import { routes } from '@/shared/constants/router.constants';

const LAST_UPDATED = '6 de outubro de 2026';

const sections = [
  {
    title: '1. Aceitação',
    paragraphs: [
      'Estes Termos de Uso regulam o acesso e o uso da LinkBuds, plataforma para agências gerenciarem páginas de links na bio, links de postagens, formulários e métricas de seus clientes. Ao criar uma conta ou usar a plataforma, você declara que leu e concorda com estes termos.',
      'Se você usa a LinkBuds em nome de uma agência ou empresa, declara ter poderes para aceitar estes termos em nome dela.',
    ],
  },
  {
    title: '2. Conta e acesso',
    paragraphs: [
      'Para usar o painel é preciso criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter suas credenciais em sigilo e por toda atividade realizada na sua conta, inclusive pelos usuários que convidar para a sua equipe.',
      'Avise-nos imediatamente em caso de uso não autorizado da sua conta.',
    ],
  },
  {
    title: '3. O serviço',
    paragraphs: [
      'A LinkBuds permite criar e publicar páginas públicas de links, links de postagens e formulários, usar domínio próprio e acompanhar métricas de acesso e cliques. Os recursos disponíveis dependem do plano contratado.',
      'Podemos alterar, melhorar ou descontinuar funcionalidades a qualquer tempo. Mudanças relevantes que afetem planos pagos serão comunicadas com antecedência.',
    ],
  },
  {
    title: '4. Planos, pagamento e cancelamento',
    paragraphs: [
      'A LinkBuds oferece um plano gratuito e planos pagos, mensais ou anuais. Os pagamentos são feitos por cartão de crédito e processados por intermediador de pagamentos parceiro; os dados do cartão não são armazenados pela LinkBuds. O valor exibido no momento da assinatura já inclui a taxa de processamento do cartão.',
      'As assinaturas são renovadas automaticamente ao final de cada período, pelo mesmo valor e forma de pagamento, até que sejam canceladas. O plano anual pode ser parcelado em até 12 vezes no cartão.',
      'Você pode cancelar a renovação a qualquer momento nas configurações da conta. O plano continua ativo até o fim do período já pago e, depois disso, a conta volta ao plano gratuito, podendo ter recursos limitados. Valores de períodos já iniciados não são reembolsados, salvo quando exigido por lei.',
      'Em caso de falha no pagamento, o acesso a recursos pagos pode ser suspenso até a regularização.',
    ],
  },
  {
    title: '5. Conteúdo e uso permitido',
    paragraphs: [
      'Você é o único responsável pelo conteúdo publicado nas suas páginas (textos, imagens, links e formulários) e garante ter os direitos e autorizações necessários, inclusive dos clientes que representa.',
      'É proibido usar a LinkBuds para: publicar conteúdo ilegal, enganoso, difamatório ou que viole direitos de terceiros; distribuir malware, phishing ou spam; coletar dados de pessoas sem base legal; tentar acessar dados de outras contas ou prejudicar o funcionamento da plataforma.',
      'Podemos remover conteúdo ou suspender contas que violem estes termos, com ou sem aviso prévio, conforme a gravidade.',
    ],
  },
  {
    title: '6. Dados de visitantes e privacidade',
    paragraphs: [
      'As páginas públicas registram dados de acesso dos visitantes, como endereço IP, país aproximado, dispositivo, data e links clicados, e os formulários registram as respostas enviadas. Esses dados são disponibilizados à conta responsável pela página para fins de métricas e atendimento.',
      'Em relação a esses dados, a agência atua como controladora e a LinkBuds como operadora, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Cabe à agência informar os visitantes e seus clientes sobre essa coleta e usá-la de forma lícita.',
      'Os dados da sua conta são tratados apenas para prestar o serviço, cumprir obrigações legais e garantir a segurança da plataforma.',
    ],
  },
  {
    title: '7. Domínio próprio',
    paragraphs: [
      'Ao conectar um domínio próprio, você declara ser titular ou ter autorização para usá-lo e é responsável pela sua configuração e renovação junto ao registrador.',
    ],
  },
  {
    title: '8. Propriedade intelectual',
    paragraphs: [
      'A marca LinkBuds, o software, o layout e os demais elementos da plataforma pertencem à LinkBuds. O conteúdo que você publica continua sendo seu; você nos concede apenas a licença necessária para hospedá-lo e exibi-lo enquanto usar o serviço.',
    ],
  },
  {
    title: '9. Disponibilidade e responsabilidade',
    paragraphs: [
      'Trabalhamos para manter a plataforma disponível e segura, mas o serviço é fornecido como está, podendo sofrer interrupções para manutenção ou por falhas de terceiros (hospedagem, provedores de pagamento, registradores de domínio).',
      'Na máxima extensão permitida em lei, a LinkBuds não responde por lucros cessantes, perda de dados ou danos indiretos, nem pelo conteúdo publicado pelos usuários. Nossa responsabilidade total fica limitada ao valor pago pela conta nos 12 meses anteriores ao evento.',
    ],
  },
  {
    title: '10. Encerramento',
    paragraphs: [
      'Você pode deixar de usar a LinkBuds a qualquer momento. Podemos encerrar ou suspender contas que violem estes termos ou a legislação. Após o encerramento, as páginas públicas deixam de ser exibidas e os dados podem ser excluídos, exceto quando a lei exigir sua guarda.',
    ],
  },
  {
    title: '11. Alterações destes termos',
    paragraphs: [
      'Podemos atualizar estes termos periodicamente. A data da última atualização aparece no topo desta página. Mudanças relevantes serão comunicadas pelo painel ou por e-mail, e o uso continuado após a atualização significa concordância com a nova versão.',
    ],
  },
  {
    title: '12. Lei aplicável',
    paragraphs: [
      'Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do consumidor, quando aplicável, ou, nos demais casos, o foro da sede da LinkBuds.',
    ],
  },
];

export function TermsPage() {
  return (
    <div className='bg-background text-foreground flex min-h-dvh flex-col'>
      <header className='bg-background/90 sticky top-0 z-30 border-b backdrop-blur'>
        <div className='mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4'>
          <Link
            to={routes.initial}
            className='flex items-center gap-2'
            aria-label='Ir para o início'
          >
            <span className='bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl text-xs font-bold'>
              LB
            </span>
            <span className='text-base font-semibold tracking-tight'>
              LinkBuds
            </span>
          </Link>

          <div className='flex items-center gap-1.5 sm:gap-2'>
            <Button
              asChild
              variant='ghost'
              size='sm'
            >
              <Link to={routes.login}>Entrar</Link>
            </Button>
            <ThemeModeToggle />
          </div>
        </div>
      </header>

      <main className='mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6 md:py-14'>
        <h1 className='mt-8 text-3xl font-semibold tracking-tight'>
          Termos de uso
        </h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Última atualização: {LAST_UPDATED}
        </p>

        <div className='mt-10 space-y-8'>
          {sections.map(({ title, paragraphs }) => (
            <section
              key={title}
              className='space-y-3'
            >
              <h2 className='text-lg font-semibold'>{title}</h2>
              {paragraphs.map((text) => (
                <p
                  key={text}
                  className='text-muted-foreground text-sm leading-relaxed'
                >
                  {text}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <Footer4Col />
    </div>
  );
}
