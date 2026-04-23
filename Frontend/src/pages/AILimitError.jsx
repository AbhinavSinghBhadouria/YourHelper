import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Custom Inline Icons to avoid dependency issues
const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 animate-pulse">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const AILimitError = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = React.useState(4);

  useEffect(() => {
    // Visual countdown
    const countdown = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Actual redirect
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 4000);

    return () => {
      clearInterval(countdown);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="relative bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <AlertCircleIcon />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            AI is Taking a <span className="text-blue-500">Breather</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Our AI engine is currently at maximum capacity. We're sorry for the wait!
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="py-3 px-6 bg-slate-900/50 rounded-xl border border-slate-800/50 text-slate-500 text-sm">
            Redirecting to dashboard in <span className="text-blue-500 font-mono font-bold">{timeLeft}s</span>...
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-2xl border border-slate-800 transition-all active:scale-95 shadow-xl"
          >
            <ArrowLeftIcon />
            Go to Dashboard Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AILimitError;
