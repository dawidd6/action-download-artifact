export declare const MESSAGE_VERSION: number;
export declare const MESSAGE_HEADER_LENGTH: number;
export declare const SEGMENT_HEADER_LENGTH: number;
export declare const FOOTER_LENGTH: number;
export declare const MAX_SEGMENT_CONTENT_LENGTH: number;
export declare class StructuredMessageEncoding {
    private pushData;
    private contentLength;
    readonly messageLength: number;
    constructor(pushData: (data: any) => any, contentLength: number);
    private currentDataOffset;
    private contentOffset;
    private segmentsCount;
    private messageHeaderBuffer;
    private segmentNumber;
    private segmentContentLength;
    private segmentContentOffset;
    private segmentCrc64;
    private messageCrc64;
    private state;
    sourceDataHandler: (data: Uint8Array) => void;
    private handlingMessageHeader;
    private handlingSegmentHeader;
    private handlingSegmentContent;
    private handlingSegmentFooter;
    private handlingMessageFooter;
    private fillInt64;
    private fillInt16;
}
//# sourceMappingURL=StructuredMessageEncoding.d.ts.map