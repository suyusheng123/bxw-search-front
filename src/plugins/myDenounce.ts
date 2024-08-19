/**
 * 防抖函数
 */
const myDenounce = function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timer: any;
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as T;
};
export default myDenounce;
