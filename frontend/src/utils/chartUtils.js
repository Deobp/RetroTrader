export const getSynchronizedDataIndex = (fromTime, data) => {
  const fromTimestamp = new Date(fromTime).getTime();

  let closestIndex = 0;
  let closestDiff = Infinity;

  data.forEach((item, index) => {
    const diff = Math.abs(item.time * 1000 - fromTimestamp);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = index;
    }
  });

  return closestIndex;
};