import React, { useMemo, useState } from 'react';
import { X, Mail, Phone, Building2, ArrowUpRight } from 'lucide-react';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { useEstate } from '../context/EstateContext';
import { Agent } from '../types/estate';

const OFFICES = [
  'All',
  'London',
  'Dubai',
  'New York',
  'Monaco',
  'Los Angeles',
] as const;

export const AgentsPage: React.FC = () => {
  const {
    agents,
    properties,
    formatPrice,
    currentUser,
    submitInquiry,
    navigateTo,
  } = useEstate();

  const [selectedOffice, setSelectedOffice] = useState<string>('All');
  const [consultingAgent, setConsultingAgent] = useState<Agent | null>(null);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(
    'agent-victoria-sterling'
  );

  // Advisor Consultation Modal Form
  const [clientName, setClientName] = useState(currentUser?.fullName || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredAgents = useMemo(() => {
    if (selectedOffice === 'All') return agents;
    return agents.filter((a) => a.office === selectedOffice);
  }, [agents, selectedOffice]);

  const openConsultModal = (agent: Agent) => {
    setConsultingAgent(agent);
    setClientName(currentUser?.fullName || '');
    setClientEmail(currentUser?.email || '');
    setClientPhone(currentUser?.phone || '');
    setMessage(
      `Dear ${agent.name}, I would like to arrange a confidential consultation regarding acquisitions in ${agent.office}.`
    );
    setFormError(null);
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultingAgent) return;

    if (clientName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (clientPhone.trim().length < 7) {
      setFormError('Please enter a valid telephone number.');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Please include a brief consultation summary.');
      return;
    }

    await submitInquiry({
      type: 'ADVISOR_CONSULTATION',
      agentId: consultingAgent.id,
      agentName: consultingAgent.name,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      message: message.trim(),
    });

    setConsultingAgent(null);
  };

  return (
    <div className="bg-[#060608] text-white min-h-screen pb-24">
      <section className="bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-[1380px] mx-auto px-6 py-16 lg:py-22">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
              International Private Client Desk
            </p>
            <h1 className="font-display text-[clamp(2.35rem,4.2vw,3.75rem)] font-semibold text-white leading-tight text-balance">
              Senior Managing Partners &amp; Regional Directors
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
              Connect directly with our partners across London, Dubai, New York, Monaco, and Los Angeles and inspect the active luxury mandates represented by each advisor.
            </p>
          </div>

          <div className="mt-8 inline-flex flex-wrap items-center gap-1 p-1 bg-[#060608] border border-white/10 rounded-lg">
            {OFFICES.map((office) => (
              <button
                key={office}
                type="button"
                onClick={() => setSelectedOffice(office)}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  selectedOffice === office
                    ? 'bg-[#C9A962] text-[#060608]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {office === 'All' ? 'All Global Desks' : office}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1380px] mx-auto px-6 pt-14 space-y-10">
        {filteredAgents.map((agent) => {
          const agentProperties = properties.filter(
            (p) => p.agentId === agent.id
          );
          const isExpanded = expandedAgentId === agent.id;

          return (
            <article
              key={agent.id}
              className="bg-[#0D0E12] border border-white/10 hover:border-[#C9A962]/40 rounded-2xl overflow-hidden transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-4 aspect-[4/4] lg:aspect-auto bg-[#060608] relative min-h-[300px]">
                  {agent.portrait ? (
                    <ArchitecturalImage
                      src={agent.portrait}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0C10] to-[#1A160B] p-8 text-center">
                      <span className="font-display text-5xl text-[#DFC07A]">
                        {agent.initials}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 mt-3">
                        {agent.office} Private Desk
                      </span>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-8 p-6 md:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-[0.18em] text-[#C9A962] font-semibold">
                        {agent.office} Desk · {agent.yearsExperience} Years Experience
                      </span>
                      <span className="font-mono text-xs text-[#DFC07A] tabular-nums">
                        {agent.closedVolume}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-3xl font-semibold text-white">
                        {agent.name}
                      </h2>
                      <p className="text-sm text-zinc-400 mt-0.5">
                        {agent.title}
                      </p>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {agent.bio}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-zinc-400">
                      <div>
                        <strong className="text-white block mb-0.5">
                          Specialization:
                        </strong>
                        {agent.specialization}
                      </div>
                      <div>
                        <strong className="text-white block mb-0.5">
                          Languages Spoken:
                        </strong>
                        {agent.languages.join(' · ')}
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                      <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-[#C9A962]" />
                        {agent.phone}
                      </span>
                      <a
                        href={`mailto:${agent.email}`}
                        className="inline-flex items-center gap-1.5 text-[#DFC07A] hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {agent.email}
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedAgentId(isExpanded ? null : agent.id)
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 border border-white/15 hover:border-[#C9A962] rounded-lg cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#C9A962]" />
                        <span>
                          {isExpanded ? 'Hide' : 'View'} Listed Properties (
                          {agentProperties.length})
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openConsultModal(agent)}
                        className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
                      >
                        Schedule Consultation
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listed Properties Represented by This Agent */}
              {isExpanded && agentProperties.length > 0 && (
                <div className="border-t border-white/10 bg-[#08090D] p-6 md:p-8 space-y-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#C9A962] font-semibold">
                    Active Public Mandates Represented by {agent.name}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {agentProperties.map((prop) => (
                      <button
                        key={prop.id}
                        type="button"
                        onClick={() =>
                          navigateTo('property-detail', { propertyId: prop.id })
                        }
                        className="group bg-[#0D0E12] border border-white/10 hover:border-[#C9A962]/50 rounded-xl overflow-hidden text-left flex flex-col cursor-pointer"
                      >
                        <div className="aspect-[16/10] bg-[#060608] overflow-hidden">
                          <ArchitecturalImage
                            src={prop.heroImage}
                            alt={prop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <p className="font-mono text-[11px] text-[#C9A962]">
                              {prop.referenceCode} · {prop.city}
                            </p>
                            <h3 className="font-display text-xl text-white group-hover:text-[#DFC07A] line-clamp-1">
                              {prop.title}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span className="font-mono text-xs text-white tabular-nums">
                              {formatPrice(prop.priceUsd, prop.pricePeriod)}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#C9A962]" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Consultation Modal */}
      {consultingAgent && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-modal-title"
        >
          <div className="bg-[#0D0E12] border border-[#C9A962]/45 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#C9A962]">
                  {consultingAgent.office} Private Desk
                </p>
                <h2
                  id="consult-modal-title"
                  className="font-display text-2xl font-semibold text-white mt-0.5"
                >
                  Consult {consultingAgent.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setConsultingAgent(null)}
                aria-label="Close consultation modal"
                className="p-1.5 text-zinc-400 hover:text-white rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleConsultSubmit}
              className="space-y-4"
              noValidate
            >
              {formError && (
                <div className="p-3 text-xs text-red-200 bg-red-950/60 border border-red-500/40 rounded-lg">
                  {formError}
                </div>
              )}

              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Full Name *"
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Email *"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                />
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Phone / WhatsApp *"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                />
              </div>

              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConsultingAgent(null)}
                  className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
                >
                  Dispatch Private Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
