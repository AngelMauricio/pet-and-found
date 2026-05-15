"use client";

import { useState, useEffect } from 'react';

const nameOptions = ["Belinha", "Thor", "Amora", "Bóris", "Mel", "Luna", "Nina", "Meggie", "Luke", "Tom", "Simba", "Salém", "Oreo", "Bidu"];

export const AnimatedName = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % nameOptions.length);
        setVisible(true);
      }, 500); 

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <span className="text-sand-600">...</span>;

  return (
    <span 
      className={`text-sand-600 inline-block transition-all duration-500 ease-in-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {nameOptions[index]}
    </span>
  );
};