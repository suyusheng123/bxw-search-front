/**
 * 创建一个节流函数,确保在滚动的时候在规定的时间内只执行一次
 */
const myThrottle = function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle = true;
  return function (this: any, ...args: Parameters<T>) {
    if (inThrottle) {
      inThrottle = false;
      setTimeout(() => {
        func.apply(this, args);
        inThrottle = true;
      }, limit);
    }
  } as T;
};

export default myThrottle;
