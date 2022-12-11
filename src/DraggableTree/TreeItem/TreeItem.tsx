import React, { CSSProperties, useState, useContext, useRef } from 'react';
import classNames from 'classnames';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { iOS } from '../utils/utilities';
import { Action } from '../Action/Action';
import { Handle } from '../Action/Handle';
import { Remove } from '../Action/Remove';
import styles from './TreeItem.module.css';
import { ItemContext } from '../../context';
import { ActionButton, Item, Keyboard, Menu, MenuTrigger, Text } from '@adobe/react-spectrum';
import { EditIcon } from '../../core/icons/edit';
import { Treepoint } from '../../core/icons/Treepoint';
import { Delete } from '../../core/icons/delete';
import { Add } from '../../core/icons/Add';
import { ArrowRight } from '../../core/icons/ArrowRight';
export interface TreeItemProps {
  id: UniqueIdentifier;
  label: React.ReactNode;
  childCount?: number;
  clone?: boolean;
  depth: number;
  indentationWidth: number;
  indicator?: boolean;
  collapsed?: boolean;
  onCollapse?(): void;
  onRemove?(): void;
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  isSorting || wasDragging ? false : true;

export function SortableTreeItem(props: TreeItemProps) {
  const {
    id,
    childCount,
    clone,
    depth,
    indentationWidth,
    indicator,
    collapsed,
    label,
    onCollapse,
    onRemove,
  } = props;


  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const [isEditable, setEditable] = useState(false);
  const [isAdditem, setAdditem] = useState(false)
  const [currentLabel, setCurrentLabel] = useState(label);
  const [items, setItems] = useContext(ItemContext)!;
  const RefInputItem = useRef<any>()
  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCurrentLabel(() => event.target.value);
  }

  function handleOnKeyUp(event: React.KeyboardEvent<HTMLInputElement | EventTarget>, id: UniqueIdentifier) {
    if (event.code != 'Enter') return;

    let updatedItems = update(items, id, { label: String(currentLabel) });


    setItems(() => updatedItems);

    console.log(updatedItems);

    setEditable(false);
  }

  const Handelemenuoperation = (evant: string | any) => {
    console.log(evant, 'ev');
    if (evant === "Edite") {
      setEditable(true)
    }
    if (evant === "Add") {
      setAdditem(true)
    }

  }
  const AddNewItem = (event: React.KeyboardEvent<HTMLInputElement | EventTarget>, id: UniqueIdentifier) => {

    if (event.code != 'Enter') return;

    console.log(id, RefInputItem.current.value);

    let updatedItems = Additem(items, id, { label: RefInputItem.current.value });


    setItems(() => updatedItems);
    setAdditem(false)




  }
  let root = document.getElementById('inputarrowitem')
  // root?.style.setProperty('--paddingLastInput', (depth * 10) + "px");
  if (root?.style) {
    root.style.paddingLeft = `${depth * 10}px`
  }

  return (
    <>

<div
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          isDragging && styles.ghost,
          indicator && styles.indicator,
          iOS && styles.disableSelection,
          isSorting && styles.disableInteraction
        )}
        ref={setDroppableNodeRef}
        // style={{'--spacing': `${indentationWidth * depth}px`,} as React.CSSProperties}
        style={{  paddingLeft: depth * 10, zIndex: 100 - depth, top: onCollapse ? depth * 31 : '' , position: onCollapse ? 'sticky' : 'relative' } as React.CSSProperties}
      >

        <div className={styles.TreeItem} ref={setDraggableNodeRef} style={style}>
          <Handle {...attributes} {...listeners} />
          {onCollapse && (
            <Action
              onClick={onCollapse}
              className={classNames(
                styles.Collapse,
                collapsed && styles.collapsed
              )}
            >
              {collapseIcon}
              {/* <ArrowRight/> */}
            </Action>
          )}
          {isEditable ? <input type="text" className={styles.Text} value={String(currentLabel)} onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => handleOnKeyUp(e, id)} onChange={handleOnChange} /> : <span className={styles.Text} onClick={() => setEditable(!isEditable)}>{currentLabel} dep  {depth}</span>}
          {!clone && onRemove && <Remove onClick={onRemove} />}
          <MenuTrigger>


            <ActionButton aria-label="Actions" staticColor="white" UNSAFE_className={classNames(styles.Treepointcontainer)} >
              <Treepoint />
            </ActionButton>

            <Menu UNSAFE_className={classNames(styles.MenuItems)} onAction={(event: string | any) => Handelemenuoperation(event)}>
              <Item key="Edite" textValue="Edite">
                <Text UNSAFE_className={classNames(styles.Itemmenu_Container)}>  <EditIcon />  Edite</Text>
              </Item >
              <Item key="Delete" textValue="Delete">
                <Text UNSAFE_className={classNames(styles.Itemmenu_Container)} >   {!clone && onRemove && <Remove onClick={onRemove} />}  Delete </Text>
              </Item>
              <Item key="Add" textValue="Add">
                <Text UNSAFE_className={classNames(styles.Itemmenu_Container)} >   <Add />  Add item</Text>
              </Item>
            </Menu>
          </MenuTrigger>


          {/* <Remove onClick={onRemove} /> */}
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>

      </div>


      {/* {isAdditem && <input autoFocus ref={RefInputItem} type={'text'} onKeyUp={(e) => AddNewItem(e, id)} className={classNames(styles.InputNew_Item)} placeholder="Enter item name" />} */}

    </>
  );

}

function update(data: any, id: any, value: { label: string; }) {
  let updated = false;

  const map = (item: any) => {
    if (updated)
      return item;

    if (item.id === id) {
      updated = true;

      return { ...item, ...value }; //rename item

      // return { ...item, childs: [...item.childs, { name: "appel", id: "kive" }] }; // add new item
    }

    if (item.children)
      return {
        ...item,
        children: item.children.map(map),
      };

  };


  return data.map(map);
}



function Additem(data: any, id: any, value: { label: string; }) {
  let updated = false;

  const map = (item: any) => {
    if (updated)
      return item;

    if (item.id === id) {
      updated = true;
      return { ...item, children: [...item.children, { label: value.label, id: Math.floor(Math.random() * 7323).toString(), children: [] }] }; // add new item

    }

    if (item.children)
      return {
        ...item,
        children: item.children.map(map),
      };

  };


  return data.map(map);
}


const collapseIcon = (
  <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 41">
    <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  </svg>
);
