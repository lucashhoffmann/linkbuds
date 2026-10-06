import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Bold, Italic, RemoveFormatting } from 'lucide-react';
import type {
  TextRun,
  TextRunSize,
} from '@/app/modules/link-pages/types/link-pages.types';
import {
  domToTextRuns,
  execFontSize,
  textRunSizeOptions,
  textRunStyle,
} from '@/app/modules/link-pages/utils/text-runs.util';
import { Button } from '@/resources/components/ui/button';
import { ColorPicker } from '@/resources/components/ui/color-picker';

const selectClassName =
  'border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring h-12 rounded-md border px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none';

/**
 * contentEditable + execCommand: no editor lib. Formatting applies to the
 * selection; the DOM is read back into runs on every input, so only plain
 * text + known styles ever leave this component.
 */
// ponytail: execCommand is deprecated but still shipped by every browser; swap for a lib (Tiptap) if it ever breaks.
export function RichTextEditor({
  editorStyle,
  initialContent,
  onChange,
}: {
  /** Block-level look (alignment, background) so the editor previews it. */
  editorStyle?: CSSProperties;
  initialContent: TextRun[];
  onChange: (runs: TextRun[]) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Toolbar popovers steal focus; keep the last selection inside the editor.
  const rangeRef = useRef<Range | null>(null);
  const [color, setColor] = useState('#111827');
  const [size, setSize] = useState<TextRunSize>('MD');

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.replaceChildren(
      ...initialContent.map((run) => {
        const span = document.createElement('span');
        Object.assign(span.style, textRunStyle(run));
        span.textContent = run.text;
        return span;
      }),
    );
    // Mount only: the editor owns its DOM afterwards.
  }, []);

  const saveRange = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection?.rangeCount || !editor) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      rangeRef.current = range.cloneRange();
    }
  };

  const emit = () => {
    if (editorRef.current) onChange(domToTextRuns(editorRef.current));
  };

  const run = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    if (rangeRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(rangeRef.current);
    }
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    saveRange();
    emit();
  };

  return (
    <div className='grid gap-2'>
      <div
        role='toolbar'
        aria-label='Formatação'
        className='flex flex-wrap items-center gap-2'
      >
        {/* mousedown preventDefault keeps the selection on the editor. */}
        <Button
          type='button'
          variant='outline'
          className='size-12 px-0'
          aria-label='Negrito'
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => run('bold')}
        >
          <Bold className='size-4' />
        </Button>
        <Button
          type='button'
          variant='outline'
          className='size-12 px-0'
          aria-label='Itálico'
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => run('italic')}
        >
          <Italic className='size-4' />
        </Button>
        <ColorPicker
          label='Cor do texto'
          value={color}
          onChange={(value) => {
            setColor(value);
            run('foreColor', value);
          }}
        />
        <select
          aria-label='Tamanho do texto'
          className={selectClassName}
          value={size}
          onChange={(event) => {
            const value = event.target.value as TextRunSize;
            setSize(value);
            run('fontSize', execFontSize[value]);
          }}
        >
          {textRunSizeOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <Button
          type='button'
          variant='outline'
          className='size-12 px-0'
          aria-label='Limpar formatação'
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => run('removeFormat')}
        >
          <RemoveFormatting className='size-4' />
        </Button>
      </div>
      <div
        ref={editorRef}
        role='textbox'
        aria-multiline='true'
        aria-label='Texto'
        contentEditable
        suppressContentEditableWarning
        className='border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring min-h-32 rounded-md border px-3 py-2 text-base leading-relaxed break-words whitespace-pre-wrap text-slate-950 shadow-xs focus-visible:ring-[3px] focus-visible:outline-none'
        style={editorStyle}
        onInput={emit}
        onKeyUp={saveRange}
        onMouseUp={saveRange}
        onBlur={saveRange}
        onPaste={(event) => {
          // Plain text only: pasted markup would bring styles we can't store.
          event.preventDefault();
          document.execCommand(
            'insertText',
            false,
            event.clipboardData.getData('text/plain'),
          );
        }}
      />
      <p className='text-muted-foreground text-xs'>
        Selecione um trecho e aplique negrito, itálico, cor ou tamanho.
      </p>
    </div>
  );
}
