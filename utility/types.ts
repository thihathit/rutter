import { Simplify, Writable } from 'type-fest'

export type EditorFriendly<T> = Simplify<Writable<T>>
