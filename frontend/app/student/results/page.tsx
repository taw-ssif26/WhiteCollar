"use client";

import { useEffect, useState } from "react";
import { studentPortalAPI } from "@/lib/api";
import { formatDate, getGrade } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { generateResultPDF } from "@/lib/pdf";

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([studentPortalAPI.results(), studentPortalAPI.profile()])
      .then(([rRes, pRes]) => { setResults(rRes.data); setProfile(pRes.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (result: any) => {
    generateResultPDF({
      student_name: profile?.name || "",
      student_id: profile?.student_id || "",
      exam_name: result.exam_name,
      total_marks: result.total_marks,
      obtained_marks: result.obtained_marks,
      percentage: result.percentage,
      exam_date: formatDate(result.exam_date),
      remarks: result.remarks,
    });
  };

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
        <h1 className="font-serif text-charcoal text-3xl font-semibold">My Results</h1>
        <p className="text-charcoal/50 text-sm mt-1">{results.length} exam{results.length !== 1 ? "s" : ""} recorded</p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-white border border-cream-dark rounded-sm">
          <FileText size={40} className="text-gold/30 mx-auto mb-4" />
          <p className="font-serif text-charcoal/50 text-xl">No results yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map((result) => {
            const grade = getGrade(result.percentage);
            return (
              <div key={result.id} className="bg-white border border-cream-dark rounded-sm shadow-premium p-5 hover:border-gold/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-serif text-charcoal font-semibold text-lg">{result.exam_name}</h2>
                    <p className="text-charcoal/50 text-xs mt-0.5">{formatDate(result.exam_date)}</p>
                    {result.remarks && <p className="text-charcoal/60 text-xs italic mt-2">"{result.remarks}"</p>}
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Score bar */}
                    <div className="min-w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-charcoal/50">Score</span>
                        <span className="text-charcoal font-medium">{result.obtained_marks}/{result.total_marks}</span>
                      </div>
                      <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
                        <div className="h-full bg-gold-gradient rounded-full transition-all" style={{ width: `${result.percentage}%` }} />
                      </div>
                    </div>
                    {/* Grade */}
                    <div className="text-center min-w-12">
                      <p className={`font-serif text-2xl font-bold ${grade.color}`}>{grade.label}</p>
                      <p className="text-charcoal/50 text-xs">{result.percentage}%</p>
                    </div>
                    {/* Download */}
                    <button
                      onClick={() => handleDownload(result)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gold/40 text-gold text-xs font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-colors"
                      title="Download result slip"
                    >
                      <Download size={13} /> PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
