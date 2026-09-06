import { Calendar } from "lucide-react";

async function getEvents() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/events`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const MOCK_EVENTS = [
  {
    id: "1",
    title: "IELTS Masterclass — Speaking Module",
    description: "A focused 3-hour deep-dive into the IELTS Speaking test. Live mock interviews, common pitfalls, and band-score optimisation strategies. Open to all enrolled students and walk-ins.",
    event_date: "2025-10-15T14:00:00",
    image_url: null,
  },
  {
    id: "2",
    title: "Corporate English Workshop",
    description: "Half-day intensive on business writing, email etiquette, and presentation delivery for professionals. Certificates of participation issued.",
    event_date: "2025-11-02T10:00:00",
    image_url: null,
  },
  {
    id: "3",
    title: "Annual English Olympiad 2025",
    description: "Inter-batch competition covering vocabulary, comprehension, and debate. Top performers receive scholarship discounts for the next term.",
    event_date: "2025-12-10T09:00:00",
    image_url: null,
  },
];

export default async function EventsPage() {
  const events = await getEvents();
  const displayEvents = events.length > 0 ? events : MOCK_EVENTS;

  return (
    <div className="bg-ivory pt-16">
      {/* Header */}
      <section className="bg-charcoal py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">Events</p>
          <h1 className="font-serif text-ivory text-5xl font-semibold">
            Upcoming programmes
          </h1>
          <div className="gold-divider max-w-sm mt-6" />
        </div>
      </section>

      {/* Events list */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        {displayEvents.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={40} className="text-gold/40 mx-auto mb-4" />
            <p className="font-serif text-charcoal/60 text-xl">No upcoming events right now.</p>
            <p className="text-charcoal/40 text-sm mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {displayEvents.map((event: any, idx: number) => {
              const date = new Date(event.event_date);
              const isPast = date < new Date();
              return (
                <div
                  key={event.id}
                  className={`bg-white border rounded-sm overflow-hidden shadow-premium hover:shadow-premium-lg transition-shadow ${
                    isPast ? "border-charcoal/10 opacity-70" : "border-cream-dark hover:border-gold/30"
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Date block */}
                    <div className="md:w-36 bg-charcoal flex flex-col items-center justify-center p-6 shrink-0">
                      <p className="text-gold font-serif text-3xl font-semibold">
                        {date.getDate()}
                      </p>
                      <p className="text-ivory/60 text-xs uppercase tracking-widest mt-1">
                        {date.toLocaleString("en", { month: "short" })}
                      </p>
                      <p className="text-ivory/40 text-xs mt-0.5">{date.getFullYear()}</p>
                      {isPast && (
                        <span className="mt-3 text-[10px] px-2 py-0.5 rounded-full bg-charcoal-muted text-ivory/40">
                          Past
                        </span>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-6 flex-1">
                      <h2 className="font-serif text-charcoal text-xl font-semibold mb-2">
                        {event.title}
                      </h2>
                      <p className="text-charcoal/60 text-sm leading-relaxed mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-gold text-xs">
                        <Calendar size={13} />
                        <span>
                          {date.toLocaleString("en-GB", {
                            weekday: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
