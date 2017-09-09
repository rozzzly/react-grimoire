import * as path from 'path';
import * as fs from 'fs-extra-promise';
import * as ts from 'typescript';

import { Falsifiable } from 'src/misc';

export function resolveFixture(dir: string): string;
export function resolveFixture(dir: string, fixture: string): string;
export function resolveFixture(dir: string, fixture?: string): string {
    if (fixture) {
        return path.join(dir, 'fixture.tsx');
    } else {
        if (fixture.endsWith('.fixture.tsx')) return path.join(dir, fixture);
        else return path.join(dir, fixture, '.fixture.tsx');
    }
}


export async function loadFixture(dir: string, fixture?: string): Promise<Falsifiable<ts.Program>> {
    const fixturePath = resolveFixture(dir, fixture);

    // test to see if fixture file even exists/can be read
    let canRead: boolean = false;
    let error: Falsifiable<Error> = false;
    try {
        const stats = await fs.statAsync(fixturePath);
        if (stats) canRead = true;
    } catch (e) {
        error = e;
    }

    if (!canRead) { // reject with pretty error if we cannot read/find fixture
        return Promise.reject({ 
            message: 'No (readable) fixture exists at resolved path',
            fixture,
            resolvedPath: fixturePath,
            error
        });
    } else {
        const program = ts.createProgram([fixturePath], {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext
        });
        return program;
    }
}