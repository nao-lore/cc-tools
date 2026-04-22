import IpCalculator from "./components/IpCalculator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            IP Subnet Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate network address, broadcast address, host range, and subnet
            details from any CIDR block or subnet mask.
          </p>
        </div>

        {/* Calculator Tool */}
        <IpCalculator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is CIDR Notation?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            CIDR (Classless Inter-Domain Routing) notation is a compact way to
            describe an IP address and its associated network prefix. It is
            written as an IP address followed by a slash and a number (e.g.,
            192.168.1.0/24). The number after the slash indicates how many bits
            of the address represent the network portion, while the remaining
            bits identify individual hosts within that network.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Network Address vs. Broadcast Address
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Every subnet has two reserved addresses. The <strong>network
            address</strong> is the first address in the range — all host bits
            set to 0. It identifies the subnet itself and cannot be assigned to
            a host. The <strong>broadcast address</strong> is the last address —
            all host bits set to 1. Packets sent to this address are delivered
            to every host on the subnet. Usable host addresses fall between
            these two.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Subnet Mask and Wildcard Mask
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A <strong>subnet mask</strong> uses consecutive 1-bits to mark the
            network portion of an address and 0-bits for the host portion. For
            example, /24 corresponds to 255.255.255.0 — 24 leading ones and 8
            zeros. The <strong>wildcard mask</strong> is the bitwise inverse of
            the subnet mask and is commonly used in access control lists (ACLs)
            and routing protocols like OSPF to specify which bits must match.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            IP Address Classes
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            IPv4 addresses were historically divided into classes based on the
            leading bits of the first octet:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Class A</strong> (1–126): Large networks. Default mask
              /8, supporting up to ~16 million hosts.
            </li>
            <li>
              <strong>Class B</strong> (128–191): Medium networks. Default mask
              /16, supporting up to ~65,000 hosts.
            </li>
            <li>
              <strong>Class C</strong> (192–223): Small networks. Default mask
              /24, supporting up to 254 hosts.
            </li>
            <li>
              <strong>Class D</strong> (224–239): Reserved for multicast groups.
            </li>
            <li>
              <strong>Class E</strong> (240–255): Reserved for experimental use.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How Subnetting Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Subnetting divides a large network into smaller, more manageable
            segments. By borrowing bits from the host portion of an address, you
            create more subnets at the cost of fewer hosts per subnet. For
            example, splitting a /24 into four /26 subnets gives you four
            networks of 62 usable hosts each instead of one network of 254 hosts.
            This improves security, reduces broadcast traffic, and makes routing
            more efficient.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Subnet Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Designing VPC and cloud network topology (AWS, GCP, Azure).
            </li>
            <li>
              Configuring firewall rules and ACLs with wildcard masks.
            </li>
            <li>
              Planning office or data-center IP address schemes.
            </li>
            <li>
              Troubleshooting routing issues by verifying network and broadcast
              addresses.
            </li>
            <li>
              Splitting a large block into point-to-point /30 or /31 links.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">IP Subnet Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://binary-converter-tau.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Binary Converter</a>
              <a href="https://epoch-converter-eosin.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Epoch Converter</a>
              <a href="https://chmod-calculator-gules.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Chmod Calculator</a>
              <a href="https://base64-tools-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="https://hash-generator-coral.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
