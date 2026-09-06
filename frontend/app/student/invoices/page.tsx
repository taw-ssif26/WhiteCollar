"use client";

import { useEffect, useState } from "react";
import { studentPortalAPI } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Receipt, CheckCircle, Clock } from "lucide-react";

export default function StudentInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentPortalAPI.invoices()
      .then((res) => setInvoices(res.data))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = invoices.filter((i) => i.is_paid).reduce((s, i) => s + i.amount, 0);
  const totalDue = invoices.filter((i) => !i.is_paid).reduce((s, i) => s + i.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-charcoal text-3xl font-semibold">Invoices</h1>
        <p className="text-charcoal/50 text-sm mt-1">Your payment history</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-cream-dark rounded-sm p-4 shadow-premium">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <p className="text-charcoal/50 text-xs uppercase tracking-wider">Total Paid</p>
          </div>
          <p className="font-serif text-charcoal text-2xl font-semibold">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white border border-red-100 rounded-sm p-4 shadow-premium">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-red-400" />
            <p className="text-charcoal/50 text-xs uppercase tracking-wider">Total Due</p>
          </div>
          <p className="font-serif text-red-500 text-2xl font-semibold">{formatCurrency(totalDue)}</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-20 bg-white border border-cream-dark rounded-sm">
          <Receipt size={40} className="text-gold/30 mx-auto mb-4" />
          <p className="font-serif text-charcoal/50 text-xl">No invoices yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className={`bg-white border rounded-sm shadow-premium p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                inv.is_paid ? "border-cream-dark" : "border-red-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-charcoal font-medium">{inv.description}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      inv.is_paid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {inv.is_paid ? "PAID" : "UNPAID"}
                  </span>
                </div>
                <p className="text-charcoal/40 text-xs">
                  #{inv.invoice_number} · Issued {formatDate(inv.issue_date)} · Due {formatDate(inv.due_date)}
                </p>
                {inv.paid_at && (
                  <p className="text-emerald-600 text-xs mt-0.5">Paid on {formatDate(inv.paid_at)}</p>
                )}
              </div>
              <p
                className={`font-serif text-xl font-semibold shrink-0 ${
                  inv.is_paid ? "text-charcoal" : "text-red-500"
                }`}
              >
                {formatCurrency(inv.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
