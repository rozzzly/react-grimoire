import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as ts from 'typescript';

import AST from 'ts-simple-ast';

export type Falsifiable<T> = T | false;


export const FIXTURE_ROOT: string = path.resolve(__dirname, '..', 'fixtures');
export const TSCONFIG_PATH: string = path.resolve(__dirname, '..', 'tsconfig.json');

export async function resolveFixture(fixture: string): Promise<string | false> {
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

export async function loadFixture(file: string): Promise<ts.Program> {

}

export function printKind(node: ts.Node): void {
    console.log(ts.SyntaxKind[node.kind]);
}
export function printKindsOfChildren(node: ts.Node): void {
    node.getChildren().forEach(printKind);
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

loadFixture('sfc').then(content => {
    const ast = new AST({ tsConfigFilePath: TSCONFIG_PATH })
    ast.addSourceFiles(path.join(FIXTURE_ROOT, 'sfc.tsx'));
    const src = ast.getSourceFiles()[0].compilerNode;

    console.log(identifyReact(src));
    console.log(getExports(src).map(exp => exp.getText()))
    
});

