import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as ts from 'typescript';

import AST from 'ts-simple-ast';

export type Falsifiable<T> = T | false;


export const FIXTURE_ROOT: string = path.resolve(__dirname, '..', 'fixtures');
export const TSCONFIG_PATH: string = path.resolve(__dirname, '..', 'tsconfig.json');

export async function resolveFixture(fixture: string): Promise<string> {
    let fixturePath: string = fixture;

    // allow specifying path relative to fixture directory
    if (!path.isAbsolute(fixture)) {
        fixturePath = path.join(FIXTURE_ROOT, fixturePath);
    }

    // allow omission of file extension
    if (!fixturePath.endsWith('.ts') && !fixturePath.endsWith('.tsx')) {
        fixturePath += '.tsx';
    }

    // test to see if fixture file even exists.
    let canRead: boolean = false;
    let error: Falsifiable<Error> = false;
    try {
        const stats = await fs.statAsync(fixturePath);
        if (stats) canRead = true;
    } catch (e) {
        error = e;
    }
    
    if (canRead) return fixturePath;
    else {
        return Promise.reject({ 
            message: 'No fixture exists at resolved path',
            fixture,
            fixturePath,
            error
        });
    }
}

export function loadFixture(file: string): ts.Program {
    const program = ts.createProgram([file], {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext
    });
    return program;
}

export function display(node: ts.Node): void {
    console.log(`${ts.SyntaxKind[node.kind]}\t${JSON.stringify(node.getText())}`);
}


export function kind(node: ts.Node): void {
    console.log(ts.SyntaxKind[node.kind]);
}
export function kindsOfChildren(node: ts.Node): void {
    node.getChildren().forEach(kind);
}

export function getSyntaxList(node: ts.SyntaxList | ts.SourceFile): ts.SyntaxList {
    if (node.kind === ts.SyntaxKind.SyntaxList) return node as ts.SyntaxList;
    else if (node.kind === ts.SyntaxKind.SourceFile) return node.getChildren()[0] as ts.SyntaxList;
    else {
        throw new RangeError('Could not find the `SyntaxList`');
    }
}

export type Modifier = (
    | ts.SyntaxKind.AbstractKeyword
    | ts.SyntaxKind.AsyncKeyword
    | ts.SyntaxKind.ConstKeyword
    | ts.SyntaxKind.DeclareKeyword
    | ts.SyntaxKind.DefaultKeyword
    | ts.SyntaxKind.ExportKeyword
    | ts.SyntaxKind.PublicKeyword
    | ts.SyntaxKind.PrivateKeyword
    | ts.SyntaxKind.ProtectedKeyword
    | ts.SyntaxKind.ReadonlyKeyword
    | ts.SyntaxKind.StaticKeyword
);

export function hasModifier(node: ts.Node, modifierKind: Modifier): boolean {
    if (!node.modifiers || !node.modifiers.length) return false;
    else return node.modifiers.some(modifier => modifier.kind === modifierKind);
}

export type ReactImport = (
    | {
        type: 'namespace';
        identifier: string;
    }
    | {
        type: 'named';
        identifiers: (
            | string
            | {
                local: string;
                external: string;
            }
        )[]
    }
);

export function dequoteRawStringLiteral(str: string): Falsifiable<string> {
    const singleQuotes: RegExp = /^\'([\s\S]*)\'/;
    const doubleQuotes: RegExp = /^\"([\s\S]*)\"/;
    let match: RegExpExecArray;
    if (match = singleQuotes.exec(str)) {
        return match[1];
    } else if (match = doubleQuotes.exec(str)) {
        return match[2];
    } else { 
        return false;
    }

}

/**
 * Scans a source file and identifies react imports (ES2015 only currently)
 *
 * TODO::Handle top level CommonJS/require style imports of react
 *
 * @param src {ts.SourceFile} file to scan
 * @return {ReactImport[]} All the imported references to react.
 */
