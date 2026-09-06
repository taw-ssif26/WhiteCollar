"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { publicAPI } from "@/lib/api";
import { ImageIcon } from "lucide-react";

const MOCK_GALLERY = [
  { id: "1", title: "IELTS Batch — Spring 2025", category: "Classes", image_url: null },
  { id: "2", title: "Annual Olympiad Ceremony", category: "Events", image_url: null },
  { id: "3", title: "Corporate Workshop", category: "Events", image_url: null },
  { id: "4", title: "Classroom Session — Batch B", category: "Classes", image_url: null },
  { id: "5", title: "Certificate Distribution", category: "Achievements", image_url: null },
  { id: "6", title: "Speaking Practice Session", category: "Classes", image_url: null },
];

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([publicAPI.gallery(), publicAPI.galleryCategories()])
      .then(([galleryRes, catRes]) => {
        const galleryData = galleryRes.data.length > 0 ? galleryRes.data : MOCK_GALLERY;
        setItems(galleryData);
        setCategories(["All", ...(catRes.data.length > 0 ? catRes.data : ["Classes", "Events", "Achievements"])]);
      })
      .catch(() => {
        setItems(MOCK_GALLERY);
        setCategories(["All", "Classes", "Events", "Achievements"]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="bg-ivory pt-16">
      {/* Header */}
      <section className="bg-charcoal py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">Gallery</p>
          <h1 className="font-serif text-ivory text-5xl font-semibold">Life at White-Collar</h1>
          <div className="gold-divider max-w-sm mt-6" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Category filter */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-sm font-medium rounded-sm border transition-all ${
                activeCategory === cat
                  ? "bg-charcoal text-ivory border-charcoal"
                  : "border-cream-dark text-charcoal/70 hover:border-gold/50 hover:text-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-cream rounded-sm animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon size={40} className="text-gold/40 mx-auto mb-4" />
            <p className="text-charcoal/50">No photos in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square bg-charcoal-light rounded-sm overflow-hidden border border-cream-dark hover:border-gold/30 transition-all shadow-premium"
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageIcon size={32} className="text-gold/30" />
                    <p className="text-ivory/20 text-xs mt-2 px-4 text-center">{item.title}</p>
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/60 transition-all duration-300 flex items-end">
                  <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-ivory text-sm font-medium">{item.title}</p>
                    <p className="text-gold text-xs mt-0.5">{item.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
