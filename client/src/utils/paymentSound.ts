// Soundbox Audio Feedback for Doorstep Payment Collection

// 1. Dual-tone pleasant payment success chime via Web Audio API
export const playPaymentChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Notes: C6 (1046.5Hz) then E6 (1318.5Hz) then G6 (1567.98Hz)
    const notes = [
      { freq: 1046.5, start: 0, duration: 0.12 },
      { freq: 1318.5, start: 0.1, duration: 0.14 },
      { freq: 1567.98, start: 0.22, duration: 0.35 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
};

// 2. Soundbox speech announcement e.g. "Payment of ₹362 received on Onbuggy UPI"
export const speakPaymentAnnouncement = (amount: number, method: 'UPI' | 'Cash' = 'UPI') => {
  playPaymentChime();

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // cancel any pending utterances

    setTimeout(() => {
      const text =
        method === 'UPI'
          ? `Payment of rupees ${amount} received on Onbuggy UPI`
          : `Cash payment of rupees ${amount} collected successfully`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      // Pick an en-IN voice if available, else standard English
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find((v) => v.lang.includes('en-IN') || v.name.includes('India'));
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      window.speechSynthesis.speak(utterance);
    }, 400);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};