export function identifyReact(src: ts.SourceFile): ReactImport[] {
    const reactImports: ReactImport[] = [];
    (src.statements
        .filter(stmt => stmt.kind === ts.SyntaxKind.ImportDeclaration)
        .forEach((stmt: ts.ImportDeclaration): void => {
            const specifier = stmt.moduleSpecifier;
            if(specifier.kind === ts.SyntaxKind.StringLiteral && (specifier as ts.StringLiteral).text === 'react') {
                const binding = stmt.importClause.namedBindings;
                if (binding.kind === ts.SyntaxKind.NamespaceImport) { 
                    // using: `import * as React from 'react';`
                    reactImports.push({
                        type: 'namespace',
                        identifier: binding.name.text
                    });
                } else if (binding.kind === ts.SyntaxKind.NamedImports) {
                    // using: `import { SFC, Component as FooBar } from 'react';`
                    const identifiers: (string | { local: string, external: string })[] = [];
                    binding.elements.forEach(specifier => {
                        if (specifier.propertyName) {
                            // using `import { Component as FooBar } from 'react';`
                            identifiers.push({
                                local: specifier.name.text,
                                external: specifier.propertyName.text
                            })
                        } else {
                            // using `import { Component } from 'react';`
                            identifiers.push(specifier.name.text);
                        }
                    })
                    reactImports.push({
                        type: 'named',
                        identifiers
                    })
                }
            }
        })
    );
    return reactImports;
}

export function getExports(src: ts.SourceFile): ts.ExportDeclaration[] {
    const exported: any[] = [];
        //filter(stmt => stmt.kind === ts.SyntaxKind.VariableStatement)
    src.statements.forEach(stmt => {
        if (hasModifier(stmt, ts.SyntaxKind.ExportKeyword)) {
            exported.push(stmt);
        }
    })

    return exported;
}
export enum MyEnum {
    First = 0,
    Second = 1,
}

export type EnumMap = {
    [P in MyEnum]: string;
}

export type KnownNodes = (
    | ts.StringLiteral
    | ts.ComputedPropertyName
);
export type NodeTypes = keyof NodeLookup;

export function isKind(node: ts.Node, kind: ts.SyntaxKind.StringLiteral): node is ts.StringLiteral;
export function isKind(node: ts.Node, kind: ts.SyntaxKind): node is ts.Node {
    return node.kind === kind as any;
}

let foo: ts.Node; 
if(isKind(foo, ts.SyntaxKind.StringLiteral)) { 
    foo
} else {
    
}

function test(t: KnownNodes) {
    if (t.kind === ts.SyntaxKind.ComputedPropertyName) {
        
    }
}

// export function ofKind(nodes: KnownNodes[], kind: ts.SyntaxKind): ts.Node[];
// export function ofKind(nodes: KnownNodes[], kind: ts.SyntaxKind[]): ts.Node[];
export function ofKind<K extends ts.SyntaxKind>(nodes: KnownNodes[], kind: K | K[]): NodeLookup[K];
export function ofKind(nodes: KnownNodes[], kind: ts.SyntaxKind | ts.SyntaxKind[]): NodeLookup[kind] {
    if (Array.isArray(kind)) {
        return nodes.filter(node => kind.includes(node.kind));
    } else {
        return nodes.filter(node => node.kind === kind);
    }
}

resolveFixture('sfc').then(fixturePath => {
    const program = loadFixture(fixturePath);
    console.log(`tsserver loaded ${program.getSourceFiles().length} files.`);
    const chk = program.getTypeChecker();
    const src = program.getSourceFile(fixturePath);
    const reactReferences = identifyReact(src);
    console.log(reactReferences);
    const Button = ofKind(src.statements as any, ts.SyntaxKind.VariableStatement);
    const foo = Button.forEach(shit => console.log(shit.declarationList.declarations[0].name.getText()));
    // display(Button);
    // console.log(chk.getTypeAtLocation(Button.declarationList.declarations[0].name));
});

