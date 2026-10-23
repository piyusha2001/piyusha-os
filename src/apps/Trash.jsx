import { FileText } from 'lucide-react';

const ITEMS = [
  ['imposter_syndrome.txt', 'Deleted after Best Paper at IEEE PuneCon 2025.'],
  ['15s_page_load.js', 'Replaced by a 2s version at Protex AI.'],
  ['chunk_with_90pct_of_textbook.json', 'Re-chunked for Twiga. Retrieval is happier now.'],
  ['wasted_tokens.log', 'SuperLean AI is working on it (-50% target).'],
];

export default function Trash() {
  return (
    <div className="app">
      <p className="muted small">{ITEMS.length} items · these were removed for good reasons</p>
      <ul className="trash-list">
        {ITEMS.map(([n, d]) => (
          <li key={n}><FileText size={18} /><div><b>{n}</b><div className="muted small">{d}</div></div></li>
        ))}
      </ul>
    </div>
  );
}
