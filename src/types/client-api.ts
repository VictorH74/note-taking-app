import { ListablePageDataT } from "./page";

export type PageListStreamObserver = {
  onAdd(data: ListablePageDataT): void;
  onChange(data: ListablePageDataT): void;
  onRemove(data: ListablePageDataT): void;
};
