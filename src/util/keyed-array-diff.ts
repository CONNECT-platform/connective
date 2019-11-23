export type KeyFunc = (obj: any) => string | number;
export type KeyMap = {[key: string]: {item: any, index: string}};

export type AdditionList = {index: string, item: any}[];
export type DeletionList = {index: string, item: any}[];
export type MoveList = {oldIndex: string, newIndex: string, item: any}[];
export type ChangeMap = { additions: AdditionList, deletions: DeletionList, moves: MoveList };


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
