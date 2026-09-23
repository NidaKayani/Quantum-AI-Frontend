import type { RagSource } from '../types';

interface Props {
  sources: RagSource[];
}

export function RagSourcesCard({ sources }: Props) {
  if (!sources.length) return null;

  return (
    <section className="rag-sources-card" aria-label="Passages used from your files">
      <header>
        <strong>From your files</strong>
        <span>
          {sources.length} passage{sources.length === 1 ? '' : 's'} used to answer
        </span>
      </header>
      <ul>
        {sources.map((source) => (
          <li key={`${source.documentId}-${source.part}`}>
            <span className="rag-source-file">
              {source.filename}
              {source.part ? ` · part ${source.part}` : ''}
            </span>
            {source.snippet ? <p>{source.snippet}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
