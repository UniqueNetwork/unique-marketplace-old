// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Root, Type } from 'protobufjs';

import protobufJsonExample from './protobufJsonExample';

export type FieldType = 'string' | 'enum';

export type FieldRuleType = 'optional' | 'required' | 'repeated';

export type AttributeItemType = {
  id: number,
  fieldType: FieldType;
  name: string;
  rule: FieldRuleType;
  values: string[];
}

export type ProtobufAttributeType = {
  nested: {
    onChainMetaData: {
      nested: {
        [key: string]: {
          fields?: {
            [key: string]: {
              id: number;
              rule: FieldRuleType;
              type: string;
            }
          }
          options?: { [key: string]: string };
          values?: { [key: string]: number };
        }
      }
    }
  }
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

function defineMessage () {
  return Root.fromJSON(protobufJsonExample);
}

function serializeNft (payload: { [key: string]: number | number[] | string }) {
  const root = defineMessage();
  const NFTMeta = root.lookupType('onChainMetaData.NFTMeta');

  // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
  const errMsg = NFTMeta.verify(payload);

  if (errMsg) {
    throw Error(errMsg);
  }

  // Create a new message
  const message = NFTMeta.create(payload);

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  return NFTMeta.encode(message).finish();
}

function convertEnumToString (value: string, key: string, NFTMeta: Type, locale: string) {
  let result = value;

  console.log('Serialized value', value, 'key', key, 'NFTMeta', NFTMeta, 'NFTMeta?.fields[key]?.resolvedType?', NFTMeta?.fields[key]?.resolvedType);

  try {
    const options = NFTMeta?.fields[key]?.resolvedType?.options as {[key: string]: string};
    const valueJsonComment = options[value];
    const translationObject = JSON.parse(valueJsonComment) as {[key: string]: string};

    if (translationObject && (translationObject[locale])) {
      result = translationObject[locale];
    }
  } catch (e) {
    console.log('Error parsing schema when trying to convert enum to string: ', e);
  }

  return result;
}

function deserializeNft (buffer: Uint8Array, locale: string) {
  const root = defineMessage();

  // Obtain the message type
  const NFTMeta = root.lookupType('onChainMetaData.NFTMeta');

  // Decode a Uint8Array (browser) or Buffer (node) to a message
  const message = NFTMeta.decode(buffer);

  // Maybe convert the message back to a plain object
  const objectItem = NFTMeta.toObject(message, {
    arrays: true, // populates empty arrays (repeated fields) even if defaults=false
    bytes: String, // bytes as base64 encoded strings
    defaults: true, // includes default values
    enums: String, // enums as string names
    longs: String, // longs as strings (requires long.js)
    objects: true, // populates empty objects (map fields) even if defaults=false
    oneofs: true
  });

  for (const key in objectItem) {
    if (NFTMeta?.fields[key]?.resolvedType?.constructor.name === 'Enum') {
      if (Array.isArray(objectItem[key])) {
        const item = objectItem[key] as string[];

        item.forEach((value: any) => {
          objectItem[key] = convertEnumToString(value, key, NFTMeta, locale);
        });
      } else {
        objectItem[key] = convertEnumToString(objectItem[key], key, NFTMeta, locale);
      }
    }
  }

  return objectItem;
}

export function initProtobuf () {
  // Exemplary payload
  const payload = {
    gender: Gender.Female,
    imageHash: 'hash',
    name: 'TokenName',
    traits: [PunkTrait.PURPLE_LIPSTICK, PunkTrait.NOSE_RING, PunkTrait.ASIAN_EYES, PunkTrait.SUNGLASSES]
  };

  const buffer = serializeNft(payload);

  console.log('Serialized buffer: ', buffer);

  let deserializedObject = deserializeNft(buffer, 'ru');

  console.log('deserializedObject RUSSIAN: ', deserializedObject);

  deserializedObject = deserializeNft(buffer, 'en');
  console.log('deserializedObject ENGLISH: ', deserializedObject);
}

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
