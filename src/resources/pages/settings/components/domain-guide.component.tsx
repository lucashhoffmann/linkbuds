import { ExternalLink } from 'lucide-react';

type DnsProvider = {
  name: string;
  path: string;
  tips: string[];
  docs: { label: string; url: string }[];
};

const DNS_PROVIDERS: DnsProvider[] = [
  {
    name: 'Registro.br',
    path: 'Domínios → seu domínio → Configurar endereçamento → Modo avançado → Nova entrada → Salvar alterações.',
    tips: [
      'Ative o "Modo avançado" primeiro. Ele leva cerca de 5 minutos para liberar o botão "Nova entrada" (atualize a página).',
      'Não aceita CNAME na raiz: use um subdomínio, como www.suaagencia.com.br.',
    ],
    docs: [
      {
        label: 'Como acessar a zona DNS no Registro.br',
        url: 'https://suporte.hostgator.com.br/hc/pt-br/articles/30816643281811-Como-acessar-a-Zona-DNS-no-Registro-br',
      },
      {
        label: 'Central de ajuda do Registro.br',
        url: 'https://registro.br/ajuda/',
      },
    ],
  },
  {
    name: 'Hostinger',
    path: 'hPanel → Domínios → seu domínio → DNS / Nameservers → Gerenciar registros DNS.',
    tips: [
      'O campo Nome já completa o domínio: digite só "www", "@" ou "_linkbuds".',
      'Na raiz (@), apague antes o registro A com nome "@". Senão aparece o erro "must not be used with A on the same name". O CNAME vira ALIAS sozinho e o e-mail (MX) continua funcionando.',
    ],
    docs: [
      {
        label: 'Como gerenciar registros DNS no hPanel',
        url: 'https://www.hostinger.com/br/support/1583249-como-gerenciar-meus-registros-dns-no-hpanel/',
      },
    ],
  },
  {
    name: 'HostGator',
    path: 'cPanel → Editor de Zona DNS → Gerenciar (no domínio) → Adicionar registro.',
    tips: ['Não aceita CNAME na raiz: use um subdomínio, como www.'],
    docs: [
      {
        label: 'Como criar ou alterar um registro na zona DNS',
        url: 'https://suporte.hostgator.com.br/hc/pt-br/articles/30813120385427-Como-criar-ou-alterar-um-registro-A-MX-TXT-CNAME-e-outros-na-Zona-DNS',
      },
    ],
  },
  {
    name: 'GoDaddy',
    path: 'Portfólio de domínios → seu domínio → DNS → Adicionar novo registro.',
    tips: [
      'O Nome vai sem o domínio (ex.: "www" ou "_linkbuds.www").',
      'Não aceita CNAME na raiz: use www e, se quiser, o Encaminhamento da GoDaddy da raiz para o www.',
    ],
    docs: [
      {
        label: 'Adicionar um registro CNAME',
        url: 'https://www.godaddy.com/pt-br/help/add-a-cname-record-19236',
      },
      {
        label: 'Editar um registro TXT',
        url: 'https://www.godaddy.com/pt-br/help/edit-a-txt-record-19233',
      },
    ],
  },
  {
    name: 'Locaweb',
    path: 'Hospedagem → domínio → ⋮ → Zona de DNS → Administrar → Adicionar entrada → Salvar configurações.',
    tips: [
      'Clique em "Salvar configurações" no fim: sem isso as entradas não são criadas.',
      'Prefira um subdomínio (www) em vez da raiz.',
    ],
    docs: [
      {
        label: 'Como configurar a zona DNS na Locaweb',
        url: 'https://www.locaweb.com.br/ajuda/wiki/como-configurar-a-zona-de-dns-locaweb-email-locaweb/',
      },
    ],
  },
];

const NAME_EXAMPLES = [
  { domain: 'www.suaagencia.com.br', txt: '_linkbuds.www', cname: 'www' },
  { domain: 'links.suaagencia.com.br', txt: '_linkbuds.links', cname: 'links' },
  { domain: 'suaagencia.com.br (raiz)', txt: '_linkbuds', cname: '@' },
];

