import { useState } from 'react';
import { ListChecks, RotateCcw } from 'lucide-react';
import { CHECKLIST, CHECKLIST_IDS } from '@/content/checklist';
import { STORAGE_KEYS, parseIdList, readStorage, removeStorage, writeStorage } from '@/lib/platform/storage';
import { ToolPanel } from './ToolPanel';

const TOTAL = CHECKLIST_IDS.size;

export function ChecklistTool() {
  // Only the IDs of ticked items are saved, in this browser.
  const [done, setDone] = useState<string[]>(() => parseIdList(readStorage(STORAGE_KEYS.checklist), CHECKLIST_IDS));

  function toggle(id: string, checked: boolean) {
    const next = checked ? [...done, id] : done.filter((d) => d !== id);
    setDone(next);
    writeStorage(STORAGE_KEYS.checklist, JSON.stringify(next));
  }

  const percent = Math.round((done.length / TOTAL) * 100);

  return (
    <ToolPanel id="security-checklist" icon={ListChecks} title="Security Checklist">
      <p className="gs-input-label" id="checklist-progress-label" style={{ marginBottom: 0 }}>{done.length} of {TOTAL} done ({percent}%)</p>
      <div className="gs-progress" role="progressbar" aria-labelledby="checklist-progress-label" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={done.length}>
        <span style={{ width: `${percent}%` }} />
      </div>
      {CHECKLIST.map((group) => (
        <fieldset key={group.id} className="gs-check-group" style={{ border: 0, padding: 0, margin: '20px 0 0' }}>
          <legend><h3>{group.title}</h3></legend>
          {group.items.map((item) => (
            <label key={item.id} className="gs-check-item">
              <input type="checkbox" checked={done.includes(item.id)} onChange={(e) => toggle(item.id, e.target.checked)} data-testid={`check-${item.id}`} />
              <span>{item.text}</span>
              <small>{item.why}</small>
            </label>
          ))}
        </fieldset>
      ))}
      {done.length > 0 && (
        <button type="button" className="gs-secondary gs-reset" onClick={() => { setDone([]); removeStorage(STORAGE_KEYS.checklist); }} data-testid="button-reset-checklist">
          <RotateCcw size={15} aria-hidden="true" /> Clear all checks
        </button>
      )}
      <p className="gs-privacy"><span>Your progress is saved only in this browser, as a list of ticked item IDs. Settings → Reset everything clears it.</span></p>
    </ToolPanel>
  );
}
