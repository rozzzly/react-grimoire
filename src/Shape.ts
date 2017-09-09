import { SFCInspector } from './inspectors/SFC';
import { ComponentFile } from './ComponentFile';

export type Shape = (
    & ComponentFile
    & SFCInspector
);