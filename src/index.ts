import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as ts from 'typescript';

import AST, { SourceFile } from 'ts-simple-ast';

export const FIXTURE_ROOT: string = path.resolve(__dirname, '..', 'fixtures');
export const TSCONFIG_PATH: string = path.resolve(__dirname, '..', 'tsconfig.json');

export async function loadFixture(fixture: string): Promise<string | false> {
    let pathToTest: string = fixture;

    if (!path.isAbsolute(fixture)) {
        pathToTest = path.join(FIXTURE_ROOT, pathToTest);
    }

    if (!pathToTest.endsWith('.ts') && !pathToTest.endsWith('.tsx')) {
        pathToTest += '.tsx';
    }

    try {
        const stats = await fs.statAsync(pathToTest);
        if (!stats) {
            console.error(`Failed to find fixture (${fixture}) at ${pathToTest}`);
            return false;
        }
    } catch (e) {
        console.error(`Failed to find fixture (${fixture}) at ${pathToTest}`, e);
        return false;
    }
    
    try {
        const content = await fs.readFileAsync(pathToTest);
        return content.toString();
    } catch (e) {
        console.error(`Failed reading fixture (${fixture}) at ${pathToTest}`, e)
        return false;
    }

}

export function getExportedVariables(src: SourceFile): void {
    const exports 
    src.getV
}

loadFixture('sfc').then(content => {
    const ast = new AST({ tsConfigFilePath: TSCONFIG_PATH })
    ast.addSourceFiles(path.join(FIXTURE_ROOT, 'sfc.tsx'));
    const src = ast.getSourceFiles();
    src[0].compilerNode
    src[0].getVariableStatements()[0].compilerNode.getChildren().forEach(node => {
        console.log({
            kind: node.kind,
            kindName: ts.SyntaxKind[node.kind],
            fullText: node.getFullText(),
            text: node.getText()
        });
    })
});