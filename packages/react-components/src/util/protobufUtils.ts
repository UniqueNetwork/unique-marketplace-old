// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Root, Type } from 'protobufjs';

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

function defineMessage () {
  return Root.fromJSON({
    nested: {
      onchainmetadata: {
        nested: {
          Gender: {
            options: {
              Female: '{"cn": "女性", "en": "Female", "ru": "Женщина"}',
              Male: '{"cn": "男性", "en": "Male", "ru": "Мужчина"}'
            },
            values: {
              Female: 1,
              Male: 0
            }
          },
          NFTMeta: {
            fields: {
              gender: {
                id: 1,
                rule: 'required',
                type: 'Gender'
              },
              imageHash: {
                id: 2,
                rule: 'required',
                type: 'string'
              },
              name: {
                id: 3,
                type: 'string'
              },
              traits: {
                id: 4,
                rule: 'repeated',
                type: 'PunkTrait'
              }
            }
          },
          PunkTrait: {
            options: {
              ASIAN_EYES: '{"cn": "亚洲眼", "en": "Asian Eyes", "ru": "Азиатский тип глаз"}',
              BLACK_LIPSTICK: '{"cn": "黑唇", "en": "Black Lipstick", "ru": "Чёрная помада"}',
              NOSE_RING: '{"cn": "鼻环", "en": "Nose Ring", "ru": "Пирсинг в носу"}',
              PURPLE_LIPSTICK: '{"cn": "紫唇", "en": "Purple Lipstick", "ru": "Фиолетовая помада"}',
              RED_LIPSTICK: '{"cn": "红唇", "en": "Red Lipstick", "ru": "Красная помада"}',
              SMILE: '{"cn": "笑脸", "en": "Smile", "ru": "Улыбка"}',
              SUNGLASSES: '{"cn": "太阳镜", "en": "Sunglasses", "ru": "Солнечные очки"}',
              TEETH_SMILE: '{"cn": "露齿笑脸", "en": "Teeth Smile", "ru": "Улыбка с зубами"}'
            },
            values: {
              ASIAN_EYES: 6,
              BLACK_LIPSTICK: 0,
              NOSE_RING: 5,
              PURPLE_LIPSTICK: 4,
              RED_LIPSTICK: 1,
              SMILE: 2,
              SUNGLASSES: 7,
              TEETH_SMILE: 3
            }
          }
        }
      }
    }
  });
}

function serializeNft (payload: { [key: string]: number | number[] | string }) {
  const root = defineMessage();
  const NFTMeta = root.lookupType('onchainmetadata.NFTMeta');

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
  const NFTMeta = root.lookupType('onchainmetadata.NFTMeta');

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
