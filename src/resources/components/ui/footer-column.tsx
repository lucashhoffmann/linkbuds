import { Link } from 'react-router-dom';
import { routes } from '@/shared/constants/router.constants';

const footerColumns = [
  {
    title: 'Produto',
    links: [
      { text: 'Entrar', href: routes.login },
      { text: 'Criar conta', href: routes.register },
    ],
  },
  {
    title: 'Legal',
    links: [{ text: 'Termos de uso', href: routes.terms }],
  },
];

export default function Footer4Col() {
  return (
    <footer className='bg-secondary dark:bg-secondary/20 mt-16 w-full rounded-t-xl'>
      <div className='mx-auto max-w-6xl px-4 pt-12 pb-6'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          <div>
            <Link
              to={routes.initial}
              className='flex items-center justify-center gap-2 sm:justify-start'
            >
              <span className='bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl text-xs font-bold'>
                LB
              </span>
              <span className='text-xl font-semibold tracking-tight'>
                LinkBuds
              </span>
            </Link>

            <p className='text-muted-foreground mt-4 max-w-md text-center text-sm leading-relaxed sm:max-w-xs sm:text-left'>
              Links de bio dos seus clientes, links de post e métricas que
              mostram qual publicação gera contato.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2'>
            {footerColumns.map(({ title, links }) => (
              <div
                key={title}
                className='text-center sm:text-left'
              >
                <p className='font-medium'>{title}</p>
                <ul className='mt-4 space-y-3 text-sm'>
                  {links.map(({ text, href }) => (
                    <li key={text}>
                      <Link
                        to={href}
                        className='text-muted-foreground hover:text-foreground transition'
                      >
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='text-muted-foreground mt-10 border-t pt-6 text-center text-sm sm:flex sm:justify-between sm:text-left'>
          <p>&copy; {new Date().getFullYear()} LinkBuds</p>
          <p className='mt-2 sm:mt-0'>Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
