"use client";

import { useEffect, useState } from "react";
import { enquiriesAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Mail, CheckCircle, Phone } from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    enquiriesAPI.list().then((r) => setEnquiries(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: string) => {
    await enquiriesAPI.markRead(id);
    load();
  };

  const unread = enquiries.filter((e) => !e.is_read).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-charcoal text-3xl font-semibold">Enquiries</h1>
        <p className="text-charcoal/50 text-sm mt-1">
          {enquiries.length} total · {unread} unread
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-cream rounded-sm animate-pulse" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 bg-white border border-cream-dark rounded-sm">
          <Mail size={40} className="text-gold/30 mx-auto mb-4" />
          <p className="text-charcoal/40">No enquiries yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {enquiries.map((e) => (
            <div
              key={e.id}
              className={`bg-white border rounded-sm shadow-premium p-5 ${
                !e.is_read ? "border-gold/30 bg-gold/[0.02]" : "border-cream-dark"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-charcoal">{e.name}</p>
                    {!e.is_read && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">NEW</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-charcoal/50 text-xs">
                      <Phone size={12} /> {e.phone}
                    </div>
                    {e.email && (
                      <div className="flex items-center gap-1 text-charcoal/50 text-xs">
                        <Mail size={12} /> {e.email}
                      </div>
                    )}
                    <span className="text-charcoal/30 text-xs">{formatDate(e.created_at)}</span>
                  </div>
                  <p className="text-charcoal/70 text-sm leading-relaxed bg-cream rounded-sm px-3 py-2">
                    {e.message}
                  </p>
                </div>
                {!e.is_read && (
                  <button
                    onClick={() => handleMarkRead(e.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-emerald-200 text-emerald-600 text-xs rounded-sm hover:bg-emerald-50 transition-colors shrink-0"
                  >
                    <CheckCircle size={13} /> Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
