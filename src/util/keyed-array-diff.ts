export type KeyFunc = (obj: any) => string | number;
export type KeyMap = {[key: string]: {item: any, index: string}};

export type AdditionList = {
  /**
   *
   * The index that the item was added on.
   *
   */
  index: string, 

  /**
   *
   * The added item
   *
   */
  item: any
}[];

export type DeletionList = {
  /**
   *
   * The index the deleted item used to be on
   *
   */
  index: string,

  /**
   *
   * The deleted item
   *
   */
  item: any
}[];

export type MoveList = {
  /**
   *
   * The index the item used to be on
   *
   */
  oldIndex: string,
  /**
   *
   * The new index of the item
   *
   */
  newIndex: string,

  /**
   *
   * The moved item
   *
   */
  item: any
}[];

export type ChangeMap = {
  /**
   *
   * List of items added to the list
   *
   */
  additions: AdditionList,

  /**
   *
   * List of items removed from the list
   *
   */
  deletions: DeletionList,

  /**
   *
   * List of items moved around in the list
   *
   */
  moves: MoveList
};


export function diff(value: any, oldKeyMap: KeyMap, keyfunc: KeyFunc): {
  changes: ChangeMap,
  newKeyMap: KeyMap
} {
  const additions: AdditionList = [];
  const deletions: DeletionList = [];
  const moves: MoveList = [];

  const newKeyMap = Object.entries(value).reduce((map, [index, item]) => {
    const _key = keyfunc(item);
    map[_key] = { index, item };
    if (!(_key in oldKeyMap))
      additions.push({ index, item });
    return map;
  }, <KeyMap>{});

  Object.entries(oldKeyMap).forEach(([_key, entry]) => {
    if (!(_key in newKeyMap)) deletions.push(entry);
    else {
      const _newEntry = newKeyMap[_key];
      if (_newEntry.index != entry.index) 
        moves.push({
          oldIndex: entry.index,
          newIndex: _newEntry.index,
          item: entry.item
        });
    }
  });

  return {
    changes: { additions, deletions, moves },
    newKeyMap,
  };
}
