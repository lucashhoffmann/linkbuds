import { confirmAction } from '@/resources/components/base';
import {
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, GripVertical, MousePointerClick, Pencil } from 'lucide-react';
import {
  useLinkPageMutations,
  useLinkPreviewUseCase,
} from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  LinkPageDetail,
  LinkPageLink,
  LinkPageLinkKind,
  LinkPageLinkPlacement,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { cn } from '@/shared/lib/utils';
import type { LinkClickCountMap, LinkFormValues } from './editor.types';
import {
  defaultLinkStyle,
  whatsAppLinkStyle,
  createLinkForm,
  formatNumber,
  reorderLinksForDrop,
} from './editor.utils';
import {
  ColorField,
  BorderEnabledField,
  EditorSection,
} from './editor-fields.component';

export function LinksManager({
  clicksByLinkId,
  draft,
  mutations,
  setDraft,
}: {
  clicksByLinkId: LinkClickCountMap;
  draft: LinkPageDetail;
  mutations: ReturnType<typeof useLinkPageMutations>;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkPageLink | null>(null);
  const [linkForm, setLinkForm] = useState<LinkFormValues>(() =>
    createLinkForm(),
  );
  const linkPreview = useLinkPreviewUseCase();
  // Last URL whose preview was fetched: blur only refetches when it changed.
  const previewUrlRef = useRef<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    setEditingLink(null);
  };

  const openNewLinkDialog = () => {
    setEditingLink(null);
    previewUrlRef.current = null;
    linkPreview.reset();
    setLinkForm(createLinkForm());
    setLinkDialogOpen(true);
  };

  const openEditLinkDialog = (link: LinkPageLink) => {
    setEditingLink(link);
    previewUrlRef.current = link.url;
    linkPreview.reset();
    setLinkForm({
      placement: link.placement,
      kind: link.kind,
      label: link.label,
      url: link.url,
      contactType: link.contactType,
      contactValue: link.contactValue,
      previewImageUrl: link.previewImageUrl ?? null,
      previewDescription: link.previewDescription ?? null,
      textColor: link.textColor,
      backgroundColor: link.backgroundColor,
      borderColor: link.borderColor,
      borderEnabled: link.borderEnabled,
    });
    setLinkDialogOpen(true);
  };

  const updateLinkForm = (values: Partial<LinkFormValues>) => {
    setLinkForm((current) => ({ ...current, ...values }));
  };

  const handleKindChange = (kind: LinkPageLinkKind) => {
    setLinkForm((current) => {
      const value = current.url ?? current.contactValue ?? '';
      const style = kind === 'CONTACT' ? whatsAppLinkStyle : defaultLinkStyle;

      return {
        ...current,
        ...style,
        kind,
        // Preview cards don't fit the small horizontal tiles.
        placement: kind === 'PREVIEW' ? 'VERTICAL' : current.placement,
        url: kind === 'CONTACT' ? null : value,
        contactType: kind === 'CONTACT' ? 'WHATSAPP' : null,
        contactValue: kind === 'CONTACT' ? value : null,
      };
    });
  };

  const loadPreview = async (force = false) => {
    const url = linkForm.url?.trim();

    if (
      linkForm.kind !== 'PREVIEW' ||
      !url ||
      (!force && url === previewUrlRef.current)
    ) {
      return;
    }

    previewUrlRef.current = url;
    try {
      const preview = await linkPreview.mutateAsync(url);
      // Fills what the site has; every field stays editable.
      setLinkForm((current) =>
        current.url?.trim() !== url
          ? current
          : {
              ...current,
              label: current.label || preview.title || '',
              previewDescription:
                preview.description ?? current.previewDescription,
              previewImageUrl: preview.imageUrl ?? current.previewImageUrl,
            },
      );
    } catch {
      return;
    }
  };

  // Archived = inactive: hidden from the public page, kept for later.
  const setLinkActive = async (link: LinkPageLink, active: boolean) => {
    try {
      await mutations.updateLink.mutateAsync({
        linkId: link.id,
        payload: { active },
      });
      setDraft((current) => ({
        ...current,
        links: current.links.map((item) =>
          item.id === link.id ? { ...item, active } : item,
        ),
      }));
    } catch {
      return;
    }
  };

  const removeLink = async (link: LinkPageLink) => {
    if (
      await confirmAction({
        title: `Excluir "${link.label}"?`,
        description: 'Essa ação não pode ser desfeita.',
        confirmLabel: 'Excluir',
        destructive: true,
      })
    ) {
      mutations.deleteLink.mutate(link.id);
    }
  };

  const activeLinks = draft.links.filter((link) => link.active);
  const archivedLinks = draft.links.filter((link) => !link.active);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingLink) {
        await mutations.updateLink.mutateAsync({
          linkId: editingLink.id,
          payload: linkForm,
        });
        setDraft((current) => ({
          ...current,
          links: current.links.map((link) =>
            link.id === editingLink.id ? { ...link, ...linkForm } : link,
          ),
        }));
      } else {
        await mutations.createLink.mutateAsync({
          ...linkForm,
          sortOrder: draft.links.length,
          active: true,
        });
      }
      closeLinkDialog();
    } catch {
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const reorderedLinks = reorderLinksForDrop(
      draft.links,
      String(active.id),
      String(over.id),
    );

    if (reorderedLinks === draft.links) {
      return;
    }

    setDraft((current) => ({
      ...current,
      links: reorderedLinks,
    }));
    mutations.reorderLinks.mutate(
      reorderedLinks.map((link) => ({
        id: link.id,
        sortOrder: link.sortOrder,
      })),
    );
  };

  return (
    <EditorSection
      title='Links'
      action={<Button onClick={openNewLinkDialog}>Adicionar link</Button>}
    >
      <Dialog
        open={linkDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeLinkDialog();
          else setLinkDialogOpen(true);
        }}
      >
        <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>
              {editingLink ? 'Editar link' : 'Adicionar link'}
            </DialogTitle>
          </DialogHeader>
          <form
            className='grid gap-4'
            onSubmit={submit}
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='link-placement'>Posição</Label>
                <select
                  id='link-placement'
                  className='border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring h-12 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none'
                  value={linkForm.placement}
                  disabled={linkForm.kind === 'PREVIEW'}
                  onChange={(event) =>
                    updateLinkForm({
                      placement: event.target.value as LinkPageLinkPlacement,
                    })
                  }
                >
                  <option value='VERTICAL'>Vertical</option>
                  <option value='HORIZONTAL'>Horizontal</option>
                </select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='link-kind'>Tipo</Label>
                <select
                  id='link-kind'
                  className='border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring h-12 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none'
                  value={linkForm.kind}
                  onChange={(event) =>
                    handleKindChange(event.target.value as LinkPageLinkKind)
                  }
                >
                  <option value='LINK'>Link</option>
                  <option value='PREVIEW'>Link com prévia</option>
                  <option value='CONTACT'>WhatsApp</option>
                </select>
              </div>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='link-label'>
                {linkForm.kind === 'PREVIEW' ? 'Título' : 'Rótulo'}
              </Label>
              <Input
                id='link-label'
                value={linkForm.label}
                onChange={(event) =>
                  updateLinkForm({ label: event.target.value })
                }
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='link-value'>
                {linkForm.kind === 'CONTACT' ? 'WhatsApp com DDD' : 'URL'}
              </Label>
              <Input
                id='link-value'
                value={
                  linkForm.kind === 'CONTACT'
                    ? (linkForm.contactValue ?? '')
                    : (linkForm.url ?? '')
                }
                onChange={(event) =>
                  updateLinkForm(
                    linkForm.kind === 'CONTACT'
                      ? { contactValue: event.target.value }
                      : { url: event.target.value },
                  )
                }
                onBlur={() => void loadPreview()}
                required
              />
            </div>
            {linkForm.kind === 'PREVIEW' && (
              <div className='bg-muted/20 grid gap-4 rounded-md border p-3'>
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-sm font-medium'>Prévia</p>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    disabled={!linkForm.url?.trim() || linkPreview.isLoading}
                    onClick={() => void loadPreview(true)}
                  >
                    {linkPreview.isLoading ? 'Buscando...' : 'Buscar do site'}
                  </Button>
                </div>
                {linkPreview.isError && (
                  <p className='text-muted-foreground text-xs'>
                    Não foi possível ler a prévia desse site. Preencha os campos
                    abaixo manualmente.
                  </p>
                )}
                <div className='grid gap-2'>
                  <Label htmlFor='link-preview-description'>Descrição</Label>
                  <textarea
                    id='link-preview-description'
                    className='border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none'
                    maxLength={300}
                    value={linkForm.previewDescription ?? ''}
                    onChange={(event) =>
                      updateLinkForm({
                        previewDescription: event.target.value || null,
                      })
                    }
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='link-preview-image'>URL da imagem</Label>
                  <div className='flex items-center gap-2'>
                    {linkForm.previewImageUrl && (
                      <img
                        src={linkForm.previewImageUrl}
                        alt=''
                        className='size-12 shrink-0 rounded-md border object-cover'
                      />
                    )}
                    <Input
                      id='link-preview-image'
                      value={linkForm.previewImageUrl ?? ''}
                      onChange={(event) =>
                        updateLinkForm({
                          previewImageUrl: event.target.value.trim() || null,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
            <div className='bg-muted/20 grid gap-4 rounded-md border p-3'>
              <p className='text-sm font-medium'>Aparência</p>
              <div className='grid gap-3 sm:grid-cols-2'>
                <ColorField
                  label='Cor do texto'
                  value={linkForm.textColor}
                  onChange={(textColor) => updateLinkForm({ textColor })}
                />
                <ColorField
                  label='Cor do fundo'
                  value={linkForm.backgroundColor}
                  onChange={(backgroundColor) =>
                    updateLinkForm({ backgroundColor })
                  }
                />
                <ColorField
                  label='Cor da borda'
                  value={linkForm.borderColor}
                  onChange={(borderColor) => updateLinkForm({ borderColor })}
                />
                <div className='flex items-end'>
                  <BorderEnabledField
                    checked={linkForm.borderEnabled}
                    onChange={(borderEnabled) =>
                      updateLinkForm({ borderEnabled })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter className='bg-background sticky -bottom-6 -mx-6 -mb-6 border-t px-6 py-4'>
              <Button
                type='button'
                variant='outline'
                onClick={closeLinkDialog}
              >
                Cancelar
              </Button>
              <Button type='submit'>
                {editingLink ? 'Salvar alterações' : 'Adicionar link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {activeLinks.length ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeLinks.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='grid gap-2'>
              {activeLinks.map((link) => (
                <SortableLinkRow
                  key={link.id}
                  clicks={clicksByLinkId[link.id] ?? 0}
                  link={link}
                  onArchive={() => void setLinkActive(link, false)}
                  onEdit={() => openEditLinkDialog(link)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
          Nenhum link ativo.
        </p>
      )}
      {archivedLinks.length > 0 && (
        <div className='grid gap-2'>
          <p className='text-muted-foreground text-xs font-medium'>
            Arquivados ({archivedLinks.length}) · não aparecem na página
          </p>
          {archivedLinks.map((link) => (
            <div
              key={link.id}
              className='bg-muted/40 flex min-w-0 items-center gap-2 rounded-md border p-2 text-sm'
            >
              <p className='text-muted-foreground min-w-0 flex-1 truncate'>
                {link.label}
              </p>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => void setLinkActive(link, true)}
              >
                Restaurar
              </Button>
              <Button
                type='button'
                size='sm'
                variant='ghost'
                onClick={() => removeLink(link)}
              >
                Excluir
              </Button>
            </div>
          ))}
        </div>
      )}
    </EditorSection>
  );
}

export function SortableLinkRow({
  clicks,
  link,
  onArchive,
  onEdit,
}: {
  clicks?: number;
  link: LinkPageLink;
  onArchive: () => void;
  onEdit: () => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: link.id });
  const detail =
    link.kind === 'CONTACT'
      ? 'WhatsApp'
      : link.kind === 'PREVIEW'
        ? `Prévia · ${link.url}`
        : link.url;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'bg-background flex min-w-0 items-center gap-2 rounded-md border p-2 text-sm shadow-xs',
        isDragging && 'relative z-10 opacity-70',
      )}
    >
      <button
        type='button'
        className='text-muted-foreground hover:bg-accent flex size-9 cursor-grab items-center justify-center rounded-md transition-colors active:cursor-grabbing'
        aria-label={`Arrastar ${link.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className='size-4' />
      </button>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{link.label}</p>
        <div className='text-muted-foreground mt-1 flex min-w-0 items-center gap-2 text-xs'>
          <span className='hidden min-w-0 truncate sm:inline'>
            {link.placement === 'VERTICAL' ? 'Vertical' : 'Horizontal'} ·{' '}
            {detail}
          </span>
          {clicks !== undefined && (
            <span className='inline-flex shrink-0 items-center gap-1'>
              <MousePointerClick
                className='size-3'
                aria-hidden='true'
              />
              {formatNumber(clicks)} {clicks === 1 ? 'clique' : 'cliques'}
            </span>
          )}
        </div>
      </div>
      {/* Icon-only below `sm` so the label keeps the room on phones. */}
      <div className='flex shrink-0 items-center gap-1'>
        <Button
          type='button'
          size='sm'
          variant='outline'
          aria-label='Editar'
          className='size-9 px-0 sm:w-auto sm:px-3'
          onClick={onEdit}
        >
          <Pencil className='size-4 sm:hidden' />
          <span className='hidden sm:inline'>Editar</span>
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          aria-label='Arquivar'
          className='size-9 px-0 sm:w-auto sm:px-3'
          onClick={onArchive}
        >
          <Archive className='size-4 sm:hidden' />
          <span className='hidden sm:inline'>Arquivar</span>
        </Button>
      </div>
    </div>
  );
}
