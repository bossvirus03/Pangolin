import { Thread } from "src/db/models/threadModel";
interface Rankup {
  get(tid: string): Promise<string>;
  set(tid: string, value: boolean): Promise<void>;
}
export interface IThreadData {
  set(tid: string, name: string): Promise<void>;
  setPrefix(tid: string, prefix: string): Promise<void>;
  getAll(): Promise<Thread[]>;
  get(tid: string): Promise<Thread | null>;
  prefix(tid: string): Promise<string>;
  rankup: Rankup;
}
