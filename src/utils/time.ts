const _1MS = 1;
const _10MS = 10;
const _100MS = 100;
const NANOSECONDS_SCALE = 1000;

export const nanoToMilli = (nano: number) => Math.pow(10, -6) * nano;

export const numChunksOfMilli = ({
  time,
  scale,
}: {
  time: number;
  scale: number;
}): number => {
  let numChunks = Math.floor(time / scale);

  if (time % scale) {
    numChunks += 1;
  }

  return numChunks;
};

export const getNumChunksOfTime = (
  time: number
): {numChunksOfTime: number; scale: number} => {
  let numChunksOfTime = numChunksOfMilli({time, scale: _100MS});

  if (numChunksOfTime > 1) {
    return {numChunksOfTime, scale: _100MS};
  }

  numChunksOfTime = numChunksOfMilli({time, scale: _10MS});

  if (numChunksOfTime > 1) {
    return {numChunksOfTime, scale: _10MS};
  }

  return {numChunksOfTime: numChunksOfMilli({time, scale: _1MS}), scale: _1MS};
};
