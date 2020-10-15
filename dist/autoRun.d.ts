import Application from './Application';
declare const autoRun: <T, K extends keyof T>(fn: Function, application: Application<T, K>) => void;
export default autoRun;
