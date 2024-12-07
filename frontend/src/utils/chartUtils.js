export const getSynchronizedDataIndex = (fromTime, data) => {
  //convert "from time" string to a timestamp
  const fromTimestamp = new Date(fromTime).getTime();

  //find the closest index in the data array
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