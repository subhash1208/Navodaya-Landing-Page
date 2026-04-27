// Placeholder testimonials — replace with real client quotes when available
const TESTIMONIALS = [
  { quote: "Navodaya's hygiene products have been a game-changer for our hotel chain. Consistent quality, on-time delivery.", name: "Rajesh Kumar", role: "GM, Grand Palace Hotels", location: "Hyderabad" },
  { quote: "We've been sourcing spa disposables from Navodaya for 2 years. Never had a quality issue. Highly recommended.", name: "Priya Sharma", role: "Operations Head, Serenity Spas", location: "Bangalore" },
  { quote: "The biodegradable options are exactly what our eco-conscious hospital needed. Great B2B partner.", name: "Dr. Anand Rao", role: "Admin Director, Apollo Clinics", location: "Chennai" },
  { quote: "Bulk orders handled seamlessly. The team is responsive and the products meet all our hygiene standards.", name: "Meena Patel", role: "Procurement Manager, Taj Hotels", location: "Mumbai" },
  { quote: "From surgical gowns to guest amenities — one supplier for everything. Saves us so much time.", name: "Suresh Nair", role: "Supply Chain Head, Leela Resorts", location: "Goa" },
  { quote: "Excellent quality at competitive B2B pricing. Our salon chain has been a loyal customer for 3 years.", name: "Kavitha Reddy", role: "Owner, Glam Studio Chain", location: "Hyderabad" },
];

function TestimonialCard({ quote, name, role, location }: typeof TESTIMONIALS[0]) {
  return (
    <div
      className="shrink-0 w-80 mx-3 rounded-2xl p-6 border"
      style={{
        background: '#171E2F',
        borderColor: '#20222E',
      }}
    >
      <p className="text-sm leading-relaxed mb-4" style={{ color: '#E2E8F0', fontWeight: 300 }}>
        &ldquo;{quote}&rdquo;
      </p>
      <div>
        <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#585E6E' }}>{role} · {location}</p>
      </div>
    </div>
  );
}

export function TestimonialMarquee() {
  return (
    <section
      className="py-16 overflow-hidden"
      style={{ background: '#050810' }}
      aria-label="Client testimonials"
    >
      <div className="container mx-auto mb-10">
        <h2 className="font-display text-2xl font-bold text-white text-center mb-2">
          What Our Clients Say
        </h2>
        <p className="text-center text-sm" style={{ color: '#8B8B8B' }}>
          Trusted by hotels, hospitals, spas and industries across India
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative overflow-hidden mb-4">
        <div className="flex testimonial-row-1">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative overflow-hidden">
        <div className="flex testimonial-row-2">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
