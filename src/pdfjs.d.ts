// pdfjs-dist v3 ships its types from the main entry; the legacy build path and
// the Vite ?url worker import need their own minimal declarations.
declare module 'pdfjs-dist/legacy/build/pdf' {
  export * from 'pdfjs-dist';
}
declare module 'pdfjs-dist/legacy/build/pdf.worker.min.js?url' {
  const url: string;
  export default url;
}
