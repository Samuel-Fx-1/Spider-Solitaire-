import { useState, useRef, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

export default function App() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [pasted, setPasted] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Focus first empty input on mount
  useEffect(() => {
    const firstEmptyIndex = digits.findIndex(d => d === '');
    setFocusedIndex(firstEmptyIndex === -1 ? 0 : firstEmptyIndex);
    inputRefs.current[firstEmptyIndex === -1 ? 0 : firstEmptyIndex]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerShake = useCallback(() => {
    setShake(true);
    setError('Invalid verification code. Please try again.');
    setTimeout(() => setShake(false), 400);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    
    if (!pastedData) return;

    setPasted(true);
    setTimeout(() => setPasted(false), 300);

    const newDigits = [...digits];
    const startIndex = digits.findIndex(d => d === '');
    const start = startIndex === -1 ? 0 : startIndex;

    for (let i = 0; i < pastedData.length; i++) {
      if (start + i < OTP_LENGTH) {
        newDigits[start + i] = pastedData[i];
      }
    }
    setDigits(newDigits);

    // Focus next empty or last
    const nextEmptyIndex = newDigits.findIndex(d => d === '');
    const focusIndex = nextEmptyIndex === -1 ? OTP_LENGTH - 1 : nextEmptyIndex;
    setFocusedIndex(focusIndex);
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (newDigits.every(d => d !== '') && newDigits.join('').length === OTP_LENGTH) {
      setTimeout(() => handleSubmit(newDigits.join('')), 100);
    }
  }, [digits]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 1) {
      // Handle paste from individual input
      const pastedValue = value.slice(0, OTP_LENGTH - index);
      const newDigits = [...digits];
      for (let i = 0; i < pastedValue.length && index + i < OTP_LENGTH; i++) {
        newDigits[index + i] = pastedValue[i];
      }
      setDigits(newDigits);
      const nextIndex = Math.min(index + pastedValue.length, OTP_LENGTH - 1);
      setFocusedIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      
      if (newDigits.every(d => d !== '')) {
        setTimeout(() => handleSubmit(newDigits.join('')), 100);
      }
      return;
    }

    setError('');
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < OTP_LENGTH - 1) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d !== '') && newDigits.join('').length === OTP_LENGTH) {
      setTimeout(() => handleSubmit(newDigits.join('')), 100);
    }
  }, [digits]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        setFocusedIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
      setError('');
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits]);

  const handleSubmit = async (code?: string) => {
    const otpCode = code || digits.join('');
    
    if (otpCode.length !== OTP_LENGTH) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success (in real app, validate with backend)
    if (otpCode === '123456' || otpCode === '000000') {
      setIsSuccess(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setDigits(Array(OTP_LENGTH).fill(''));
      setFocusedIndex(0);
      triggerShake();
      setTimeout(() => inputRefs.current[0]?.focus(), 450);
    }
  };

  const handleResend = () => {
    setCanResend(false);
    setTimeLeft(COUNTDOWN_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    setFocusedIndex(0);
    setError('');
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const isComplete = digits.every(d => d !== '');

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-success-check">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Verified!</h2>
          <p className="text-slate-400 mb-6">Your phone number has been successfully verified.</p>
          <button
            onClick={() => {
              setIsSuccess(false);
              handleResend();
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Verify another number
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl max-w-md w-full relative z-10 border border-slate-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Verify your phone</h1>
          <p className="text-slate-400 text-sm">
            Enter the 6-digit code sent to<br />
            <span className="text-slate-300 font-medium">+1 (555) 123-4567</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div
          className={`flex justify-center gap-2 md:gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}
          onPaste={handlePaste}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              disabled={isLoading}
              className={`
                w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold
                bg-slate-900/50 border-2 rounded-lg
                transition-all duration-200 outline-none
                ${pasted && digit ? 'bg-indigo-500/20 border-indigo-500' : ''}
                ${focusedIndex === index && !shake
                  ? 'border-indigo-500 ring-4 ring-indigo-500/20' 
                  : digit 
                    ? 'border-slate-600 bg-slate-900/80' 
                    : 'border-slate-700'
                }
                ${shake ? 'border-red-500' : ''}
                ${isLoading ? 'opacity-50' : 'cursor-text'}
              `}
              style={{ fontFamily: 'ui-monospace, monospace' }}
            />
          ))}
        </div>

        {/* Error Message */}
        <div className={`h-6 mb-4 text-center transition-all duration-200 ${error ? 'opacity-100 text-red-400 text-sm' : 'opacity-0'}`}>
          {error}
        </div>

        {/* Test hint */}
        <p className="text-center text-slate-500 text-xs mb-4">
          Try codes: 123456 or 000000
        </p>

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!isComplete || isLoading}
          className={`
            w-full py-4 rounded-xl font-semibold text-base
            transition-all duration-200 flex items-center justify-center gap-2
            ${isComplete && !isLoading
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </button>

        {/* Timer / Resend */}
        <div className="mt-6 text-center">
          {timeLeft > 0 ? (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Resend in <span className="text-slate-300 font-medium tabular-nums">{formatTime(timeLeft)}</span></span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              className={`
                text-indigo-400 hover:text-indigo-300 font-medium text-sm
                transition-all duration-300
                ${canResend ? 'animate-pulse-glow' : ''}
              `}
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Back to change number */}
        <button className="mt-4 text-slate-500 hover:text-slate-400 text-sm transition-colors flex items-center justify-center gap-1 w-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Use a different number
        </button>
      </div>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-out;
        }

        @keyframes success-check {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-success-check {
          animation: success-check 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
          }
          50% { 
            box-shadow: 0 0 20px 4px rgba(99, 102, 241, 0.4);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
