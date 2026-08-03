export function setupCounter(element) {
  let counter = 0;

  const setCounter = (count) => {
    counter = count;
    element.textContent = `count is ${counter}`;
  };

  setCounter(0);
}
