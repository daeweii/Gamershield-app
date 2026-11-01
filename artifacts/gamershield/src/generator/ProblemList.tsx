import { AlertTriangle } from 'lucide-react';
import type { Problem } from '@/lib/security';
import { strings } from './strings';

/** Explains every settings conflict and how to fix it. Nothing is changed behind the user's back. */
export function ProblemList({ problems, action }: { problems: Problem[]; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="pg-problems" role="alert" data-testid="list-problems">
      <p className="pg-problems-title"><AlertTriangle size={18} aria-hidden="true" /> {strings.customize.problemsHeading}</p>
      <ul>
        {problems.map((problem) => {
          const { message, fix } = strings.problem(problem);
          return (
            <li key={message}>
              <strong>{message}</strong> {fix}
            </li>
          );
        })}
      </ul>
      {action && <button type="button" className="pg-button" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}
