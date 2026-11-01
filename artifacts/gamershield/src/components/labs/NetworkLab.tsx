import { NETWORK_DEVICES, NETWORK_DNS, NETWORK_LAB_QUIZ, NETWORK_PORTS } from '@/content/labs';
import { completeLab } from '@/hooks/use-labs';
import { QuizBlock } from './QuizBlock';

function Table({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="gs-table-wrap">
      <table className="gs-table">
        <caption className="sx-sr-only">{caption}</caption>
        <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j < 2 ? 'mono' : ''}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function NetworkLab() {
  return (
    <div className="sx-stack">
      <section className="sx-card" aria-labelledby="net-lab-heading">
        <p className="sx-badge sx-badge-red">Simulation · a fictional home network</p>
        <h2 id="net-lab-heading" style={{ fontSize: 18, margin: '12px 0 0' }}>Devices on the network</h2>
        <Table caption="Devices" head={['Name', 'IP address', 'MAC address', 'Role']} rows={NETWORK_DEVICES.map((d) => [d.name, d.ip, d.mac, d.role])} />
        <h2 style={{ fontSize: 18, margin: '20px 0 0' }}>DNS records for example.net</h2>
        <Table caption="DNS records" head={['Name', 'Type', 'Value']} rows={NETWORK_DNS.map((d) => [d.name, d.type, d.value])} />
        <h2 style={{ fontSize: 18, margin: '20px 0 0' }}>Open ports (from a scan)</h2>
        <Table caption="Open ports" head={['Host', 'Port', 'Service']} rows={NETWORK_PORTS.map((p) => [p.host, p.port, p.service])} />
      </section>
      <QuizBlock id="netlab" title="Read the network" questions={NETWORK_LAB_QUIZ} onPass={() => completeLab('network-lab')} />
    </div>
  );
}
