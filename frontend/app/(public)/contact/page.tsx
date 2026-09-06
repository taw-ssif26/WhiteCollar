"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: POST to your backend or a form service like Formspree
    setSubmitted(true);
  };

  return (
    <div className="bg-ivory pt-16">
      {/* Header */}
      <section className="bg-charcoal py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">Contact</p>
          <h1 className="font-serif text-ivory text-5xl font-semibold">Get in touch</h1>
          <div className="gold-divider max-w-xs mt-6" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <h2 className="font-serif text-charcoal text-2xl font-semibold mb-6">
              We'd love to hear from you.
            </h2>
            <p className="text-charcoal/60 leading-relaxed mb-10">
              Whether you have questions about our programmes, pricing, or schedules —
              reach out. Our team responds within one working day.
            </p>

            <div className="flex flex-col gap-6">
              {[
                { icon: <MapPin size={18} className="text-gold" />, label: "Address", value: "Chattogram, Bangladesh" },
                { icon: <Phone size={18} className="text-gold" />, label: "Phone / WhatsApp", value: "+880 1XXX-XXXXXX" },
                { icon: <Mail size={18} className="text-gold" />, label: "Email", value: "info@whitecollaren.com" },
                { icon: <Clock size={18} className="text-gold" />, label: "Hours", value: "Saturday–Thursday, 9 AM – 8 PM" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm bg-cream border border-cream-dark flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/40 uppercase tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-charcoal text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-cream-dark rounded-sm shadow-premium p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <CheckCircle size={48} className="text-gold mb-4" />
                <h3 className="font-serif text-charcoal text-2xl font-semibold mb-2">Message received</h3>
                <p className="text-charcoal/60 text-sm">
                  Thank you for reaching out. We'll respond within one working day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="font-serif text-charcoal text-xl font-semibold mb-2">Send a message</h3>

                {[
                  { id: "name", label: "Full Name", type: "text", placeholder: "Rafiul Islam", required: true },
                  { id: "phone", label: "WhatsApp Number", type: "tel", placeholder: "+880 17XX-XXXXXX", required: true },
                  { id: "email", label: "Email (optional)", type: "email", placeholder: "you@example.com", required: false },
                ].map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs text-charcoal/50 uppercase tracking-wider mb-1.5" htmlFor={field.id}>
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={form[field.id as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                      className="w-full border border-cream-dark rounded-sm px-4 py-2.5 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs text-charcoal/50 uppercase tracking-wider mb-1.5" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="I'm interested in the IELTS preparation course..."
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-cream-dark rounded-sm px-4 py-2.5 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-charcoal text-ivory text-sm font-semibold rounded-sm hover:bg-gold hover:text-charcoal transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
