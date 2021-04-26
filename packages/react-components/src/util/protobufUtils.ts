// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

// These "enums" are only used when NFTs are created, not when they are displayed

export type AttributeItemType = {[key: string]: string | {[key: string]: string} | {'_enum': {[key: string]: null}}};

export type ScaleJsonType = { root: {[key: string]: string }, [key: string]: AttributeItemType }

export type AttributeTypes = 'Bytes' | '_enum';
export type CountType = 'single' | 'array';

export type ProtobufAttributeType = {
  count: CountType;
  name: string;
  pluralName: string;
  type: AttributeTypes;
  values: string[];
}

const Gender = {
  Female: 1,
  Male: 0
};

const PunkTrait = {
  ASIAN_EYES: 6,
  BLACK_LIPSTICK: 0,
  NOSE_RING: 5,
  PURPLE_LIPSTICK: 4,
  RED_LIPSTICK: 1,
  SMILE: 2,
  SUNGLASSES: 7,
  TEETH_SMILE: 3
};

export const convertProtobufAttrToJson = (scaleAttrStr: string): ProtobufAttributeType[] => {
  /*
  try {
    const jsonObj: ScaleJsonType = JSON.parse(scaleAttrStr) as ScaleJsonType;

    return Object.keys(jsonObj.root).map((key: string) => {
      const resArray = /^Vec<(.*)>$/.exec(jsonObj.root[key]);
      const isBytes = jsonObj.root[key] === 'Bytes';

      return {
        count: resArray !== null ? 'array' : 'single',
        name: resArray !== null ? resArray[1] : key,
        pluralName: resArray !== null ? key : '',
        type: isBytes ? 'Bytes' : '_enum',
        values: resArray !== null ? Object.keys(jsonObj[resArray[1]]._enum) : isBytes ? [] : Object.keys(jsonObj[key]._enum)
      };
    });
  } catch (e) {
    console.log('convertScaleAttrToJson error', e);
  }
   */

  return [];
};

export const convertProtobufAttrFromJson = (jsonStr: ProtobufAttributeType[]): string => {
  /* let parentObj: AttributeItemType = {};
  const rootObj: {[key: string]: string} = {};

  try {
    jsonStr.forEach((jsonStrItem: AttributeType) => {
      if (jsonStrItem.type === 'Bytes') {
        rootObj[jsonStrItem.name] = 'Bytes';
      } else if (jsonStrItem.type === '_enum') {
        const objValues = jsonStrItem.values.map((value: string) => [value, null]);

        parentObj[jsonStrItem.name] = {
          _enum: Object.fromEntries(objValues) as {[key: string]: null}
        };

        if (jsonStrItem.count === 'single') {
          rootObj[jsonStrItem.name] = jsonStrItem.name;
        } else if (jsonStrItem.count === 'array') {
          rootObj[jsonStrItem.pluralName] = `Vec<${jsonStrItem.name}>`;
        }
      }
    });

    parentObj = {
      ...parentObj,
      root: rootObj
    };

    return JSON.stringify(parentObj);
  } catch (e) {
    console.log('convertScaleAttrFromJson error', e);
  }
   */
  return '';
};
