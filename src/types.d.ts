// TypeScript类型声明

declare namespace NodeJS {
  interface Timeout {}
}

// 自定义事件类型
interface CustomEventMap {
  'aiform-restore-data': CustomEvent<Record<string, any>>;
}

declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): boolean;
  }
} 