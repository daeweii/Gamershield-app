import type { ComponentType } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { FILE_SAFETY_GUIDE, PASSWORD_GUIDE, type GuideSection } from '@/content/guides';
import { ToolPanel } from './ToolPanel';

function Guide({ id, icon, title, sections }: { id: string; icon: ComponentType<{ size?: number }>; title: string; sections: readonly GuideSection[] }) {
  return (
    <ToolPanel id={id} icon={icon} title={title}>
      <div style={{ marginTop: 18 }}>
        {sections.map((s) => (
          <section key={s.heading} className="gs-guide-section">
            <h3>{s.heading}</h3>
            {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
            {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
          </section>
        ))}
      </div>
    </ToolPanel>
  );
}

export const PasswordGuideTool = () => <Guide id="password-guide" icon={BookOpen} title="Password Security Guide" sections={PASSWORD_GUIDE} />;
export const FileSafetyTool = () => <Guide id="file-safety" icon={FileText} title="File Safety Guide" sections={FILE_SAFETY_GUIDE} />;
