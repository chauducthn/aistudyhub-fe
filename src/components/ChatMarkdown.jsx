import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

/**
 * Render Markdown cho tin nhắn chatbot: hỗ trợ heading, list, bảng (GFM),
 * code block (syntax highlight), inline code, và blockquote (trích dẫn tài liệu).
 * react-markdown KHÔNG dùng dangerouslySetInnerHTML nên an toàn XSS.
 */
export default function ChatMarkdown({ children }) {
  return (
    <div className="chat-markdown text-sm leading-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: ({ children }) => <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc space-y-1.5 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1.5 pl-5">{children}</ol>,
          li: ({ children }) => (
            <li className="pl-0.5 leading-6 [&>p]:my-0">{children}</li>
          ),
          h1: ({ children }) => <h1 className="mb-1 mt-2 text-base font-extrabold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-1 mt-2 text-base font-extrabold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-extrabold">{children}</h3>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#3525cd] underline underline-offset-2"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-4 border-[#3525cd]/40 bg-[#eef0ff]/60 px-3 py-1.5 italic text-[#464555]">
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children, ...props }) =>
            inline ? (
              <code
                className="rounded bg-[#0b1c30]/10 px-1.5 py-0.5 font-mono text-[0.85em] text-[#0b1c30]"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={`hljs ${className || ''}`} {...props}>
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-xl bg-[#0b1c30] p-3 text-xs leading-5">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[#c7c4d8]/50 bg-[#f1f3fb] px-2 py-1 text-left font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-[#c7c4d8]/40 px-2 py-1">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
