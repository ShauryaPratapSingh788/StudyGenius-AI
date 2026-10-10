import confetti from 'canvas-confetti';

export const triggerQuizCelebration = () => {
  try {
    // Left burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#3b82f6'],
    });

    // Right burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#3b82f6'],
    });

    // Star burst after 200ms
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        shapes: ['circle', 'square'],
      });
    }, 200);
  } catch (e) {
    console.log('Confetti not available', e);
  }
};

export const triggerTaskSuccess = () => {
  try {
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { x: 0.5, y: 0.8 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
  } catch (e) {
    console.log('Confetti not available', e);
  }
};
