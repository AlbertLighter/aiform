// 扩展FormData接口以包含entries方法
declare global {
  interface FormData {
    entries(): IterableIterator<[string, FormDataEntryValue]>;
  }
}

export {}; 