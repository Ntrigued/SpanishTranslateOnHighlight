
export function debounce(func){
  let timer;
  return (...args) => {  
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args)
    }, 250);
  };
}