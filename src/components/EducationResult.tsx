import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { safeMarkdownUrl } from '../utils/safeUrl';

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

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export type EducationResult =
  | { kind: 'summary'; documentName: string; summary: string }
  | {
      kind: 'quiz';
      documentId: string;
      documentName: string;
      title: string;
      difficulty: QuizDifficulty;
      questions: QuizQuestion[];
    }
  | { kind: 'slides'; documentName: string; title: string; subtitle?: string; slides: SlidePlan[] };

interface Props {
  result: EducationResult;
  onClose: () => void;
  onMakeHarder?: () => void;
  harderPending?: boolean;
}

export function EducationResultPanel({ result, onClose, onMakeHarder, harderPending }: Props) {
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

      {result.kind === 'summary' && <MarkdownBody text={result.summary} />}

      {result.kind === 'quiz' && (
        <QuizPlayer
          questions={result.questions}
          difficulty={result.difficulty}
          harderPending={harderPending}
          onMakeHarder={onMakeHarder}
        />
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
                      <li key={bullet}>
                        <MarkdownBody inline text={bullet} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {slide.notes ? <MarkdownBody text={slide.notes} /> : null}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

function QuizPlayer({
  questions,
  difficulty,
  harderPending,
  onMakeHarder,
}: {
  questions: QuizQuestion[];
  difficulty: QuizDifficulty;
  harderPending?: boolean;
  onMakeHarder?: () => void;
}) {
  const [picks, setPicks] = useState<Array<number | null>>(() => questions.map(() => null));
  const [graded, setGraded] = useState(false);

  const answered = picks.filter((pick) => pick != null).length;
  const correctCount = graded
    ? questions.filter((item, index) => picks[index] === item.answerIndex).length
    : 0;

  const choose = (questionIndex: number, optionIndex: number) => {
    if (graded) return;
    setPicks((current) => current.map((pick, index) => (index === questionIndex ? optionIndex : pick)));
  };

  return (
    <div className="quiz-player">
      <p className="quiz-progress">
        {graded
          ? `Score: ${correctCount}/${questions.length}`
          : `${answered} of ${questions.length} answered · ${difficulty}`}
      </p>
      {questions.map((item, questionIndex) => {
        const picked = picks[questionIndex];
        const missed = graded && picked !== item.answerIndex;
        return (
          <article className="quiz-card" key={`${questionIndex}-${item.question}`}>
            <p className="quiz-question">
              {questionIndex + 1}. <MarkdownBody inline text={item.question} />
            </p>
            <div className="quiz-options" role="radiogroup" aria-label={item.question}>
              {item.options.map((option, optionIndex) => {
                const selected = picked === optionIndex;
                const isAnswer = optionIndex === item.answerIndex;
                const state = !graded
                  ? selected
                    ? 'selected'
                    : ''
                  : isAnswer
                    ? 'correct'
                    : selected
                      ? 'wrong'
                      : '';
                return (
                  <button
                    key={`${optionIndex}-${option}`}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={graded}
                    className={`quiz-option ${state}`}
                    onClick={() => choose(questionIndex, optionIndex)}
                  >
                    <span className="quiz-radio" aria-hidden="true" />
                    <MarkdownBody inline text={option} />
                  </button>
                );
              })}
            </div>
            {missed && item.explanation ? (
              <div className="quiz-explain">
                <MarkdownBody text={item.explanation} />
              </div>
            ) : null}
          </article>
        );
      })}
      <div className="quiz-actions">
        {!graded ? (
          <button type="button" disabled={answered < questions.length} onClick={() => setGraded(true)}>
            Check answers
          </button>
        ) : (
          <button type="button" disabled={!onMakeHarder || harderPending} onClick={onMakeHarder}>
            {harderPending ? 'Making a harder quiz…' : 'Make Harder'}
          </button>
        )}
      </div>
    </div>
  );
}

function MarkdownBody({ text, inline = false }: { text: string; inline?: boolean }) {
  const Tag = inline ? 'span' : 'div';
  return (
    <Tag className={inline ? 'markdown-body markdown-inline' : 'markdown-body'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        urlTransform={safeMarkdownUrl}
        components={inline ? { p: ({ children }) => <span>{children}</span> } : undefined}
      >
        {text}
      </ReactMarkdown>
    </Tag>
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
