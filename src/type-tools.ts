import * as ts from 'typescript'

export type NodesArray = ts.Node[] | ts.NodeArray<ts.Node>;



export function filter(nodes: NodesArray, kind: ts.SyntaxKind.VariableStatement): ts.VariableStatement[];
export function filter(nodes: NodesArray, kind: ts.SyntaxKind): ts.Node[];
export function filter(nodes: NodesArray, kind: ts.SyntaxKind): ts.Node[] {
    return (nodes as ts.Node[]).filter(node => node.kind === kind);
}