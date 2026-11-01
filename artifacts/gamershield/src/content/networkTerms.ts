// Network terminology reference. Original explanations written for Sentrix.

export interface Term {
  term: string;
  short: string;
  detail: string;
}

export const NETWORK_TERMS: readonly Term[] = [
  { term: 'IP address', short: 'A device’s address on a network.', detail: 'Like a mailing address for data. IPv4 looks like 192.168.1.20 (about 4.3 billion possible); IPv6 looks like 2606:4700::1111 and has vastly more. Public addresses work across the internet; private ones only inside a local network.' },
  { term: 'MAC address', short: 'A network card’s hardware ID.', detail: 'Six pairs of hex digits like 3C:22:FB:9A:10:4E, used to deliver frames on the local network. Routers don’t pass it to the internet. Phones often randomize it on Wi-Fi to reduce tracking.' },
  { term: 'DNS', short: 'The internet’s phone book.', detail: 'The Domain Name System turns names like example.com into IP addresses. Attackers abuse it with look-alike domains, and DNS-over-HTTPS (DoH) encrypts lookups so others on the network can’t read them.' },
  { term: 'DHCP', short: 'Hands out IP addresses automatically.', detail: 'Dynamic Host Configuration Protocol: when you join Wi-Fi, a DHCP server (usually your router) gives your device an IP address, the router’s address (gateway), and DNS servers.' },
  { term: 'TCP', short: 'Reliable, ordered delivery.', detail: 'Transmission Control Protocol sets up a connection with a three-way handshake (SYN, SYN-ACK, ACK), numbers every piece, and resends anything lost. Used for the web, email, and file transfers.' },
  { term: 'UDP', short: 'Fast, no guarantees.', detail: 'User Datagram Protocol just sends packets with no handshake or resending. Good for games, voice, video, and DNS, where speed matters more than a perfect copy.' },
  { term: 'Port', short: 'A numbered door on a device.', detail: 'One IP address can run many services; the port number (0–65535) says which one. Firewalls often allow or block traffic by port.' },
  { term: 'Firewall', short: 'Filters traffic by rules.', detail: 'Allows or blocks traffic based on addresses, ports, and protocols. Host firewalls protect one device; network firewalls protect everything behind them. “Deny by default, allow what’s needed” is the safest rule set.' },
  { term: 'Router', short: 'Moves traffic between networks.', detail: 'Connects your local network to the internet and forwards packets toward their destination. Home routers also do NAT, DHCP, Wi-Fi, and a basic firewall.' },
  { term: 'Switch', short: 'Connects devices on one network.', detail: 'Forwards frames between devices on the same local network using MAC addresses. Unlike an old hub, it sends traffic only to the port that needs it.' },
  { term: 'NAT', short: 'Many devices share one public IP.', detail: 'Network Address Translation lets every device at home use private addresses while the router shows the internet a single public address. It also hides internal devices from unsolicited connections.' },
  { term: 'Subnet', short: 'A slice of an IP network.', detail: 'A range of addresses defined by a prefix like /24. Devices in the same subnet talk directly; traffic to other subnets goes through a router. Splitting networks into subnets limits how far an attacker can move.' },
  { term: 'Gateway', short: 'The exit to other networks.', detail: 'The router address a device sends traffic to when the destination isn’t on its own subnet. At home this is usually something like 192.168.1.1.' },
  { term: 'VPN', short: 'An encrypted tunnel.', detail: 'A Virtual Private Network encrypts traffic between your device and the VPN server, hiding it from the local network. The VPN provider can still see where you go, so you’re shifting trust, not removing it.' },
  { term: 'HTTP / HTTPS', short: 'How web pages travel.', detail: 'HTTP sends web data in plain text. HTTPS wraps it in TLS encryption and proves the site’s identity with a certificate. Never log in on a plain HTTP page.' },
  { term: 'TLS', short: 'The encryption behind HTTPS.', detail: 'Transport Layer Security encrypts data in transit and authenticates servers with certificates. It also protects email, VPNs, and many apps.' },
  { term: 'OSI model', short: 'Seven layers of networking.', detail: 'Physical, Data Link, Network, Transport, Session, Presentation, Application. A shared vocabulary for where a problem or attack happens, e.g. ARP spoofing is layer 2 and SQL injection is layer 7.' },
];

export interface Port {
  port: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  service: string;
  note: string;
}

export const COMMON_PORTS: readonly Port[] = [
  { port: 20, protocol: 'TCP', service: 'FTP data', note: 'Unencrypted file transfer. Avoid; use SFTP.' },
  { port: 21, protocol: 'TCP', service: 'FTP control', note: 'Sends passwords in plain text.' },
  { port: 22, protocol: 'TCP', service: 'SSH / SFTP', note: 'Encrypted remote login. Common brute-force target.' },
  { port: 23, protocol: 'TCP', service: 'Telnet', note: 'Unencrypted remote login. Should be disabled.' },
  { port: 25, protocol: 'TCP', service: 'SMTP', note: 'Server-to-server email.' },
  { port: 53, protocol: 'TCP/UDP', service: 'DNS', note: 'Name lookups.' },
  { port: 67, protocol: 'UDP', service: 'DHCP server', note: 'Hands out addresses (68 is the client side).' },
  { port: 80, protocol: 'TCP', service: 'HTTP', note: 'Unencrypted web.' },
  { port: 110, protocol: 'TCP', service: 'POP3', note: 'Downloads email. Use 995 (encrypted).' },
  { port: 123, protocol: 'UDP', service: 'NTP', note: 'Time sync. Accurate time matters for logs and certificates.' },
  { port: 143, protocol: 'TCP', service: 'IMAP', note: 'Email access. Use 993 (encrypted).' },
  { port: 161, protocol: 'UDP', service: 'SNMP', note: 'Device monitoring. Old versions use weak “community strings.”' },
  { port: 389, protocol: 'TCP', service: 'LDAP', note: 'Directory lookups (636 is LDAPS).' },
  { port: 443, protocol: 'TCP', service: 'HTTPS', note: 'Encrypted web. Most traffic today.' },
  { port: 445, protocol: 'TCP', service: 'SMB', note: 'Windows file sharing. Never expose to the internet (WannaCry spread this way).' },
  { port: 587, protocol: 'TCP', service: 'SMTP submission', note: 'Sending email from an app, with STARTTLS.' },
  { port: 993, protocol: 'TCP', service: 'IMAPS', note: 'Encrypted IMAP.' },
  { port: 3306, protocol: 'TCP', service: 'MySQL', note: 'Databases shouldn’t be reachable from the internet.' },
  { port: 3389, protocol: 'TCP', service: 'RDP', note: 'Windows Remote Desktop. A top ransomware entry point if exposed.' },
  { port: 8080, protocol: 'TCP', service: 'HTTP alternate', note: 'Common for proxies and test servers.' },
];
