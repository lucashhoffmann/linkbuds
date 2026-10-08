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
import {
  Archive,
  Film,
  GripVertical,
  ImageIcon,
  MousePointerClick,
  Pencil,
  Trash2,
  Type,
} from 'lucide-react';
import {
  useLinkPageMutations,
  useLinkPreviewUseCase,
} from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  LinkPageDetail,
  LinkPageImage,
  LinkPageLink,
  LinkPageVideo,
  LinkPageText,
  LinkPageLinkKind,
  LinkPageLinkAlign,
  LinkPageLinkPlacement,
  LinkPageLinkShape,
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
import {
  contentKey,
  nextSortOrder,
  orderContent,
  type ContentItem,
} from '@/app/modules/link-pages/utils/content-order.util';
import { mediaSizeOptions } from '@/app/modules/link-pages/utils/media.util';
import { textRunsToPlain } from '@/app/modules/link-pages/utils/text-runs.util';
import { cn } from '@/shared/lib/utils';
import type { LinkClickCountMap, LinkFormValues } from './editor.types';
import {
  defaultLinkStyle,
  whatsAppLinkStyle,
  createLinkForm,
  formatNumber,
  applyContentOrder,
  reorderContentForDrop,
} from './editor.utils';
import {
  ImageDialog,
  TextDialog,
  VideoDialog,
  type ImagePayload,
  type TextPayload,
  type VideoPayload,
} from './media-dialogs.component';
import {
  ColorField,
  BorderEnabledField,
  EditorSection,
  MediaSizeField,
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
  // null = closed; { video: null } = new video.
  const [videoDialog, setVideoDialog] = useState<{
    video: LinkPageVideo | null;
  } | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  // null = closed; { text: null } = new text block.
  const [textDialog, setTextDialog] = useState<{
    text: LinkPageText | null;
  } | null>(null);
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
      displaySize: link.displaySize ?? 'MEDIUM',
      customHeight: link.customHeight ?? null,
      textColor: link.textColor,
      backgroundColor: link.backgroundColor,
      borderColor: link.borderColor,
      borderEnabled: link.borderEnabled,
      shape: link.shape ?? 'ROUNDED',
      align: link.align ?? 'LEFT',
      fullWidth: link.fullWidth ?? false,
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
  // One draggable list: links, images, videos and texts share the page order.
  const contentItems = orderContent(
    activeLinks,
    draft.images,
    draft.videos,
    draft.texts,
  );

  const saveText = async (payload: TextPayload) => {
    const editing = textDialog?.text;
    if (!editing) {
      await mutations.createText.mutateAsync({
        ...payload,
        sortOrder: nextSortOrder(draft),
        active: true,
      });
      return;
    }

    await mutations.updateText.mutateAsync({ textId: editing.id, payload });
    // Same count = no editor remount, so sync the local draft here.
    setDraft((current) => ({
      ...current,
      texts: current.texts?.map((text) =>
        text.id === editing.id ? { ...text, ...payload } : text,
      ),
    }));
  };

  const saveVideo = async (payload: VideoPayload) => {
    const editing = videoDialog?.video;
    if (!editing) {
      await mutations.createVideo.mutateAsync({
        ...payload,
        sortOrder: nextSortOrder(draft),
        active: true,
      });
      return;
    }

    await mutations.updateVideo.mutateAsync({ videoId: editing.id, payload });
    // Same count = no editor remount, so sync the local draft here.
    setDraft((current) => ({
      ...current,
      videos: current.videos.map((video) =>
        video.id === editing.id ? { ...video, ...payload } : video,
      ),
    }));
  };

  const saveImage = async (payload: ImagePayload) => {
    await mutations.createImage.mutateAsync({
      ...payload,
      sortOrder: nextSortOrder(draft),
      active: true,
    });
  };

  const removeMedia = async (entry: ContentItem) => {
    const titles = {
      VIDEO: 'Excluir vídeo?',
      TEXT: 'Excluir texto?',
      IMAGE: 'Excluir imagem?',
      LINK: '',
    };
    if (
      await confirmAction({
        title: titles[entry.type],
        description: 'Essa ação não pode ser desfeita.',
        confirmLabel: 'Excluir',
        destructive: true,
      })
    ) {
      if (entry.type === 'VIDEO') mutations.deleteVideo.mutate(entry.item.id);
      else if (entry.type === 'TEXT')
        mutations.deleteText.mutate(entry.item.id);
      else mutations.deleteImage.mutate(entry.item.id);
    }
  };

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
          sortOrder: nextSortOrder(draft),
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

    const reordered = reorderContentForDrop(
      contentItems,
      String(active.id),
      String(over.id),
    );

    if (reordered === contentItems) {
      return;
    }

    setDraft((current) => applyContentOrder(current, reordered));
    mutations.reorderContent.mutate(
      reordered.map((entry) => ({
        type: entry.type,
        id: entry.item.id,
        sortOrder: entry.item.sortOrder,
      })),
    );
  };

  return (
    <EditorSection
      title='Links e mídia'
      action={
        <div className='flex flex-wrap justify-end gap-2'>
          <Button onClick={openNewLinkDialog}>Adicionar link</Button>
          <Button
            variant='outline'
            onClick={() => setImageDialogOpen(true)}
          >
            <ImageIcon className='size-4' />
            Imagem
          </Button>
          <Button
            variant='outline'
            onClick={() => setVideoDialog({ video: null })}
          >
            <Film className='size-4' />
            Vídeo
          </Button>
          <Button
            variant='outline'
            onClick={() => setTextDialog({ text: null })}
          >
            <Type className='size-4' />
            Texto
          </Button>
        </div>
      }
    >
      {videoDialog && (
        <VideoDialog
          video={videoDialog.video}
          onSave={saveVideo}
          onClose={() => setVideoDialog(null)}
        />
      )}
      {textDialog && (
        <TextDialog
          text={textDialog.text}
          onSave={saveText}
          onClose={() => setTextDialog(null)}
        />
      )}
      {imageDialogOpen && (
        <ImageDialog
          onSave={saveImage}
          onClose={() => setImageDialogOpen(false)}
        />
      )}
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
                <MediaSizeField
                  id='link-preview'
                  size={linkForm.displaySize ?? 'MEDIUM'}
                  customHeight={linkForm.customHeight ?? null}
                  onChange={({ size, customHeight }) =>
                    updateLinkForm({ displaySize: size, customHeight })
                  }
                />
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
                <div className='grid gap-2'>
                  <Label htmlFor='link-shape'>Formato</Label>
                  <select
                    id='link-shape'
                    className='border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring h-12 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none'
                    value={linkForm.shape ?? 'ROUNDED'}
                    onChange={(event) =>
                      updateLinkForm({
                        shape: event.target.value as LinkPageLinkShape,
                      })
                    }
                  >
                    <option value='PILL'>Pílula</option>
                    <option value='ROUNDED'>Arredondado</option>
                    <option value='SQUARE'>Reto</option>
                  </select>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='link-align'>Alinhamento</Label>
                  <select
                    id='link-align'
                    className='border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring h-12 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none'
                    value={linkForm.align ?? 'LEFT'}
                    onChange={(event) =>
                      updateLinkForm({
                        align: event.target.value as LinkPageLinkAlign,
                      })
                    }
                  >
                    <option value='CENTER'>Centro</option>
                    <option value='LEFT'>Esquerda</option>
                  </select>
                </div>
                {linkForm.placement === 'HORIZONTAL' && (
                  <div className='flex items-end'>
                    <BorderEnabledField
                      label='Preencher toda a largura'
                      checked={linkForm.fullWidth ?? false}
                      onChange={(fullWidth) => updateLinkForm({ fullWidth })}
                    />
                  </div>
                )}
              </div>
              {linkForm.kind !== 'PREVIEW' && (
                <MediaSizeField
                  id='link'
                  size={linkForm.displaySize ?? 'MEDIUM'}
                  customHeight={linkForm.customHeight ?? null}
                  onChange={({ size, customHeight }) =>
                    updateLinkForm({ displaySize: size, customHeight })
                  }
                />
              )}
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
      {contentItems.length ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={contentItems.map(contentKey)}
            strategy={verticalListSortingStrategy}
          >
            <div className='grid gap-2'>
              {contentItems.map((entry) =>
                entry.type === 'LINK' ? (
                  <SortableLinkRow
                    key={contentKey(entry)}
                    clicks={clicksByLinkId[entry.item.id] ?? 0}
                    link={entry.item}
                    onArchive={() => void setLinkActive(entry.item, false)}
                    onEdit={() => openEditLinkDialog(entry.item)}
                  />
                ) : (
                  <SortableMediaRow
                    key={contentKey(entry)}
                    entry={entry}
                    onEdit={
                      entry.type === 'VIDEO'
                        ? () => setVideoDialog({ video: entry.item })
                        : entry.type === 'TEXT'
                          ? () => setTextDialog({ text: entry.item })
                          : undefined
                    }
                    onRemove={() => void removeMedia(entry)}
                  />
                ),
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
          Nenhum link, imagem, vídeo ou texto ativo.
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
                variant='destructive'
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
  } = useSortable({ id: contentKey({ type: 'LINK', item: link }) });
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
      <DragHandle
        label={link.label}
        {...attributes}
        {...listeners}
      />
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
          variant='info'
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

export function DragHandle({
  label,
  ...props
}: { label: string } & Record<string, unknown>) {
  return (
    <button
      type='button'
      className='text-muted-foreground hover:bg-accent flex size-9 shrink-0 cursor-grab items-center justify-center rounded-md transition-colors active:cursor-grabbing'
      aria-label={`Arrastar ${label}`}
      {...props}
    >
      <GripVertical className='size-4' />
    </button>
  );
}

function mediaRowText(entry: Exclude<ContentItem, { type: 'LINK' }>) {
  if (entry.type === 'IMAGE') {
    const image: LinkPageImage = entry.item;
    return {
      title: image.altText || 'Imagem',
      detail: `Imagem · ${image.imageUrl}`,
    };
  }

  if (entry.type === 'TEXT') {
    const plain = textRunsToPlain(entry.item.content).replace(/\s+/g, ' ');
    return { title: plain.trim() || 'Texto', detail: 'Texto' };
  }

  const video = entry.item;
  const size =
    mediaSizeOptions.find((option) => option.value === video.size)?.label +
    (video.size === 'CUSTOM' ? ` ${video.customHeight}px` : '');
  return {
    title: video.title || 'Vídeo',
    detail: [
      'Vídeo',
      size,
      video.autoplay && 'autoplay',
      !video.controls && 'sem controles',
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

function SortableMediaRow({
  entry,
  onEdit,
  onRemove,
}: {
  entry: Exclude<ContentItem, { type: 'LINK' }>;
  onEdit?: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: contentKey(entry) });
  const { title, detail } = mediaRowText(entry);
  const Icon =
    entry.type === 'VIDEO' ? Film : entry.type === 'TEXT' ? Type : ImageIcon;

  return (
    <div
      ref={setNodeRef}
      data-testid={`content-row-${entry.type.toLowerCase()}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'bg-background flex min-w-0 items-center gap-2 rounded-md border p-2 text-sm shadow-xs',
        isDragging && 'relative z-10 opacity-70',
      )}
    >
      <DragHandle
        label={title}
        {...attributes}
        {...listeners}
      />
      <Icon
        className='text-muted-foreground size-4 shrink-0'
        aria-hidden='true'
      />
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{title}</p>
        <p className='text-muted-foreground mt-1 truncate text-xs'>{detail}</p>
      </div>
      <div className='flex shrink-0 items-center gap-1'>
        {onEdit && (
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
        )}
        <Button
          type='button'
          size='sm'
          variant='destructive'
          aria-label='Excluir'
          className='size-9 px-0 sm:w-auto sm:px-3'
          onClick={onRemove}
        >
          <Trash2 className='size-4 sm:hidden' />
          <span className='hidden sm:inline'>Excluir</span>
        </Button>
      </div>
    </div>
  );
}
