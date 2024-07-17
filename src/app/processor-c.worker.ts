
/**
 * @summary - listens for message sent to web-worker and execute the provided function wit message's data

 */
addEventListener('message', ({ data }) => {
  const result = HeavyComputation(data);

  //this function sends the computed message back to the main thread
  postMessage(result);
});

function HeavyComputation(input: number): number {
  let result = 0;
  for (let i = 0; i < 1e7; i++) {
    result += Math.sqrt(input + i);
  }
  return result;
}



/**
 * @summary - Using a web worker in `ProcessorCComponent` keeps the UI responsive during heavy computations by running tasks in the background.
 *  This improves performance, encapsulates complex logic for better maintainability,
 *  and enhances user experience by allowing uninterrupted interaction with the application.
 */