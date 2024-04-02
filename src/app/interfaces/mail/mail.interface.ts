export default interface IMail {
  from: string;
  to: string;
  subject: string;
  template: string;
  context: any;
}
