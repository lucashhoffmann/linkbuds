const demoLinks = ['Instagram', 'Meu portfólio', 'Fale comigo'];

/** Loading state that doubles as a tiny LinkBuds demo: one link, everything inside. */
export function PublicLinkPageLoader() {
  return (
    <main
      role='status'
      aria-label='Carregando página'
      className='flex min-h-dvh flex-col items-center justify-center gap-6 bg-slate-100 p-5'
    >
      <div className='w-48 rounded-[2rem] border-4 border-slate-800 bg-white p-4 shadow-xl'>
        <div className='mx-auto size-12 animate-pulse rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-400' />
        <div className='mx-auto mt-2 h-2 w-20 rounded-full bg-slate-200' />
        <ul className='mt-4 space-y-2'>
          {demoLinks.map((label, index) => (
            <li
              key={label}
              style={{ animationDelay: `${index * 180}ms` }}
              className='motion-safe:animate-lb-link relative rounded-lg bg-slate-800 py-2 text-center text-[11px] font-medium text-white'
            >
              {label}
              {index === 1 && (
                <span className='absolute top-1/2 right-4 size-5 -translate-y-1/2'>
                  <span className='motion-safe:animate-lb-tap block size-full rounded-full bg-violet-400' />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <p className='text-center text-sm text-slate-600'>
        <span className='font-semibold text-slate-800'>LinkBuds</span> · um
        link, tudo o que você é
      </p>
    </main>
  );
}
