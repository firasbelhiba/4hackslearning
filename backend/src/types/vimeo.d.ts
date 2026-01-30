declare module '@vimeo/vimeo' {
  export class Vimeo {
    constructor(clientId: string, clientSecret: string, accessToken: string);

    request(
      options: {
        method: string;
        path: string;
        query?: Record<string, any>;
      } | string,
      callback: (error: any, body: any, statusCode?: number, headers?: any) => void
    ): void;

    upload(
      filePath: string,
      options: {
        name?: string;
        description?: string;
        privacy?: {
          view?: string;
          embed?: string;
        };
      },
      completeCallback: (uri: string) => void,
      progressCallback?: (bytesUploaded: number, bytesTotal: number) => void,
      errorCallback?: (error: any) => void
    ): void;
  }
}
