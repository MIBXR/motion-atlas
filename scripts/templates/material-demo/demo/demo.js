const demo = new URLSearchParams(location.search).get('demo') || 'pulse';
const frames = {
  pulse: [{ opacity: 0.4 }, { opacity: 1 }, { opacity: 0.4 }],
  slide: [{ transform: 'translateX(-80px)' }, { transform: 'translateX(80px)' }, { transform: 'translateX(-80px)' }],
};
document.querySelector('#sample').animate(frames[demo], {
  duration: 2000,
  iterations: matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Infinity,
});
