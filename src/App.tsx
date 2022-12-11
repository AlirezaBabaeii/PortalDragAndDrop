import { UniqueIdentifier } from "@dnd-kit/core";
import React, { useRef } from "react";

import { SortableTree } from "./DraggableTree/SortableTree";
import { FlattenedItem, TreePosition } from "./DraggableTree/utils/types";
import sumBy from 'lodash/sumBy';



import {ItemContext} from './context';
import classNames from "classnames";
import Styles from './DraggableTree/TreeItem/TreeItem.module.css'
import { Add } from "./core/icons/Add";

export interface TreeItem {
  id: string;
  children: TreeItem[];
  collapsed?: boolean;
  root?:string;
  label:string
}




const initialItems: TreeItem[] = [
  {
    id:'testid1',
    label: "A",
    children: [
      {
        id:'testid2',
        label: "AA",
        children: [
          {
            id:'testi3',
            label: "AAA",
            children: [
              {
                id:'testid4',
                label: "AAAA",
                children: [
                  {
                    id:'testid54',
                    label: "AAAAA",
         
                    children: [{
                      id:'testid545',
                      label: "childs aaaa",
           
                      children: [
                        {
                          id:'testid67',
                          label: "childs> a",
               
                          children: [],
                        },    
                        {
                          id:'testid778',
                          label: "childs  > aa",
               
                          children: [
                            {
                              id:'testid221',
                              label: "childs> aaa",
                   
                              children: [
                                {
                                  id:'testid5446',
                                  label: "childs > b",
                       
                                  children: [
                                    {
                                      id:'testid878',
                                      label: "bb > bb",
                           
                                      children: [
                                        {
                                          id:'testid354',
                                          label: "bbb > bbb",
                               
                                          children: [
                                            {
                                              id:'testid454',
                                              label: "bbbb > bbbb",
                                   
                                              children: [],
                                            }, 
                                          ],
                                        }, 
                                      ],
                                    }, 
                                  ],
                                }, 
                              ],
                            }, 
                          ],
                        }, 
                      ],
                    }, {
                      id:'testid993',
                      label: "childs 2 aaaaaa",
           
                      children: [],
                    }, ],
                  },
                  {
                    id:'testid633',
                    label: "BBBBB",
                    children: [],
                  },
                ],
              },
              {
                id:'testid5',
                label: "BBBB",
                children: [
                  {
                    id:'testid6',
                    label: "AAAAA",
                    children: [],
                  },
                  {
                    id:'testid7',
                    label: "BBBBB",
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id:'testid8',
            label: "BBB",
            children: [
              {
                id:'testid9',
                label: "AAAA",
                children: [
                  {
                    id:'testid10',
                    label: "AAAAA",
                    children: [],
                  },
                  {
                    id:'testid11',
                    label: "BBBBB",
                    children: [],
                  },
                ],
              },
              {
                id:'testid12',
                label: "BBBB",
                children: [
                  {
                    id:'testid13',
                    label: "AAAAA",
                    children: [],
                  },
                  {
                    id:'testid14',
                    label: "BBBBB",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id:'testid15',
        label: "BB",
        children: [
          {
            id:'testid16',
            label: "AAA",
            children: [
              {
                id:'testid17',
                label: "AAAA",
                children: [
                  {
                    id:'testid18',
                    label: "AAAAA",
                    children: [],
                  },
                  {
                    id:'testid19',
                    label: "BBBBB",
                    children: [],
                  },
                ],
              },
              {
                id:'testid20',
                label: "BBBB",
                children: [
                  {
                    id:'testid21',
                    label: "AAAAA",
                    children: [],
                  },
                  {
                    id:'testid22',
                    label: "BBBBB",
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id:'testid23',
            label: "BBB",
            children: [
              {
                id:'testid24',
                label: "AAAA",
                children: [
                  {
                    id:'testid25',
                    label: "AAAAA",
                    children: [],
                  },
                  {
                    id:'testid26',
                    label: "BBBBB",
                    children: [],
                  },
                ],
              },
              {
                id:'testid27',
                label: "BBBB",
                children: [
                  {
                    id:'testid28',
                    label: "AAAAA",
                    children: [],
                  },
                  {
                    id:'testid29',
                    label: "BBBBB",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

]


// This is gross for a few reasons, not the least of which:
// 1. having no mechanism to short-circuit if the edit has finished with the subtree it cares about
// 2. makes a full copy of subtrees that had/needed no edits
// 3. is recursive instead of using an explicit stack, so it can stackoverflow
// 4. preorder traversal instead of postorder traversal, for no particular reason
export function mapForest(forest: TreeItem[],fn: (node: TreeItem[], parent: TreeItem | null) => TreeItem[],parent: TreeItem | null = null): TreeItem[] {


  return fn(forest, parent).flatMap(tree => ({
    ...tree, children: mapForest(tree.children, fn, tree)
  }));
}

export function removeItem(root: TreeItem[], id: UniqueIdentifier): TreeItem[] {
  return mapForest(root, forest => forest.filter(t => t.id !== id));
}

export function mapForestByTree(
  forest: TreeItem[],
  fn: (node: TreeItem) => TreeItem
): TreeItem[] {
  return mapForest(forest, child => child.map(fn));
}

export function setProperty<T extends keyof TreeItem>(items: TreeItem[],id: UniqueIdentifier,property: T, fn: (value: TreeItem[T]) => TreeItem[T]): TreeItem[] {
  return mapForestByTree(items, node => 
    node.id === id ? {...node, [property]: fn(node[property]) } 
    : node
  );
}

export function forestWithSubtreeInsertedAfter(
  root: TreeItem[],
  addend: TreeItem,
  sibling: TreeItem
): TreeItem[] {
  return mapForest(root, children => {
    const sibIndex = children.findIndex(({id}) => id === sibling.id);
    if (sibIndex === -1) {
      // not in this subtree, act as identity function
      return children;
    }

    const newChildren = children.slice();
    newChildren.splice(sibIndex + 1, 0, addend);
    return newChildren;
  });
}

export function forestWithSubtreeInsertedFirstInside(
  forest: TreeItem[],
  addend: TreeItem,
  parent: TreeItem | null
): TreeItem[] {
  return mapForest(forest, (children, node) => {
    if (node?.id === parent?.id) {
      return node?.collapsed ? [...children, addend] : [addend, ...children];
    }
    return children;
  });
}

export function insertSubtreeAt(forest: TreeItem[], addend: TreeItem, destination: TreePosition<TreeItem>): TreeItem[] {
  if (destination.kind === 'after') {
    return forestWithSubtreeInsertedAfter(forest, addend, destination.sibling);

  } else if (destination.kind === 'firstChildOf') {
    return forestWithSubtreeInsertedFirstInside(forest, addend, destination.parent);

  } else {
    // assert destination.kind must be one of the above with types
    ((x: never) => {})(destination);
    throw new Error("destination.kind must be one of the above");
  }
}

export function getSubtreeSize(item: TreeItem): number {
  return sumBy(item.children, c => getSubtreeSize(c)) + 1;
}

function flatten(
  items: TreeItem[],
  depth = 0
): FlattenedItem<TreeItem>[] {
  return items.reduce<FlattenedItem<TreeItem>[]>((acc, item) => {
    return [
      ...acc,
      {id: item.id, collapsed: item.collapsed, item, depth},
      ...flatten(item.children, depth + 1),
    ];
  }, []);
}

export function flattenTree(items: TreeItem[]): FlattenedItem<TreeItem>[] {
  return flatten(items);
}

function App() {
  const [items, setItems] = React.useState(() => initialItems);
  const [isAdditem, setAdditem] = React.useState(false)
  const Refinput = useRef<any>()
  const flattenedTree = React.useMemo(() => {
    return flattenTree(items);
  }, [items]);


  const AddnewItemArray = (event:React.KeyboardEvent<HTMLInputElement | EventTarget>) =>{

    if (event.code != 'Enter') return;

    const pusher = ()=>{
      return[
         ...initialItems,
         {label:Refinput.current.value,id:Math.floor(Math.random() * 7323).toString(),children:[]}
      ]
     }

     setItems(pusher)
    setAdditem(false)


  }


  return (
<ItemContext.Provider value={[items, setItems]}>

<div className={Styles.Wrapper_App}>

<main style={{
      position: 'relative',
      minHeight: '100vh',
      outline: 'none',
      width:'300px'
    }}>
      
        {/* <li className='TreeIttem' style={{zIndex:999,top:0,position:'sticky'}}>root</li> */}

       <div>
       <SortableTree 
            collapsible indicator removable
            flattenedTree={flattenedTree}
            getLabelStringForItem={item => item.id}
            getLabelForItem={item => item.label} // label
            getKeyForItem={item => item.id}
            hasChildren={item => item.children.length > 0}
            getSubtreeSize={getSubtreeSize}
            handleRemove={id => setItems(items => removeItem(items, id))}
            handleCollapse={id => setItems(items => setProperty(items, id, 'collapsed', c => !c))}
            handleMove={(activeItem, destination) => {
              setItems(items => insertSubtreeAt(
                removeItem(items, activeItem.id),
                activeItem,
                destination
              ));
            }}
          />
       </div>
       

        <div id="inputarrowitem">

        {isAdditem ?  <input  className={Styles.AcctiveInputAddnewitemFirstArray} ref={Refinput} onKeyUp={(e)=>AddnewItemArray(e)} placeholder="Enter item value"/> :   
        
        <div  className={isAdditem ? Styles.AcctiveInputAddnewitemFirstArray : Styles.disabelInputAddnewitemFirstArray} onClick={()=> setAdditem(true)}  >
        
        AddItem <Add/>
        
        </div> }
          </div>
      

    </main>

</div>

</ItemContext.Provider>
  );
}

export default App;