const COMMON_ERRORS = [
  {
    problem:
      '"must not be used with A on the same name" ou "já existe um registro"',
    fix: 'Já existe um registro A (ou CNAME) com esse nome. Apague-o e crie o CNAME de novo.',
  },
  {
    problem: 'O nome ficou duplicado (www.suaagencia.com.br.suaagencia.com.br)',
    fix: 'O provedor completa o domínio sozinho. Digite só a parte antes dele.',
  },
  {
    problem: 'Usa Cloudflare',
    fix: 'Deixe o CNAME com a nuvem cinza ("Somente DNS"). Com o proxy laranja, a verificação falha.',
  },
  {
    problem: 'Criei tudo e continua "Aguardando DNS"',
    fix: 'A propagação costuma levar minutos, mas pode chegar a 24h (no Registro.br, até 72h). Confira os valores e clique em Verificar mais tarde.',
  },
];

export function DomainGuide() {
  return (
    <section className='bg-card flex flex-col gap-4 rounded-2xl border p-4 text-sm'>
      <div>
        <h2 className='font-semibold'>Como configurar</h2>
        <p className='text-muted-foreground'>
          O registro DNS é criado no site onde você comprou o domínio, não no
          LinkBuds.
        </p>
      </div>

      <ol className='flex list-decimal flex-col gap-1 pl-5'>
        <li>Salve o domínio acima para ver os dois registros.</li>
        <li>
          Entre no painel do provedor do domínio e abra a zona DNS (veja o seu
          provedor abaixo).
        </li>
        <li>
          Crie o registro TXT (prova que o domínio é seu) e o CNAME (faz o
          domínio abrir as suas páginas).
        </li>
        <li>Volte aqui e clique em Verificar.</li>
      </ol>

      <div className='bg-muted/40 rounded-md p-3'>
        <p className='font-medium'>Use um subdomínio (recomendado)</p>
        <p className='text-muted-foreground'>
          Prefira <code>www</code> ou <code>links</code>. A raiz do domínio (sem
          nada antes) não aceita CNAME na maioria dos provedores, e trocar o
          registro dela pode tirar do ar um site que já esteja lá.
        </p>
      </div>

      <div>
        <p className='font-medium'>O que digitar no campo Nome</p>
        <p className='text-muted-foreground text-xs'>
          A maioria dos provedores completa o domínio sozinho.
        </p>
        <div className='mt-2 overflow-x-auto'>
          <table className='w-full text-left text-xs'>
            <thead className='text-muted-foreground'>
              <tr>
                <th className='py-1 pr-3 font-medium'>Seu domínio</th>
                <th className='py-1 pr-3 font-medium'>Nome do TXT</th>
                <th className='py-1 font-medium'>Nome do CNAME</th>
              </tr>
            </thead>
            <tbody>
              {NAME_EXAMPLES.map((example) => (
                <tr
                  key={example.domain}
                  className='border-t'
                >
                  <td className='py-1.5 pr-3 break-all'>{example.domain}</td>
                  <td className='py-1.5 pr-3'>
                    <code>{example.txt}</code>
                  </td>
                  <td className='py-1.5'>
                    <code>{example.cname}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <p className='font-medium'>Passo a passo por provedor</p>
        {DNS_PROVIDERS.map((provider) => (
          <details
            key={provider.name}
            className='rounded-md border px-3 py-2'
          >
            <summary className='cursor-pointer font-medium'>
              {provider.name}
            </summary>
            <div className='mt-2 flex flex-col gap-2'>
              <p>{provider.path}</p>
              <ul className='text-muted-foreground flex list-disc flex-col gap-1 pl-5'>
                {provider.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <div className='flex flex-col gap-1'>
                {provider.docs.map((doc) => (
                  <a
                    key={doc.url}
                    href={doc.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary inline-flex w-fit items-center gap-1 hover:underline'
                  >
                    {doc.label}
                    <ExternalLink className='size-3.5' />
                  </a>
                ))}
              </div>
            </div>
          </details>
        ))}
        <p className='text-muted-foreground text-xs'>
          Outro provedor? Procure por "zona DNS" ou "gerenciar DNS" no painel
          dele. Os registros são os mesmos.
        </p>
      </div>

      <div className='flex flex-col gap-2'>
        <p className='font-medium'>Erros comuns</p>
        <dl className='flex flex-col gap-2'>
          {COMMON_ERRORS.map((error) => (
            <div key={error.problem}>
              <dt>{error.problem}</dt>
              <dd className='text-muted-foreground'>{error.fix}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
