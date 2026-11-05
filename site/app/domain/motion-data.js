export const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${(seconds % 60).toFixed(2).padStart(5, '0')}`;

export function energyPoints(entry, duration = entry.rhythm?.duration) {
  return entry.energySegments?.length && duration
    ? entry.energySegments.flatMap((segment) => [
        [segment.t0 / duration, segment.from],
        [segment.t1 / duration, segment.to],
      ])
    : (entry.energy || []).map((value, index, values) => [
        index / Math.max(1, values.length - 1),
        value,
      ]);
}

export function energyPath(entry, width = 100, height = 26) {
  const points = energyPoints(entry).map(([time, value]) => [
    time * width,
    height - 2 - value * (height - 4),
  ]);
  return points
    .map((point, index) => `${index ? 'L' : 'M'}${point[0]} ${point[1]}`)
    .join('');
}
