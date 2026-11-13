export declare class StructuredMessageDecoding {
    private pushData;
    private segmentsCount;
    private currentOffset;
    private currentDataOffset;
    private messageHeaderBuffer;
    private messageHeaderOffset;
    private segmentNumber;
    private segmentHeaderOffset;
    private segmentHeaderBuffer;
    private segmentContentOffset;
    private segmentContentLength;
    private segmentFooterOffset;
    private segmentFooterBuffer;
    private messageFooterOffset;
    private messageFooterBuffer;
    private segmentCrc64;
    private messageCrc64;
    private state;
    constructor(pushData: (data: any) => any);
    sourceDataHandler: (data: Uint8Array) => void;
    private parseMessageHeader;
    private parseSegmentHeader;
    private parseSegmentContent;
    private parseSegmentFooter;
    private parseMessageFooter;
    private toInt64;
    private toInt16;
    private checkCrc64CheckSum;
}
//# sourceMappingURL=StructuredMessageDecoding.d.ts.map