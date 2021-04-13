// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

/*
const testSchema = `{
  "Gender": {
    "_enum": {
      "Male": null,
      "Female": null
    }
  },
  "Trait": {
    "_enum": {
      "Black Lipstick": null,
      "Smile": null
    }
  },
  "root": {
    "Gender": "Gender",
    "Traits": "Vec<Trait>",
    "ImageHash": "Bytes"
  }
}`;
 */

// '{"Gender":"Female", "Traits":["Smile"], "ImageHash": "123123"}'
/*
const exampleJson = [
  {
    count: 'array',
    name: 'Trait',
    pluralName: 'Traits',
    type: '_enum',
    values: ['Black Lipstick', 'Smile']
  },
  {
    count: 'single',
    name: 'Gender',
    pluralName: '',
    type: '_enum',
    values: ['Male', 'Female']
  },
  {
    count: 'single',
    name: 'ImageHash',
    pluralName: '',
    type: 'Bytes',
    values: []
  }
];
*/
export type AttributeTypes = 'Bytes' | '_enum';
export type CountType = 'single' | 'array';

export type AttributeItemType = {[key: string]: string | {[key: string]: string} | {'_enum': {[key: string]: null}}};

export type ScaleJsonType = { root: {[key: string]: string }, [key: string]: AttributeItemType }

export type AttributeType = {
  count: CountType;
  name: string;
  pluralName: string;
  type: AttributeTypes;
  values: string[];
};

export const convertScaleAttrToJson = (scaleAttrStr: string): AttributeType[] => {
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

  return [];
};

export const convertScaleAttrFromJson = (jsonStr: AttributeType[]): string => {
  let parentObj: AttributeItemType = {};
  const rootObj: {[key: string]: string} = {};

  try {
    jsonStr.forEach((jsonStrItem: AttributeType) => {
      if (jsonStrItem.type === 'Bytes') {
        rootObj[jsonStrItem.name] = 'Bytes';
      } else if (jsonStrItem.type === '_enum') {
        const objValues = jsonStrItem.values.map((value: string) => [value, null]);

        console.log('objValues', objValues);

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

  return '';
};
