### Competition

https://github.com/TypeStrong/typedoc

> The largest attempt at pulling documentation out of typescript.
> Every single time I've tried to install this over the years (at least half a dozen) it's been broken beyond all hell.
> Stagnant and useless as tool, but AST introspection code may serve as some inspiration

https://github.com/reactjs/react-docgen

> Quite outdated. Reads PropTypes and spits out JSON. JSONy-AST is related to flow
> Won't support typescript's interfaces/etc
> Useful place to point people who don't want to use typescript way of notating props

https://github.com/compodoc/compodoc

> Advance as hell, turns angular app into style guide. Kind of like what I want 'react-grimoire' to eventually be.

### Useful libraries

https://github.com/dsherret/ts-simple-ast

> A slightly nicer API to the AST, but underpowered.
> Will be good for inspiration on how to do things like reference lookups.

### Official Documentation

https://github.com/Microsoft/TypeScript-wiki/blob/master/Using-the-Compiler-API.md

> The "Using the Type Checker" example will be quite valuable. It creates a JSON object mirroring the structure of exported classes, complete with type info and documentation


##### Things to snatch

https://sourcegraph.com/github.com/dsherret/ts-simple-ast@71074b516b7b1c7e3138b5f3e468c258a8510804/-/blob/src/utils/CompilerOptionsResolver.ts#L34-35

> Load `ts.CompilerOptions` from tsconfig.