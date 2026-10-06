import { confirmAction } from '@/resources/components/base';
import { Copy, Link2, Trash2, UserPlus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '@/app/modules/auth/hooks';
import {
  useTeamMutations,
  useTeamUseCase,
} from '@/app/modules/team/use-cases/use-team.use-case';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copiado');
  } catch {
    toast.error('Não foi possível copiar. Copie manualmente.');
  }
}

export function TeamPage() {
  const { data, isLoading } = useTeamUseCase();
  const mutations = useTeamMutations();
  const { userAuthenticated } = useSession();
  const isOwner = userAuthenticated?.role === 'OWNER';
  const [email, setEmail] = useState('');
  const [lastLink, setLastLink] = useState<string | null>(null);

  function shareLink(url: string) {
    setLastLink(url);
    void copyLink(url);
  }

  function handleInvite(event: FormEvent) {
    event.preventDefault();
    mutations.invite.mutate(email, {
      onSuccess: ({ url }) => {
        setEmail('');
        shareLink(url);
      },
    });
  }

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-8'>
      <header>
        <h1 className='text-xl font-semibold tracking-tight'>Equipe</h1>
        <p className='text-muted-foreground text-sm'>
          Pessoas da sua agência que gerenciam as páginas.
        </p>
      </header>

      {isLoading && (
        <p className='text-muted-foreground text-sm'>Carregando...</p>
      )}

      {data && (
        <>
          <section className='bg-card rounded-2xl border p-4'>
            <p className='text-muted-foreground text-sm'>Usuários</p>
            <p className='mt-1 text-xl font-semibold'>
              {data.usage.members + data.usage.pendingInvites} /{' '}
              {data.usage.maxMembers}
            </p>
            <p className='text-muted-foreground text-xs'>
              Convites pendentes ocupam vaga até expirar ou serem revogados.
            </p>
          </section>

          {isOwner && (
            <section className='bg-card rounded-2xl border p-4'>
              <form
                className='flex flex-col gap-2 sm:flex-row sm:items-end'
                onSubmit={handleInvite}
              >
                <div className='grid flex-1 gap-1.5'>
                  <Label htmlFor='invite-email'>Convidar por email</Label>
                  <Input
                    id='invite-email'
                    type='email'
                    required
                    placeholder='pessoa@agencia.com'
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <Button
                  type='submit'
                  disabled={
                    !email ||
                    mutations.invite.isPending ||
                    data.usage.available < 1
                  }
                >
                  <UserPlus className='size-4' />
                  Gerar convite
                </Button>
              </form>
              {data.usage.available < 1 && (
                <p className='text-muted-foreground mt-2 text-xs'>
                  Limite de usuários do plano atingido.
                </p>
              )}
              {lastLink && (
                <div className='bg-muted mt-3 flex items-center gap-2 rounded-xl p-2 text-xs'>
                  <Link2 className='size-4 shrink-0' />
                  <span className='flex-1 truncate'>{lastLink}</span>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => void copyLink(lastLink)}
                  >
                    <Copy className='size-4' />
                    Copiar
                  </Button>
                </div>
              )}
              <p className='text-muted-foreground mt-2 text-xs'>
                Envie o link para a pessoa. Ela entra com o email convidado e o
                link vale por 7 dias.
              </p>
            </section>
          )}

          <section className='bg-card rounded-2xl border'>
            <h2 className='border-b p-4 text-sm font-medium'>Membros</h2>
            <ul className='divide-y'>
              {data.members.map((member) => (
                <li
                  key={member.id}
                  className='flex items-center gap-3 p-4'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>
                      {member.name}
                    </p>
                    <p className='text-muted-foreground truncate text-xs'>
                      {member.email}
                    </p>
                  </div>
                  <span className='text-muted-foreground text-xs'>
                    {member.role === 'OWNER' ? 'Dono' : 'Membro'}
                  </span>
                  {isOwner && member.role !== 'OWNER' && (
                    <Button
                      type='button'
                      size='icon'
                      variant='ghost'
                      aria-label={`Remover ${member.name}`}
                      onClick={async () => {
                        if (
                          await confirmAction({
                            title: `Remover ${member.name} da equipe?`,
                            confirmLabel: 'Remover',
                            destructive: true,
                          })
                        ) {
                          mutations.removeMember.mutate(member.id);
                        }
                      }}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {data.invites.length > 0 && (
            <section className='bg-card rounded-2xl border'>
              <h2 className='border-b p-4 text-sm font-medium'>
                Convites pendentes
              </h2>
              <ul className='divide-y'>
                {data.invites.map((invite) => (
                  <li
                    key={invite.id}
                    className='flex flex-wrap items-center gap-2 p-4'
                  >
                    <div className='w-full min-w-0 sm:w-auto sm:flex-1'>
                      <p className='text-sm break-all'>{invite.email}</p>
                      <p className='text-muted-foreground text-xs'>
                        Expira em{' '}
                        {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {isOwner && (
                      <>
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            mutations.renewInvite.mutate(invite.id, {
                              onSuccess: ({ url }) => shareLink(url),
                            })
                          }
                        >
                          <Copy className='size-4' />
                          Novo link
                        </Button>
                        <Button
                          type='button'
                          size='sm'
                          variant='ghost'
                          onClick={async () => {
                            if (
                              await confirmAction({
                                title: `Revogar convite de ${invite.email}?`,
                                description:
                                  'O link enviado deixa de funcionar.',
                                confirmLabel: 'Revogar',
                                destructive: true,
                              })
                            ) {
                              mutations.revokeInvite.mutate(invite.id);
                            }
                          }}
                        >
                          Revogar
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
