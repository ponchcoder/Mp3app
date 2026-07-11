/**
 * Type declarations for jsmediatags
 */
declare module "jsmediatags" {
  interface Tags {
    title?: string;
    artist?: string;
    album?: string;
    picture?: {
      data: number[];
      format: string;
    };
  }

  interface ReadResult {
    tags: Tags;
  }

  interface Reader {
    onSuccess: (tag: ReadResult) => void;
    onError: (error: Error) => void;
  }

  interface JsMediaTags {
    read(file: File | Blob, reader: Reader): void;
  }

  const jsmediatags: JsMediaTags;

  export default jsmediatags;
}
