import * as ts from 'typescript';
import { Shape } from './Shape';

export interface ComponentFile {
    filePath: string;
    program: ts.Program;
    chk: ts.TypeChecker;
    src: ts.SourceFile;
    loadFile(filePath: string): void;

}

export default function(this: Shape) {
    this.loadFile = (filePath: string): void => {
        this.filePath = filePath
        this.program = ts.createProgram([this.filePath], {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext
        });
        this.chk = this.program.getTypeChecker();
        this.src = this.program.getSourceFile(this.filePath);
    };
}



