// Placeholder testimonials — replace with real client quotes when available
const TESTIMONIALS = [
  {
    quote:
      "Navodaya's hygiene products have been a game-changer for our hotel chain. Consistent quality, on-time delivery.",
    name: 'Rajesh Kumar',
    role: 'GM, Grand Palace Hotels',
    location: 'Hyderabad',
  },
  {
    quote:
      "We've been sourcing spa disposables from Navodaya for 2 years. Never had a quality issue. Highly recommended.",
    name: 'Priya Sharma',
    role: 'Operations Head, Serenity Spas',
    location: 'Bangalore',
  },
  {
    quote:
      'The biodegradable options are exactly what our eco-conscious hospital needed. Great B2B partner.',
    name: 'Dr. Anand Rao',
    role: 'Admin Director, Apollo Clinics',
    location: 'Chennai',
  },
  {
    quote:
      'Bulk orders handled seamlessly. The team is responsive and the products meet all our hygiene standards.',
    name: 'Meena Patel',
    role: 'Procurement Manager, Taj Hotels',
    location: 'Mumbai',
  },
  {
    quote:
      'From surgical gowns to guest amenities — one supplier for everything. Saves us so much time.',
    name: 'Suresh Nair',
    role: 'Supply Chain Head, Leela Resorts',
    location: 'Goa',
  },
  {
    quote:
      'Excellent quality at competitive B2B pricing. Our salon chain has been a loyal customer for 3 years.',
    name: 'Kavitha Reddy',
    role: 'Owner, Glam Studio Chain',
    location: 'Hyderabad',
  },
];

function TestimonialCard({ quote, name, role, location }: (typeof TESTIMONIALS)[0]) {
  return (
    <div className="shrink-0 w-80 mx-3 p-6 border border-grey-800 bg-grey-900">
      <p className="text-body-sm text-grey-300 mb-4">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="text-body-sm font-medium text-paper">{name}</p>
        <p className="mt-1 font-mono text-data text-grey-400">
          {role} · {location}
        </p>
      </div>
    </div>
  );
}

export function TestimonialMarquee() {
  return (
    <section className="py-24 overflow-hidden bg-ink" aria-label="Client testimonials">
      <div className="container mx-auto mb-12">
        {/* Quiet mono header line — the marquee is the content, not the heading */}
        <div className="flex flex-col gap-2 border-t border-grey-800 pt-6 md:flex-row md:items-baseline md:justify-between">
          <div className="flex items-baseline gap-5">
            <span aria-hidden="true" className="font-mono text-label text-grey-400">
              04
            </span>
            <h2 className="font-mono text-label uppercase text-grey-300">What Our Clients Say</h2>
          </div>
          <p className="font-mono text-data text-grey-400">
            Trusted by hotels, hospitals, spas and industries across India
          </p>
        </div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative overflow-hidden mb-4">
        <div className="flex testimonial-row-1">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} {...t} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative overflow-hidden">
        <div className="flex testimonial-row-2">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <TestimonialCard key={`${t.name}-row2-${i}`} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
