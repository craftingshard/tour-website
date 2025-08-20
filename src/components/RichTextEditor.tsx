import { useEffect, useRef } from 'react'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichTextEditor({ value, onChange, placeholder = 'Nhập nội dung...', minHeight = 160 }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg)
    if (ref.current) onChange(ref.current.innerHTML)
  }

  return (
    <div className="rte-container">
      <div className="rte-toolbar">
        <button type="button" onClick={() => exec('bold')}><b>B</b></button>
        <button type="button" onClick={() => exec('italic')}><i>I</i></button>
        <button type="button" onClick={() => exec('underline')}><u>U</u></button>
        <button type="button" onClick={() => exec('insertUnorderedList')}>• List</button>
        <button type="button" onClick={() => {
          const url = prompt('URL hình ảnh:')
          if (url) exec('insertImage', url)
        }}>🖼️ Ảnh</button>
        <button type="button" onClick={() => {
          const url = prompt('URL liên kết:')
          if (url) exec('createLink', url)
        }}>🔗 Link</button>
        <button type="button" onClick={() => exec('removeFormat')}>🧹 Xóa định dạng</button>
      </div>
      <div
        ref={ref}
        className="rte-editor"
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        style={{ minHeight }}
      />
      <style>{`
        .rte-container { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; }
        .rte-toolbar { display: flex; gap: 6px; padding: 8px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
        .rte-toolbar button { border: 1px solid #e5e7eb; background:#fff; padding: 6px 8px; border-radius:6px; cursor: pointer; }
        .rte-toolbar button:hover { background:#f3f4f6; }
        .rte-editor { padding: 12px; outline: none; }
        .rte-editor:empty::before { content: attr(data-placeholder); color:#9ca3af; }
      `}</style>
    </div>
  )
}


