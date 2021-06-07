const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const sequencer = async (callbacks=[], i=0) => {
  if (i < callbacks.length) {
    result = null
    if (typeof callbacks[i] == 'function') {
      await callbacks[i]();
    } else if (typeof callbacks[i] == 'number'){
      await sleep(callbacks[i])
    } else {
      return;
    }
    sequencer(callbacks, i + 1)
  }
}

module.exports = {
  sequencer: sequencer,
  sleep: sleep
}