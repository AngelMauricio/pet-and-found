"use client";

import { useState, useEffect } from 'react';

const nameOptions = ["Belinha", "Thor", "Amora", "Bóris", "Mel", "Luna", "Nina", "Meggie", "Pandora", "Luke", "Tom", "Simba", "Salém", "Oreo", "Bidu"];

export const AnimatedName = () => {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Evita o erro de Hydration (só renderiza após o mount no cliente)
  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % nameOptions.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <span className="text-sand-600">...</span>;

  return (
    <span className="text-sand-600 transition-all duration-500 ease-in-out">
      {nameOptions[index]}
    </span>
  );
};