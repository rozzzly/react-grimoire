import * as ts from 'typescript';
import { Shape } from '../Shape';
import { filter } from '../type-tools';
import { log } from '../index';

export interface SFCInspector {
    identifyStatelessComponents(): ts.VariableDeclaration[];
    locateSymbolForPropTypesOnStatelessComponent(decl: ts.VariableDeclaration): ts.Symbol;
}

export default function(inspector: Shape): SFCInspector {
    const { src, chk, program } = inspector;

    inspector.identifyStatelessComponents = () =>(
        filter(src.statements, ts.SyntaxKind.VariableStatement) // just variable stmts
        .reduce((r, v) => [...r, ...v.declarationList.declarations], []) // flatten
        .filter(decl => { // only variables with the type of SFC
            const declType = chk.getTypeAtLocation(decl);
            if(chk.getFullyQualifiedName(declType.symbol) === 'React.StatelessComponent') {
                return true; // typed as an SFC<?>
            } else {
                return false; // has a different type
            }
        })
    );

    inspector.locateSymbolForPropTypesOnStatelessComponent = (decl: ts.VariableDeclaration): ts.Symbol => {
        if (decl.type && ts.isTypeReferenceNode(decl.type)) {
            if (decl.type.typeArguments.length === 1) {
                const ref: ts.TypeNode = decl.type.typeArguments[0];
                /**
                 * Could also be achieved by searching `Symbol`s in the scope for one with the same identifier
                 *
                 * eg:
                 * ```typescript
                 * const propsIdentifier = props.getText();
                 * const symbolsInScope = chk.getSymbolsInScope(decl, ts.SymbolFlags.Interface);
                 * const matchingSymbol = symbolsInScope.find(sym => sym.name === propsIdentifier);
                 * ```
                 *
                 * I assume this is what the current implementation essentially does behind the scenes,
                 * but would expect that it probably has extra checks for edge cases built-in.
                 *
                 * The reason I'm using im not using this is method is that I image (but have yet to test)
                 * that there could be issues with type aliases and the like.
                 **/
                const type = chk.getTypeFromTypeNode(ref);
                if (!type.symbol) {
                    log({ decl, ref, type });
                    throw new ReferenceError('Could not get `Symbol` linked to PropTypes of component.');
                } else {
                    return type.symbol;
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

    return inspector;
}