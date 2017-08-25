import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as ts from 'typescript';

import AST from 'ts-simple-ast';
import { filter } from './type-tools';

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

export function log<D extends {}>(data: D): void {
    console.error(JSON.stringify(data));
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

export function identifyStatelessComponents(chk: ts.TypeChecker, src: ts.SourceFile): ts.VariableDeclaration[] {
    return (
        filter(src.statements, ts.SyntaxKind.VariableStatement) // just variable stmts
        .reduce((r, v) => [...r, ...v.declarationList.declarations], []) // flatten
        .filter(decl => { // only variables with the type of SFC
            const declType = chk.getTypeAtLocation(decl);
            if(chk.getFullyQualifiedName(declType.symbol) === 'React.StatelessComponent') {
                return true; // typed as an SFC
            } else {
                return false; // has a different type
            }
        })
    );
}

export function getJSDocOnStatelessComponent(decl: ts.VariableDeclaration) {
    const parentNode = decl.parent;
    if (parentNode && ts.isVariableDeclarationList(parentNode)) {
        const grandfatherNode = parentNode.parent;
        if (ts.isVariableStatement(grandfatherNode)) {
            if (grandfatherNode.jsDoc)
        } else {
            log({ decl, parentNode })
            throw new TypeError('Unexpected `SyntaxKind` for grandfather node. Expected parent of a `VariableDeclaration` to be a `VariableDeclarationList`!');
        }
    } else {
        // not trying to pull JSDoc off of a `CatchClause`
        log({ decl });
        throw new TypeError('Unexpected `SyntaxKind` for parent. Expected parent of a `VariableDeclaration` to be a `VariableDeclarationList`!');
    }
}

export function locateSymbolForPropTypesOnStatelessComponent(chk: ts.TypeChecker, decl: ts.VariableDeclaration): ts.Symbol {
    if (decl.type && ts.isTypeReferenceNode(decl.type)) {
        if (decl.type.typeArguments.length === 1) {
            const props = decl.type.typeArguments[0];
            const propsIdentifier = props.getText();
            const symbolsInScope = chk.getSymbolsInScope(decl, ts.SymbolFlags.Interface);
            const matchingSymbol = symbolsInScope.find(sym => sym.name === propsIdentifier);
            if (matchingSymbol) {
                return matchingSymbol;
            } else {
                log({
                    decl,
                    props,
                    propsIdentifier,
                    symbolsInScope
                });
                throw new ReferenceError('Could not find the referenced `Symbol`! ');
            }
        } else {
            log({ decl,  name });
            throw new RangeError('Unexpected number of `typeArguments`!')
        }
    } else {
        log({ decl });
        throw new TypeError('Expected `SyntaxKind` to be a `TypeReferenceNode`!')
    }
}

resolveFixture('sfc').then(fixturePath => {
    const program = loadFixture(fixturePath);
    console.log(`tsserver loaded ${program.getSourceFiles().length} files.`);
    const chk = program.getTypeChecker();
    const src = program.getSourceFile(fixturePath);
    const reactReferences = identifyReact(src);
    console.log(reactReferences);
    
    identifyStatelessComponents(chk, src).forEach(sfc => {
        console.log(sfc);
        console.log(locateSymbolForPropTypesOnStatelessComponent(chk, sfc));
        console.log('----------------------------------------');
    });

    // const foo = Button.forEach(shit => console.log(shit.declarationList.declarations[0].name.getText()));
    // display(Button);
    // console.log(chk.getTypeAtLocation(Button.declarationList.declarations[0].name));
});

