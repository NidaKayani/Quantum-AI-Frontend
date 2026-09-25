import { useState } from 'react';

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type SlidePlan = {
  type: string;
  title: string;
  bullets?: string[];
  notes?: string;
};

export type EducationResult =
  | { kind: 'summary'; documentName: string; summary: string }
  | { kind: 'quiz'; documentName: string; title: string; questions: QuizQuestion[] }
  | { kind: 'slides'; documentName: string; title: string; subtitle?: string; slides: SlidePlan[] };

interface Props {
  result: EducationResult;
  onClose: () => void;
}

export function EducationResultPanel({ result, onClose }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);
  const heading =
    result.kind === 'summary'
      ? `Summary · ${result.documentName}`
      : result.kind === 'quiz'
        ? `${result.title || 'Quiz'} · ${result.documentName}`
        : `${result.title || 'Slides'} · ${result.documentName}`;

  return (
    <section className="education-result" aria-live="polite">
      <header>
        <h3>{heading}</h3>
        <div className="education-result-actions">
          {result.kind === 'quiz' && (
            <button type="button" onClick={() => setShowAnswers((open) => !open)}>
              {showAnswers ? 'Hide answers' : 'Show answers'}
            </button>
          )}
          {result.kind === 'slides' && (
            <button type="button" onClick={() => downloadSlideOutline(result)}>
              Download outline
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close result">
            ×
          </button>
        </div>
      </header>

      {result.kind === 'summary' && <p>{result.summary}</p>}

      {result.kind === 'quiz' && (
        <ol>
          {result.questions.map((item, index) => (
            <li key={`${index}-${item.question}`}>
              <strong>{item.question}</strong>
              <ul>
                {item.options.map((option, optionIndex) => (
                  <li key={option}>
                    {String.fromCharCode(65 + optionIndex)}. {option}
                    {showAnswers && optionIndex === item.answerIndex ? ' ✓' : ''}
                  </li>
                ))}
              </ul>
              {showAnswers && item.explanation ? <p>{item.explanation}</p> : null}
            </li>
          ))}
        </ol>
      )}

      {result.kind === 'slides' && (
        <>
          {result.subtitle ? <p>{result.subtitle}</p> : null}
          <ol>
            {result.slides.map((slide, index) => (
              <li key={`${index}-${slide.title}`}>
                <strong>
                  {slide.title}
                  {slide.type ? ` · ${slide.type.replace(/_/g, ' ')}` : ''}
                </strong>
                {slide.bullets?.length ? (
                  <ul>
                    {slide.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {slide.notes ? <p>Notes: {slide.notes}</p> : null}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

function downloadSlideOutline(result: Extract<EducationResult, { kind: 'slides' }>) {
  const lines = [`${result.title}`, result.subtitle ?? '', `Source: ${result.documentName}`, ''];
  result.slides.forEach((slide, index) => {
    lines.push(`Slide ${index + 1}: ${slide.title}`);
    slide.bullets?.forEach((bullet) => lines.push(`- ${bullet}`));
    if (slide.notes) lines.push(`Notes: ${slide.notes}`);
    lines.push('');
  });
  const blob = new Blob([lines.filter((line, index) => line !== '' || index > 0).join('\n')], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${result.documentName.replace(/[^a-z0-9]+/gi, '-')}-slides.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
