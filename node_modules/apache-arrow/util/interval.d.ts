export interface IntervalMonthDayNanoObject<StringifyNano extends boolean = false> {
    months: number;
    days: number;
    nanoseconds: StringifyNano extends true ? string : bigint | number;
}
export interface IntervalDayTimeObject {
    days: number;
    milliseconds: number;
}
export declare function toIntervalDayTimeInt32Array(objects: IntervalDayTimeObject[]): Int32Array;
export declare function toIntervalMonthDayNanoInt32Array(objects: Partial<IntervalMonthDayNanoObject>[]): Int32Array;
export declare function toIntervalDayTimeObjects(array: Int32Array): IntervalDayTimeObject[];
/** @ignore */
export declare function toIntervalMonthDayNanoObjects<StringifyNano extends boolean>(array: Int32Array, stringifyNano: StringifyNano): IntervalMonthDayNanoObject<StringifyNano>[];
