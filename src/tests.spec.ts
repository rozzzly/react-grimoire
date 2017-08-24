
export interface Action<T> {
    type: T;
    payload: any;
    meta?: any;
}

export type CREATE_POST_ActionID = 'CREATE_POST';
export const CREATE_POST: CREATE_POST_ActionID = 'CREATE_POST';
export interface CREATE_POST_Action extends Action<CREATE_POST_ActionID> {
    payload: {
        title: string;
        content: string
    }
}
export const createPost = (title: string, content: string): CREATE_POST_Action => ({
    type: CREATE_POST,
    payload: { title, content }
});

export type DELETE_POST_ActionID = 'DELETE_POST';
export const DELETE_POST: DELETE_POST_ActionID = 'DELETE_POST';
export interface DELETE_POST_Action extends Action<DELETE_POST_ActionID> {
    payload: {
        id: number;
    }
}
export const deletePost = (id: number): DELETE_POST_Action => ({
    type: DELETE_POST,
    payload: { id }
});

export type KnownActionIDs = (
    | CREATE_POST_ActionID
    | DELETE_POST_ActionID
    // ...
);

export type KnownActions = (
    | CREATE_POST_Action
    | DELETE_POST_Action
    // ...
);


export interface Post {
    id: number;
    title: string;
    content: string;
}

export interface State {
    posts: Post[];
    // ...
}

const initialState: State = {
    posts: []
};

export type Lookup = {
    CREATE_POST: CREATE_POST_Action;
    DELETE_POST: DELETE_POST_Action;
}

function cast<T extends KnownActionIDs>(action: KnownActions, type: T): Lookup[T] {
    return undefined;
}

const foo = cast(undefined, 'CREATE_POST');
foo.payload



export default function Reducer(state: State = initialState, action: KnownActions): State {
    switch(action.type) {
        case CREATE_POST: 
            // action.payload._____ (completions for `title` and `content`, but not `id`
            return {
                ...state,
                posts: [
                    ...state.posts,
                    {
                        id: Math.random(),
                        title: action.payload.title,
                        content: action.payload.content
                    }
                ]
             };
        case DELETE_POST:
             return {
                 ...state,
                 posts: state.posts.filter(post => post.id !== action.payload.id) // completions for `id` on `action.payload`
             };
        default:
            return state;
    }
}
