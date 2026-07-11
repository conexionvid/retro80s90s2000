import React, { useState, useEffect } from 'react';

export function Header() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 left-0 right-4 md:right-6 z-30 font-sans text-right pointer-events-none">
      <span className="text-white/80 font-medium tracking-wide text-[10px] sm:text-xs md:text-sm drop-shadow-md">
        Conexion Vid Radio son las {time}
      </span>
    </div>
  );
}
